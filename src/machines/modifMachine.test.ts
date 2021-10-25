import produce from 'immer';
import { generateAsyncMachineTest } from 'test-machine';
import { Event } from 'xstate';
import { DataMock } from '../.config/test/types';
import { db } from '../.config/test';
import { mockDAO } from '../.config/test/values';
import { SingleEvent, SingleContext } from '../types';
import createModifMachine from './modifMachine';

const machine = createModifMachine(mockDAO);

const modif = { login: 'modifiedLogin' };

const eventUpdate: Event<SingleEvent<DataMock>> = {
  type: 'update',
  data: {},
};

const eventSet: Event<SingleEvent<DataMock>> = {
  type: 'set',
  data: modif,
};

const eventDelete: Event<SingleEvent<DataMock>> = 'delete';
const eventRemove: Event<SingleEvent<DataMock>> = 'remove';
const eventRetrieve: Event<SingleEvent<DataMock>> = 'retrieve';
const eventRefetch: Event<SingleEvent<DataMock>> = 'refetch';

const eventFetchSingle: Event<SingleEvent<DataMock>> = {
  type: 'fetch',
  id: 'id1',
};

const initialContext: SingleContext<DataMock> = {
  iterator: 0,
  needToFecth: 0,
  id: 'id1',
  current: db[0],
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
  timeout: 100,
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
  timeout: 100,
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
  timeout: 100,
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
  timeout: 100,
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
  timeout: 100,
});

generateAsyncMachineTest({
  machine,
  initialContext,
  events: [eventRefetch],
  invite: 'Refetch',
  values: ['idle', 'refetch', 'success'],
  contexts: [
    initialContext,
    produce(initialContext, (draft) => {
      draft.iterator++;
    }),
    produce(initialContext, (draft) => {
      draft.iterator += 2;
      draft.needToFecth++;
      draft.previous = draft.current;
      draft.current = db[0];
    }),
  ],
  timeout: 100,
});

generateAsyncMachineTest({
  machine,
  initialContext,
  events: [eventFetchSingle],
  invite: 'Fetch',
  values: ['idle', 'fetch', 'success'],
  contexts: [
    initialContext,
    produce(initialContext, (draft) => {
      draft.iterator++;
    }),
    produce(initialContext, (draft) => {
      draft.iterator += 2;
      draft.needToFecth++;
      draft.previous = draft.current;
      draft.current = db[0];
    }),
  ],
  timeout: 100,
});
