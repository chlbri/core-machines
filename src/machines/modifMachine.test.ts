import ReturnData from 'core-promises';
import produce from 'immer';
import { mockFn } from 'jest-mock-extended';
import { generateAsyncMachineTest } from 'test-machine';
import { Event } from 'xstate';
import { db } from '../.config/test';
import { DataMock } from '../.config/test/types';
import { mockDAO } from '../.config/test/values';
import { SingleContext, SingleEvent } from '../types';
import createModifMachine from './modifMachine';

const machine = createModifMachine(mockDAO);

const eventUpdate: Event<SingleEvent<DataMock>> = {
  type: 'update',
  data: {},
};

const eventDelete: Event<SingleEvent<DataMock>> = 'delete';
const eventRemove: Event<SingleEvent<DataMock>> = 'remove';
const eventRetrieve: Event<SingleEvent<DataMock>> = 'retrieve';
const eventRefetch: Event<SingleEvent<DataMock>> = 'refetch';

const eventFetchSingle: Event<SingleEvent<DataMock>> = {
  type: 'fetch',
  id: db[0]._id,
};

const initialContext: SingleContext<DataMock> = {
  iterator: 0,
  needToFecth: 0,
};

describe('Update', () => {
  generateAsyncMachineTest({
    machine,
    events: [eventUpdate],
    values: ['idle', 'pending'],
    contexts: [
      initialContext,
      produce(initialContext, draft => {
        draft.iterator += 2;
        draft;
      }),
    ],
    timeout: 100,
  });
});

describe('Delete', () => {
  generateAsyncMachineTest({
    machine,
    initialContext,
    events: [eventDelete],
    values: ['idle', 'pending'],
    contexts: [
      initialContext,
      produce(initialContext, draft => {
        draft.iterator += 2;
        draft;
      }),
    ],
    timeout: 100,
  });
});

describe('Remove', () => {
  const mock = produce(mockDAO, draft => {
    draft.removeOneById = mockFn<
      typeof mockDAO.removeOneById
    >().mockResolvedValue(
      new ReturnData({ status: 200, payload: db[0]._id }),
    );
    draft.readOneById = mockFn<
      typeof mockDAO.readOneById
    >().mockResolvedValue(new ReturnData({ status: 200, payload: db[0] }));
  });

  generateAsyncMachineTest({
    machine: createModifMachine(mock),
    events: [eventFetchSingle, eventRemove],
    values: ['idle', 'fetch', 'success', 'remove', 'success'],
    contexts: [
      initialContext,
      produce(initialContext, draft => {
        draft.iterator++;
      }),
      produce(initialContext, draft => {
        draft.iterator += 2;
        draft.needToFecth = 0;
      }),
      produce(initialContext, draft => {
        draft.iterator += 3;
        draft.needToFecth = 0;
      }),
      produce(initialContext, draft => {
        draft.iterator += 4;
        draft.needToFecth++;
      }),
    ],
    timeout: 1000,
    waiterBeforeEachEvent: 100,
  });
});

describe('Retrieve', () => {
  generateAsyncMachineTest({
    machine,
    events: [eventRetrieve],
    values: ['idle', 'pending'],
    contexts: [
      initialContext,
      produce(initialContext, draft => {
        draft.iterator += 2;
        draft;
      }),
    ],
    timeout: 100,
  });
});

describe('Refetch', () => {
  const mock = produce(mockDAO, draft => {
    draft.readOneById = mockFn<
      typeof mockDAO.readOneById
    >().mockResolvedValue(new ReturnData({ status: 200, payload: db[0] }));
  });

  generateAsyncMachineTest({
    machine: createModifMachine(mock),
    events: [eventFetchSingle, eventRefetch],
    values: ['idle', 'fetch', 'success', 'refetch', 'success'],
    contexts: [
      initialContext,
      produce(initialContext, draft => {
        draft.iterator++;
      }),
      produce(initialContext, draft => {
        draft.iterator += 2;
        draft.previous = draft.current;
        const { _id, ...payload } = db[0];
        draft.current = payload;
      }),
      produce(initialContext, draft => {
        draft.iterator += 3;
        draft.previous = draft.current;
        const { _id, ...payload } = db[0];
        draft.current = payload;
      }),
      produce(initialContext, draft => {
        draft.iterator += 4;
        const { _id, ...payload } = db[0];
        draft.previous = payload;
        draft.current = payload;
      }),
    ],
    timeout: 100,
  });
});
describe('Fetch', () => {
  const mock = produce(mockDAO, draft => {
    draft.readOneById = mockFn<
      typeof mockDAO.readOneById
    >().mockResolvedValue(new ReturnData({ status: 200, payload: db[0] }));
  });

  generateAsyncMachineTest({
    machine: createModifMachine(mock),
    events: [eventFetchSingle],
    values: ['idle', 'fetch', 'success'],
    contexts: [
      initialContext,
      produce(initialContext, draft => {
        draft.iterator++;
      }),
      produce(initialContext, draft => {
        draft.iterator += 2;
        draft.previous = draft.current;
        const { _id, ...payload } = db[0];
        draft.current = payload;
      }),
    ],
    timeout: 100,
  });
});
