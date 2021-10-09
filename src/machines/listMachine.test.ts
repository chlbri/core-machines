import createListMachine from './listMachine';
import { mockDAO } from '../.config/test/values';
import { Event, StateValue } from 'xstate';
import { DataMock } from '../.config/test/types';
import { MultiEvent } from '../types';
import { generateAsyncMachineTest } from 'test-machine';

export const machine = createListMachine(mockDAO, { col: 'news' });

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

type TestActionEvents = {
  error: Event<MultiEvent<DataMock>>;
  internalError: Event<MultiEvent<DataMock>>;
  success: Event<MultiEvent<DataMock>>;
};

const eCreateMany: TestActionEvents = {
  error: {
    type: 'createMany',
    data: manyData,
  },
  internalError: {
    type: 'createMany',
    data: manyData,
  },
  success: {
    type: 'createMany',
    data: manyData,
  },
};

const eCreateOne: Event<MultiEvent<DataMock>> = {
  type: 'createOne',
  data: oneData,
};

// const eventDelete: Event<MultiEvent<DataMock>> = 'delete';
// const eventRemove: Event<MultiEvent<DataMock>> = 'remove';
// const eventRetrieve: Event<MultiEvent<DataMock>> = 'retrieve';
// const eventRefetch: Event<MultiEvent<DataMock>> = 'refetch';

// const eventFetchSingle: Event<MultiEvent<DataMock>> = {
//   type: 'fetch',
//   id: 'id1',
// };

function stateExists(state: StateValue) {
  return it(`State "${state.toString()}" shoulds exist`, () => {
    const _machine = createListMachine(mockDAO, { col: '' });
    const actual = Object.keys(_machine.states);
    expect(actual).toContainEqual(state);
  });
}

describe('Existence Test', () => {
  it('`createMachine` should exist', () => {
    expect(createListMachine).toBeDefined();
    expect(createListMachine).toBeInstanceOf(Function);
  });
  it('It creates a machine', () => {
    const _machine = createListMachine(mockDAO, { col: 'news' });
    const actual = Object.keys(_machine);
    expect(actual).toContain('states');
    expect(actual).toContain('id');
    expect(actual).toContain('__xstatenode');
    expect(actual).toContain('__cache');
    expect(actual).toContain('config');
    expect(actual).toContain('_transient');
  });
  it('It creates inital context', () => {
    const _machine = createListMachine(mockDAO, { col: 'news' });
    const actual = _machine.context;
    const expected = {
      iterator: 0,
      needToFecth: 0,
      col: 'news',
      pageSize: 20,
      currentPage: 0,
    };
    expect(actual).toEqual(expected);
  });

  // #region Check states existence
  [
    ...Object.keys(mockDAO),
    'idle',
    'success',
    'error',
    'internalError',
  ].forEach(stateExists);
  // #endregion

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

function testAction(state: string, events: TestActionEvents) {
  return describe(state, () => {
    generateAsyncMachineTest({
      machine,
      events: [events.error],
      invite: 'Error',
      values: ['idle', state, 'error'],
      timeout: 10,
    });

    generateAsyncMachineTest({
      machine,
      events: [events.internalError],
      invite: 'InternalError',
      values: ['idle', state, 'internalError'],
      timeout: 10,
    });

    generateAsyncMachineTest({
      machine,
      events: [events.success],
      invite: 'Success',
      values: ['idle', state, 'success'],
      timeout: 10,
    });
  });
}

describe('Actions', () => {
  testAction('createMany', eCreateMany);
  testAction('createOne', eCreateMany);
  testAction('upsertOne', eCreateMany);
  testAction('readAll', eCreateMany);
  testAction('readMany', eCreateMany);
  testAction('readManyByIds', eCreateMany);
  testAction('readOne', eCreateMany);
  testAction('readOneById', eCreateMany);
  testAction('countAll', eCreateMany);
  testAction('count', eCreateMany);
  testAction('updateAll', eCreateMany);
  testAction('updateMany', eCreateMany);
  testAction('updateManyByIds', eCreateMany);
  testAction('updateOne', eCreateMany);
  testAction('updateOneById', eCreateMany);
  testAction('setAll', eCreateMany);
  testAction('setMany', eCreateMany);
  testAction('setManyByIds', eCreateMany);
  testAction('setOne', eCreateMany);
  testAction('setOneById', eCreateMany);
  testAction('deleteAll', eCreateMany);
  testAction('deleteMany', eCreateMany);
  testAction('deleteManyByIds', eCreateMany);
  testAction('deleteOne', eCreateMany);
  testAction('deleteOneById', eCreateMany);
  testAction('removeAll', eCreateMany);
  testAction('removeMany', eCreateMany);
  testAction('removeManyByIds', eCreateMany);
  testAction('removeOne', eCreateMany);
  testAction('removeOneById', eCreateMany);
  testAction('retrieveAll', eCreateMany);
  testAction('retrieveMany', eCreateMany);
  testAction('retrieveManyByIds', eCreateMany);
  testAction('retrieveOne', eCreateMany);
  testAction('retrieveOneById', eCreateMany);
});
