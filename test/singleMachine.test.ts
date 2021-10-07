import produce from 'immer';
import { generateAsyncMachineTest } from 'test-machine';
import { Event } from 'xstate';
import createSingleMachine, { DAOSingle } from '../src/machines/singleMachine';
import { SingleTC, SingleTE } from '../src/types/machine';

type DataMock = {
  login?: string;
  firstName?: string;
  deleted?: true;
  id?: string;
};

const __dataMock: DataMock = {
  login: 'login',
  firstName: 'levi',
  id: 'id2',
};

const _db: DataMock[] = [__dataMock];

let db = _db;

// let _dataMock = __dataMock;

const mockDAO: DAOSingle<DataMock> = {
  updateOneById: async (id, data) => {
    db = produce(_db, (draft) => {
      draft[0] = { ...draft[0], ...data };
    });
    return id;
  },
  setOneById: async (id, data) => {
    db = produce(_db, (draft) => {
      draft[0] = data;
    });
    return id;
  },
  deleteOneById: async (id) => {
    db = produce(_db, (draft) => {
      draft[0].deleted = true;
    });
    return id;
  },
  removeOneById: async (id) => {
    db = [];
    return id;
  },
  retrieveOneById: async (id) => {
    db = produce(_db, (draft) => {
      draft[0].deleted = undefined;
    });
    db.length;
    return id;
  },
  readOneById: async (id) => {
    const out = _db.find((data) => data.id === id);
    if (!out) return { id };
    return { ...out, id };
  },
};

const machine = createSingleMachine(mockDAO);

// #region to keep
// const array = ['arr1', 'arr2', 'arr4', 'arr1'] as const;

// #endregion

const modif = { login: 'modifiedLogin' };

const eventUpdate: Event<SingleTE<DataMock>> = {
  type: 'update',
  data: modif,
};

const eventSet: Event<SingleTE<DataMock>> = {
  type: 'set',
  data: modif,
};

const eventDelete: Event<SingleTE<DataMock>> = 'delete';
const eventRemove: Event<SingleTE<DataMock>> = 'remove';
const eventRetrieve: Event<SingleTE<DataMock>> = 'retrieve';
const eventRefetch: Event<SingleTE<DataMock>> = 'refetch';

const eventFetchSingle: Event<SingleTE<DataMock>> = {
  type: 'fetch',
  id: 'id2',
};

const initialContext: SingleTC<DataMock> = {
  iterator: 0,
  needToFecth: 0,
  id: 'id2',
  current: __dataMock,
};

generateAsyncMachineTest({
  machine,
  initialContext,
  events: [eventUpdate],
  invite: 'Update',
  values: ['idle', 'update', 'success'],
  contexts: [
    initialContext,
    produce(initialContext, (draft) => {
      draft.iterator++;
      draft;
    }),
    produce(initialContext, (draft) => {
      draft.needToFecth++;
      draft.iterator += 2;
    }),
  ],
  timeout: 1000,
});

generateAsyncMachineTest({
  machine,
  initialContext,
  events: [eventSet],
  invite: 'Set',
  values: ['idle', 'set', 'success'],
  contexts: [
    initialContext,
    produce(initialContext, (draft) => {
      draft.iterator++;
    }),
    produce(initialContext, (draft) => {
      draft.needToFecth++;
      draft.iterator += 2;
    }),
  ],
  timeout: 1000,
});

generateAsyncMachineTest({
  machine,
  initialContext,
  events: [eventDelete],
  invite: 'Delete',
  values: ['idle', 'delete', 'success'],
  contexts: [
    initialContext,
    produce(initialContext, (draft) => {
      draft.iterator++;
      draft;
    }),
    produce(initialContext, (draft) => {
      draft.needToFecth++;
      draft.iterator += 2;
    }),
  ],
  timeout: 1000,
});

generateAsyncMachineTest({
  machine,
  initialContext,
  events: [eventRemove],
  invite: 'Remove',
  values: ['idle', 'remove', 'success'],
  contexts: [
    initialContext,
    produce(initialContext, (draft) => {
      draft.iterator++;
    }),
    produce(initialContext, (draft) => {
      draft.needToFecth++;
      draft.iterator += 2;
    }),
  ],
  timeout: 1000,
});

generateAsyncMachineTest({
  machine,
  initialContext,
  events: [eventRetrieve],
  invite: 'Retrieve',
  values: ['idle', 'retrieve', 'success'],
  contexts: [
    initialContext,
    produce(initialContext, (draft) => {
      draft.iterator++;
      draft;
    }),
    produce(initialContext, (draft) => {
      draft.needToFecth++;
      draft.iterator += 2;
    }),
  ],
  timeout: 1000,
});

generateAsyncMachineTest({
  machine,
  initialContext,
  events: [eventRefetch],
  invite: 'RefeSingleTCh',
  values: ['idle', 'refeSingleTCh', 'success'],
  contexts: [
    initialContext,
    produce(initialContext, (draft) => {
      draft.iterator++;
    }),
    produce(initialContext, (draft) => {
      draft.iterator += 2;
      draft.needToFecth++;
      draft.previous = draft.current;
      draft.current = _db[0];
    }),
  ],
  timeout: 1000,
});

generateAsyncMachineTest({
  machine,
  initialContext,
  events: [eventFetchSingle],
  invite: 'FeSingleTCh',
  values: ['idle', 'feSingleTCh', 'success'],
  contexts: [
    initialContext,
    produce(initialContext, (draft) => {
      draft.iterator++;
    }),
    produce(initialContext, (draft) => {
      draft.iterator += 2;
      draft.needToFecth++;
      draft.previous = draft.current;
      draft.current = _db[0];
    }),
  ],
  timeout: 1000,
});

// /** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
// module.exports = {
//   // preset: 'ts-jest',
//   testEnvironment: 'node',
// };
