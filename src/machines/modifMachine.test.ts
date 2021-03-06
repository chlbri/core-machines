import produce from 'immer';
import { mockFn } from 'jest-mock-extended';
import { generateAsyncMachineTest } from 'test-machine';
import { Event } from 'xstate';
import { db } from '../.config/test';
import { DataMock } from '../.config/test/types';
import { mockDAO } from '../.config/test/values';
import { SingleContext, SingleEvent } from '../types';
import createModifMachine from './modifMachine';
import ReturnData from 'core-promises';

const eventUpdate: Event<SingleEvent<DataMock>> = {
  type: 'update',
  data: {
    lastName: 'modified',
  },
};
const eventSet: Event<SingleEvent<DataMock>> = {
  type: 'set',
  data: {
    lastName: 'modified',
  },
};

const eventDelete: Event<SingleEvent<DataMock>> = 'delete';
const eventSave: Event<SingleEvent<DataMock>> = 'save';
const eventRemove: Event<SingleEvent<DataMock>> = 'remove';
const eventRetrieve: Event<SingleEvent<DataMock>> = 'retrieve';
const eventRefetch: Event<SingleEvent<DataMock>> = 'refetch';

const eventFetchSingle: Event<SingleEvent<DataMock>> = {
  type: 'fetch',
  _id: db[0]._id,
};

const initialContext: SingleContext<DataMock> = {
  iterator: 0,
  needToFecth: 0,
  _mutations: [],
  errors: [],
  notPermitteds: [],
};

describe('Update', () => {
  const crud = produce(mockDAO, draft => {
    draft.updateOneById = mockFn<
      typeof mockDAO.updateOneById
    >().mockResolvedValue(
      new ReturnData({ status: 200, payload: db[0]._id }),
    );
    draft.readOneById = mockFn<
      typeof mockDAO.readOneById
    >().mockResolvedValue(new ReturnData({ status: 200, payload: db[0] }));
  });

  const { _id, ...payload } = db[0];

  generateAsyncMachineTest({
    machine: createModifMachine({ crud }),
    events: [
      eventUpdate,
      eventSave,
      eventFetchSingle,
      eventUpdate,
      eventSave,
      eventFetchSingle,
    ],
    values: [
      'idle',
      'pending',
      'save',
      'data',
      'fetch',
      'data',
      'pending',
      'save',
      'data',
      'fetch',
      'data',
    ],
    contexts: [
      initialContext,
      { iterator: 1, _mutations: [eventUpdate.data] },
      undefined,
      { iterator: 3, _mutations: [] },
      undefined,
      { iterator: 5, needToFecth: 0, payload: payload, _id },
      {
        iterator: 6,
        payload: payload,
        _id,
        _mutations: [eventUpdate.data],
      },
      undefined,
      {
        iterator: 8,
        needToFecth: 1,
        _mutations: [],
      },
      undefined,
      {
        iterator: 10,
        payload: payload,
        _id,
        _mutations: [],
        needToFecth: 0,
      },
    ],
    timeout: 100,
  });
});

describe('Delete', () => {
  const crud = produce(mockDAO, draft => {
    draft.updateOneById = mockFn<
      typeof mockDAO.updateOneById
    >().mockResolvedValue(
      new ReturnData({ status: 200, payload: db[0]._id }),
    );
    draft.readOneById = mockFn<
      typeof mockDAO.readOneById
    >().mockResolvedValue(new ReturnData({ status: 200, payload: db[0] }));
  });
  generateAsyncMachineTest({
    machine: createModifMachine({ crud }),
    initialContext,
    events: [
      eventDelete,
      eventSave,
      eventFetchSingle,
      eventDelete,
      eventSave,
      eventFetchSingle,
    ],
    values: [
      'idle',
      'pending',
      'save',
      'data',
      'fetch',
      'data',
      'pending',
      'save',
      'data',
      'fetch',
      'data',
    ],
    contexts: [initialContext, { iterator: 1, needToFecth: 0 }],
    timeout: 100,
  });
});

describe('Remove', () => {
  const crud = produce(mockDAO, draft => {
    draft.removeOneById = mockFn<
      typeof mockDAO.removeOneById
    >().mockResolvedValue(new ReturnData({ status: 900 }));
    draft.readOneById = mockFn<
      typeof mockDAO.readOneById
    >().mockResolvedValue(new ReturnData({ status: 200, payload: db[0] }));
  });

  const { _id, ...payload } = db[0];

  generateAsyncMachineTest({
    machine: createModifMachine({ crud }),
    events: [eventFetchSingle, eventRemove],
    values: ['idle', 'fetch', 'data', 'remove', 'data'],
    contexts: [
      initialContext,
      { iterator: 1 },
      { iterator: 2, needToFecth: 0 },
      { iterator: 3, payload, _id },
      { iterator: 4, needToFecth: 1 },
    ],
    timeout: 1000,
    waiterBeforeEachEvent: 100,
  });
});

describe('Set', () => {
  const crud = produce(mockDAO, draft => {
    draft.setOneById = mockFn<
      typeof mockDAO.setOneById
    >().mockResolvedValue(
      new ReturnData({ status: 200, payload: db[0]._id }),
    );
    draft.readOneById = mockFn<
      typeof mockDAO.readOneById
    >().mockResolvedValue(new ReturnData({ status: 200, payload: db[0] }));
  });

  generateAsyncMachineTest({
    machine: createModifMachine({ crud }),
    events: [eventFetchSingle, eventSet],
    values: ['idle', 'fetch', 'data', 'set', 'data'],
    contexts: [
      initialContext,
      { iterator: 1 },
      { iterator: 2 },
      { iterator: 3 },
      { iterator: 4, needToFecth: 1 },
    ],
    timeout: 1000,
    waiterBeforeEachEvent: 100,
  });
});

describe('Retrieve', () => {
  const crud = produce(mockDAO, draft => {
    draft.updateOneById = mockFn<
      typeof mockDAO.updateOneById
    >().mockResolvedValue(
      new ReturnData({ status: 200, payload: db[0]._id }),
    );
    draft.readOneById = mockFn<
      typeof mockDAO.readOneById
    >().mockResolvedValue(new ReturnData({ status: 200, payload: db[0] }));
  });

  const { _id, ...payload } = db[0];

  //id and login

  generateAsyncMachineTest({
    machine: createModifMachine({ crud }),
    events: [
      eventRetrieve,
      eventSave,
      eventFetchSingle,
      eventRetrieve,
      eventSave,
      eventFetchSingle,
    ],
    values: [
      'idle',
      'pending',
      'save',
      'data',
      'fetch',
      'data',
      'pending',
      'save',
      'data',
      'fetch',
      'data',
    ],
    contexts: [
      initialContext,
      { iterator: 1, _mutations: [{ _deletedAt: false }] },
      undefined,
      { iterator: 3, _mutations: [] },
      undefined,
      { iterator: 5, needToFecth: 0, payload: payload, _id },
      {
        iterator: 6,
        payload: payload,
        _id,
        _mutations: [{ _deletedAt: false }],
      },
      undefined,
      {
        iterator: 8,
        needToFecth: 1,
        _mutations: [],
      },
      undefined,
      {
        iterator: 10,
        payload: payload,
        _id,
        _mutations: [],
        needToFecth: 0,
      },
    ],
    timeout: 100,
  });
});

describe('Refetch', () => {
  const crud = produce(mockDAO, draft => {
    draft.readOneById = mockFn<
      typeof mockDAO.readOneById
    >().mockResolvedValue(new ReturnData({ status: 200, payload: db[0] }));
  });

  generateAsyncMachineTest({
    machine: createModifMachine({ crud }),
    events: [eventFetchSingle, eventRefetch],
    values: ['idle', 'fetch', 'data', 'refetch', 'data'],
    contexts: [
      initialContext,
      { iterator: 1 },
      produce(initialContext, draft => {
        draft.iterator += 2;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _id, ...payload } = db[0];
        draft.payload = payload;
      }),
      produce(initialContext, draft => {
        draft.iterator += 3;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _id, ...payload } = db[0];
        draft.payload = payload;
      }),
      produce(initialContext, draft => {
        draft.iterator += 4;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _id, ...payload } = db[0];
        draft.payload = payload;
      }),
    ],
    timeout: 100,
  });
});

describe('Fetch', () => {
  const crud = produce(mockDAO, draft => {
    draft.readOneById = mockFn<
      typeof mockDAO.readOneById
    >().mockResolvedValue(new ReturnData({ status: 200, payload: db[0] }));
  });

  generateAsyncMachineTest({
    machine: createModifMachine({ crud }),
    events: [eventFetchSingle],
    values: ['idle', 'fetch', 'data'],
    contexts: [
      initialContext,
      produce(initialContext, draft => {
        draft.iterator++;
      }),
      produce(initialContext, draft => {
        draft.iterator += 2;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _id, ...payload } = db[0];
        draft.payload = payload;
      }),
    ],
    timeout: 100,
  });
});
