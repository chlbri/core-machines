import dayjs from 'dayjs';
import produce from 'immer';
import { mockFn } from 'jest-mock-extended';
import { generateAsyncMachineTest } from 'test-machine';
import { EventObject, StateMachine, StateValue, Typestate } from 'xstate';
import { db, mockDAO } from '../.config/test';
import createListMachine from './listMachine';

// import { keys } from 'ts-transformer-keys';

export const machine = createListMachine(mockDAO, { col: '' });

const modif = { login: 'modifiedLogin' };

const manyData = [
  {
    login: 'login6',
    firstName: 'gilbert',
  },
  {
    login: 'login7',
    firstName: 'claudel',
  },
  {
    login: 'login8',
    firstName: 'bruno',
  },
];

// type TestContext = {
//   state?: StateValue;
//   context?: MultiContext<DataMock>;
//   beforeAll?: TestConfig;
//   afterAll?: TestConfig;
// };

// type TestContexts = {
//   error: TestContext;
//   internalError: TestContext;
//   success: TestContext;
//   event: Event<MultiEvent>;
// };

// const eFETCH: TestContexts = {
//   event: 'FETCH',
//   error: {},
//   internalError: {},
//   success: {},
// };

// const eventDelete: Event<MultiEvent<DataMock>> = 'delete';
// const eventRemove: Event<MultiEvent<DataMock>> = 'remove';
// const eventRetrieve: Event<MultiEvent<DataMock>> = 'retrieve';
// const eventRefetch: Event<MultiEvent<DataMock>> = 'refetch';

// const eventFetchSingle: Event<MultiEvent<DataMock>> = {
//   type: 'fetch',
//   id: 'id1',
// };

type Selector<TC, TE extends EventObject, TT extends Typestate<TC>> = (
  machine: StateMachine<TC, any, TE, TT>
) => any;

type ExistProps<TC, TE extends EventObject, TT extends Typestate<TC>> = {
  identity: string;
  selector: Selector<TC, TE, TT>;
  value: StateValue;
  machine: StateMachine<TC, any, TE, TT>;
};

function exists<TC, TE extends EventObject, TT extends Typestate<TC>>({
  identity,
  selector,
  machine,
  value,
}: ExistProps<TC, TE, TT>) {
  return it(`${identity} "${value.toString()}" shoulds exist`, () => {
    const actual = Object.keys(selector(machine));
    expect(actual).toContainEqual(value);
  });
}

function stateExists(state: StateValue) {
  return exists({
    identity: 'State',
    machine,
    value: state,
    selector: (machine) => machine.states,
  });
}

function actionExists(action: string) {
  return exists({
    identity: 'Action',
    machine,
    value: action,
    selector: (machine) => machine.options.actions,
  });
}

function guardExists(guard: string) {
  return exists({
    identity: 'Guerd',
    machine,
    value: guard,
    selector: (machine) => machine.options.guards,
  });
}

function serviceExists(service: string) {
  return exists({
    identity: 'Service',
    machine,
    value: service,
    selector: (machine) => machine.options.services,
  });
}

describe('Existence Test', () => {
  it('`createMachine` should exist', () => {
    expect(createListMachine).toBeDefined();
    expect(createListMachine).toBeInstanceOf(Function);
  });
  it('It creates a machine', () => {
    const actual = Object.keys(machine);

    expect(actual).toContain('states');
    expect(actual).toContain('id');
    expect(actual).toContain('__xstatenode');
    expect(actual).toContain('__cache');
    expect(actual).toContain('config');
    expect(actual).toContain('_transient');
  });
  it('It creates initial context', () => {
    const actual = machine.context;
    const expected = {
      iterator: 0,
      needToFecth: 0,
      col: '',
      pageSize: 20,
      maxFromDatabase: 1000,
      currentPage: 0,
    };
    expect(actual).toEqual(expected);
  });

  describe('States', () => {
    [
      'idle',
      'fetching',
      'refetching',
      'deleting',
      'removing',
      'success',
      'error',
      'internalError',
    ].forEach(stateExists);
  });

  describe('Actions', () => {
    [
      'iterate',
      'goToFirstPage',
      'goToLastPage',
      'goToNextPage',
      'goToPrevPage',
      'assign_selectedValues',
      'assign_totalPages',
      'assign_total',
      'assign_pageSize',
      'assign_canGoToPrevPage',
      'assign_totalExceedDataBaseTotalError',
      'assign_canNextFetch',
      'fetchNextStart',
      'fetchNextEnd',
      'assign_canGoToNextPage',
      'assign_error',
    ].forEach(actionExists);
  });

  describe('Guards', () => {
    [
      'canNextFetch',
      'canGoToNextPage',
      'canGoToPrevPage',
      'nextFetching',
      'targetPageIsWithinBounds',
    ].forEach(guardExists);
  });

  describe('Services', () => {
    ['fetch', 'refetch', 'delete', 'remove'].forEach(serviceExists);
  });
});

describe('Actions', () => {
  describe('FETCH', () => {
    generateAsyncMachineTest({
      machine: createListMachine(
        produce(mockDAO, (draft) => {
          draft.readMany = mockFn<typeof mockDAO.readMany>().mockRejectedValue(
            new Error()
          );
        }),
        { col: '' }
      ),
      events: ['FETCH'],
      values: ['idle', 'fetching', 'error'],
      timeout: 100,
      invite: 'The crud `readMany` method returns error',
    });
    generateAsyncMachineTest({
      machine: createListMachine(
        produce(mockDAO, (draft) => {
          draft.readMany =
            mockFn<typeof mockDAO.readMany>().mockResolvedValue(db);
          draft.count = mockFn<typeof mockDAO.count>().mockRejectedValue(
            new Error()
          );
        }),
        { col: '' }
      ),
      events: ['FETCH'],
      values: ['idle', 'fetching', 'error'],
      timeout: 100,
      invite: 'The crud `count` method returns error',
    });
    generateAsyncMachineTest({
      machine: createListMachine(
        produce(mockDAO, (draft) => {
          draft.readMany = mockFn<typeof mockDAO.readMany>().mockResolvedValue(
            []
          );
          draft.count = mockFn<typeof mockDAO.count>().mockResolvedValue(26);
        }),
        { col: '' }
      ),
      events: ['FETCH'],
      values: ['idle', 'fetching', 'internalError'],
      timeout: 100,

      invite: 'Data is empty',
    });

    describe('It has data', () => {
      const mock = produce(mockDAO, (draft) => {
        draft.readMany =
          mockFn<typeof mockDAO.readMany>().mockResolvedValue(db);

        draft.count = mockFn<typeof mockDAO.count>().mockResolvedValue(26);
      });
      generateAsyncMachineTest({
        machine: createListMachine(mock, { col: '' }),
        events: ['FETCH'],
        values: ['idle', 'fetching', 'success'],
        timeout: 100,
        // subscribers: [
        //   (state) => {
        //     console.log('state.context', '=>', state.context);
        //   },
        // ],
      });
      it('``readMany`` shoulds be called', () => {
        expect(mock.readMany).toHaveBeenCalledTimes(1);
      });
      it('``count`` shoulds be called', () => {
        expect(mock.count).toHaveBeenCalledTimes(1);
      });
    });
  });
  describe('PREVIOUS', () => {
    const mock = produce(mockDAO, (draft) => {
      draft.readMany = mockFn<typeof mockDAO.readMany>().mockResolvedValue(db);
      draft.count = mockFn<typeof mockDAO.count>().mockResolvedValue(26);
    });
    generateAsyncMachineTest({
      machine: createListMachine(mock, { col: '' }),
      events: ['FETCH', 'PREVIOUS'],
      values: ['idle', 'fetching', 'success', 'internalError'],
      timeout: 100,
      invite: "It doesn't have data",
    });
    generateAsyncMachineTest({
      machine: createListMachine(mock, { col: '' }),
      events: ['FETCH', 'PREVIOUS'],
      values: ['idle', 'fetching', 'success', 'internalError'],
      timeout: 100,
      initialContext: { current: db },

      invite: "It doesn't have previous page",
    });
    generateAsyncMachineTest({
      machine: createListMachine(mock, { col: '' }),
      events: ['FETCH', 'PREVIOUS'],
      values: ['idle', 'fetching', 'success', 'success'],
      timeout: 100,
      initialContext: { canGoToPrevPage: true },
      invite: 'It has previous page',
    });
  });
  describe('NEXT', () => {
    const mock = produce(mockDAO, (draft) => {
      draft.readMany = mockFn<typeof mockDAO.readMany>().mockResolvedValue(db);
      draft.count = mockFn<typeof mockDAO.count>().mockResolvedValue(26);
    });
    generateAsyncMachineTest({
      machine: createListMachine(mock, { col: '' }),
      events: ['NEXT'],
      values: ['success', 'internalError'],
      timeout: 100,
      initialState: 'success',
      invite: "It doesn't have data",
    });
    generateAsyncMachineTest({
      machine: createListMachine(mock, { col: '' }),
      events: ['FETCH', 'NEXT'],
      values: ['idle', 'fetching', 'success', 'internalError'],
      timeout: 100,
      initialContext: { current: db },

      invite: "It doesn't have next page",
    });

    // const ___mock = createListMachine(mock, { col: '' });

    generateAsyncMachineTest({
      machine: createListMachine(mock, { col: '' }),
      events: ['NEXT'],
      values: ['success', 'fetching', 'success'],
      timeout: 100,
      initialState: 'success',
      initialContext: { canNextFetch: true, current: db },
      invite: 'It have next page online only',
      // subscribers: [
      //   (state) => {
      //     console.log('state', '=>', state.value);
      //   },
      // ],
    });
    generateAsyncMachineTest({
      machine: createListMachine(mock, { col: '' }),
      events: ['NEXT'],
      values: ['success', 'success'],
      timeout: 100,
      initialState: 'success',
      initialContext: { canGoToNextPage: true },
      invite: 'It have next page',
      // subscribers: [
      //   (state) => {
      //     console.log('state', '=>', state.value);
      //   },
      // ],
    });
  });

  describe('DELETE', () => {
    const __db = [...db];
    const errorMock = produce(mockDAO, (draft) => {
      draft.readMany =
        mockFn<typeof mockDAO.readMany>().mockResolvedValue(__db);
      draft.count = mockFn<typeof mockDAO.count>().mockResolvedValue(26);
    });
    const successMock = produce(mockDAO, (draft) => {
      draft.readMany =
        mockFn<typeof mockDAO.readMany>().mockResolvedValue(__db);
      draft.count = mockFn<typeof mockDAO.count>().mockResolvedValue(26);
      draft.deleteOneById = mockFn<
        typeof mockDAO.deleteOneById
      >().mockImplementation(async (id) => id);
    });
    const successAndFetchMock = produce(mockDAO, (draft) => {
      draft.readMany =
        mockFn<typeof mockDAO.readMany>().mockResolvedValue(__db);
      draft.count = mockFn<typeof mockDAO.count>().mockResolvedValue(26);
      draft.deleteOneById = mockFn<
        typeof mockDAO.deleteOneById
      >().mockImplementation(async (id) => {
        const index = __db.findIndex((data) => data.id === id);
        __db.length = 0;
        if (index !== -1)
          __db.push(
            ...produce(db, (draft) => {
              (draft[index] as any).deletedAt = new Date();
            })
          );
        return id;
      });
    });

    const idDelete = 'a06fcaca-fbdf-4af3-9dd0-4aa11d44530c' as const;

    const deleteEvent = {
      type: 'DELETE',
      id: idDelete,
    } as const;

    generateAsyncMachineTest({
      machine: createListMachine(errorMock, { col: '' }),
      events: ['FETCH', deleteEvent],
      values: ['idle', 'fetching', 'success', 'deleting', 'error'],
      timeout: 100,
      invite: '`Delete` method not implemented or return error',
      // subscribers: [
      //   (state) => {
      //     console.log('state', '=>', state.value);
      //   },
      // ],
    });
    generateAsyncMachineTest({
      machine: createListMachine(successMock, { col: '' }),
      events: ['FETCH', deleteEvent],
      values: ['idle', 'fetching', 'success', 'deleting', 'success'],
      timeout: 100,
      invite: '`Delete` method returned good id',
    });
    generateAsyncMachineTest({
      machine: createListMachine(successAndFetchMock, { col: '' }),
      events: ['FETCH', deleteEvent, 'FETCH'],
      values: [
        'idle',
        'fetching',
        'success',
        'deleting',
        'success',
        'fetching',
        'success',
      ],
      timeout: 100,
      invite: '`Delete` method returned good id and fetch',
      contexts: [
        {
          iterator: 0,
          needToFecth: 0,
          col: '',
          pageSize: 20,
          currentPage: 0,
          maxFromDatabase: 1000,
        },
        { iterator: 1 },
        { iterator: 2 },
        { iterator: 3 },
        { iterator: 4 },
        { iterator: 5 },
        { iterator: 6 },
      ],
      subscribers: [
        (state) => {
          console.log('state', '=>', state.value);
        },
      ],
    });
    it('data with the specific `id` shoulds be deleted', () => {
      const find = __db.find(({ id }) => id === idDelete);
      console.log('find', find);
      if (!find?.deletedAt) {
        expect(true).toBeFalsy();
      } else {
        expect(find.deletedAt).toBeBefore(dayjs().toDate());
      }
    });
    // beforeAll(() => {
    //   __db.length = 0;
    //   __db.push(...db);
    // });
    afterAll(() => {
      __db.length = 0;
      __db.push(...db);
    });
  });

  describe('REMOVE', () => {
    const __db = [...db];
    const errorMock = produce(mockDAO, (draft) => {
      draft.readMany =
        mockFn<typeof mockDAO.readMany>().mockResolvedValue(__db);
      draft.count = mockFn<typeof mockDAO.count>().mockResolvedValue(26);
    });
    const successMock = produce(mockDAO, (draft) => {
      draft.readMany =
        mockFn<typeof mockDAO.readMany>().mockResolvedValue(__db);
      draft.count = mockFn<typeof mockDAO.count>().mockResolvedValue(26);
      draft.removeOneById = mockFn<
        typeof mockDAO.removeOneById
      >().mockImplementation(async (id) => id);
    });

    const successAndFetchMock = produce(mockDAO, (draft) => {
      draft.readMany =
        mockFn<typeof mockDAO.readMany>().mockResolvedValue(__db);
      draft.count = mockFn<typeof mockDAO.count>().mockResolvedValue(26);
      draft.removeOneById = mockFn<
        typeof mockDAO.removeOneById
      >().mockImplementation(async (id) => {
        const index = __db.findIndex((data) => data.id === id);
        if (index !== -1) __db.splice(index, 1);
        return id;
      });
    });

    const idRemove = 'a06fcaca-fbdf-4af3-9dd0-4aa11d44530c' as const;

    const removeEvent = {
      type: 'REMOVE',
      id: idRemove,
    } as const;

    generateAsyncMachineTest({
      machine: createListMachine(errorMock, { col: '' }),
      events: ['FETCH', removeEvent],
      values: ['idle', 'fetching', 'success', 'removing', 'error'],
      timeout: 100,
      invite: '`Remove` method not implemented or return error',
      // subscribers: [
      //   (state) => {
      //     console.log('state', '=>', state.value);
      //   },
      // ],
    });

    generateAsyncMachineTest({
      machine: createListMachine(successMock, { col: '' }),
      events: ['FETCH', removeEvent],
      values: ['idle', 'fetching', 'success', 'removing', 'success'],
      timeout: 100,
      invite: '`remove` method returned good id',
    });

    generateAsyncMachineTest({
      machine: createListMachine(successAndFetchMock, { col: '' }),
      events: ['FETCH', removeEvent, 'FETCH'],
      values: [
        'idle',
        'fetching',
        'success',
        'removing',
        'success',
        'fetching',
        'success',
      ],
      timeout: 100,
      invite: '`remove` method returned good id and fetch',
      contexts: [
        {
          iterator: 0,
          needToFecth: 0,
          col: '',
          pageSize: 20,
          currentPage: 0,
          maxFromDatabase: 1000,
        },
        { iterator: 1 },
        { iterator: 2 },
        { iterator: 3 },
        { iterator: 4 },
        { iterator: 5 },
        { iterator: 6 },
      ],
      subscribers: [
        (state) => {
          console.log('state', '=>', state.value);
        },
      ],
    });

    it('data with the specific `id` shoulds be removed', () => {
      const find = __db.find(({ id }) => id === idRemove);
      expect(find).toBeUndefined();
    });

    afterAll(() => {
      __db.length = 0;
      __db.push(...db);
    });
  });
  // testAction('NEXT', eFETCH);
  // testAction('REFETCH', eFETCH);
  // testAction('GO_TO_TARGET_PAGE', eFETCH);
  // testAction('CHANGE_PAGE_SIZE', eFETCH);
  // testAction('REMOVE', eFETCH);
  // testAction('DELETE', eFETCH);
});
