import produce from 'immer';
import { mockFn } from 'jest-mock-extended';
import { generateAsyncMachineTest } from 'test-machine';
import {
  Event,
  EventObject,
  StateMachine,
  StateValue,
  Typestate,
} from 'xstate';
import { mockDAO, db } from '../.config/test';
import { DataMock } from '../.config/test/types';
// import { mockDAO } from '../.config/test/values';
import { MultiContext, MultiEvent } from '../types';
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

const oneData = manyData[0];

type TestConfig = { fn: () => any; timeout?: number | undefined };

type TestContext = {
  state?: StateValue;
  context?: MultiContext<DataMock>;
  beforeAll?: TestConfig;
  afterAll?: TestConfig;
};

type TestContexts = {
  error: TestContext;
  internalError: TestContext;
  success: TestContext;
  event: Event<MultiEvent>;
};

const eFETCH: TestContexts = {
  event: 'FETCH',
  error: {},
  internalError: {},
  success: {},
};

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
      'assignSelectedValues',
      'totalPages',
      'total',
      'pageSize',
      'canGotoPrevPage',
      'assignTotalExceedDataBaseTotalError',
      'canNextFetch',
      'fetchNextStart',
      'fetchNextEnd',
      'canGotoNextPage',
      'assignError',
    ].forEach(actionExists);
  });

  describe('Guards', () => {
    [
      'canNextFetch',
      'canGotoNextPage',
      'canGoToPrevPage',
      'nextFetching',
      'targetPageIsWithinBounds',
    ].forEach(guardExists);
  });

  describe('Services', () => {
    ['fetch', 'refetch', 'delete', 'remove'].forEach(serviceExists);
  });

  // it('State `idle` shoulds exist', () => {
  //   const _machine = createListMachine(mockDAO, { col: 'news' });
  //   const actual = Object.keys(_machine.states);
  //   expect(actual).toContain('idle');
  // });
  // it('State `createMany` shoulds exist', () => {
  //   const _machine = createListMachine(mockDAO, { col: 'news' });
  //   const actual = Object.keys(_machine.states);
  //   expect(actual).toContain('createMany');
  // });
});

function testAction(state: string, contexts: TestContexts) {
  describe(state, () => {
    describe('Error', () => {
      const mock = produce(mockDAO, (draft) => {
        draft.readMany = mockFn<typeof mockDAO.readMany>().mockRejectedValue(
          new Error()
        );
      });
      const { state: initialState, context: initialContext } = contexts.error;
      generateAsyncMachineTest({
        initialState,
        initialContext,
        machine: createListMachine(mock, { col: '' }),
        events: [contexts.event],
        values: ['idle', state, 'error'],
        timeout: 10,
      });
    });

    describe('internalError', () => {
      const mock = produce(mockDAO, (draft) => {
        draft.readMany = mockFn<typeof mockDAO.readMany>().mockResolvedValue(
          []
        );
      });
      const { state: initialState, context: initialContext } =
        contexts.internalError;
      generateAsyncMachineTest({
        initialState,
        initialContext,
        machine: createListMachine(mock, { col: '' }),
        events: [contexts.event],
        values: ['idle', state, 'internalError'],
        timeout: 100,
      });
    });

    describe('success', () => {
      const mock = produce(mockDAO, (draft) => {
        draft.readMany =
          mockFn<typeof mockDAO.readMany>().mockResolvedValue(db);
        draft.count = mockFn<typeof mockDAO.count>().mockResolvedValue(6);
      });
      const { state: initialState, context: initialContext } = contexts.success;
      generateAsyncMachineTest({
        initialState,
        initialContext,
        machine: createListMachine(mock, { col: '' }),
        events: [contexts.event],
        values: ['idle', state, 'success'],
        timeout: 100,
      });
    });
  });
}

describe('Actions', () => {
  // const previousMock = produce(mockDAO, (draft) => {
  //   draft.readMany = mockFn<typeof mockDAO.readMany>().mockResolvedValue(db);
  //   draft.count = mockFn<typeof mockDAO.count>().mockResolvedValue(6);
  // });
  describe('fetching', () => {
    
    generateAsyncMachineTest({
      machine: createListMachine(mockDAO, { col: '' }),
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
          draft.count = mockFn<typeof mockDAO.count>().mockRejectedValue(new Error());
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
    generateAsyncMachineTest({
      machine: createListMachine(
        produce(mockDAO, (draft) => {
          draft.readMany =
            mockFn<typeof mockDAO.readMany>().mockResolvedValue(db);

          draft.count = mockFn<typeof mockDAO.count>().mockResolvedValue(26);
        }),
        { col: '' }
      ),
      events: ['FETCH'],
      values: ['idle', 'fetching', 'success'],
      timeout: 100,
      invite: 'It has data',
    });
  });
  describe('PREVIOUS', () => {
    const mock = produce(mockDAO, (draft) => {
      draft.readMany = mockFn<typeof mockDAO.readMany>().mockResolvedValue(db);
      draft.count = mockFn<typeof mockDAO.count>().mockResolvedValue(26);
    });
    generateAsyncMachineTest({
      machine: createListMachine(mock, { col: '' }),
      events: ['PREVIOUS'],
      values: ['success', 'internalError'],
      timeout: 100,
      initialState: 'success',
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
      events: ['PREVIOUS'],
      values: ['success', 'success'],
      timeout: 100,
      initialState: 'success',
      initialContext: { canGoToPrevPage: true },
      invite: 'It have previous page',
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
      subscribers: [
        (state) => {
          console.log('state', '=>', state.value);
        },
      ],
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
  // testAction('NEXT', eFETCH);
  // testAction('REFETCH', eFETCH);
  // testAction('GO_TO_TARGET_PAGE', eFETCH);
  // testAction('CHANGE_PAGE_SIZE', eFETCH);
  // testAction('REMOVE', eFETCH);
  // testAction('DELETE', eFETCH);
});
