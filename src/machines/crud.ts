import { assign, createMachine as create } from 'xstate';
import { createModel } from 'xstate/lib/model';
import { CRUD } from '../types/crud';
import { TC, TE } from '../types/machine';

export default function createMachine<T>(crud: CRUD<T>) {
  const machine = create<TC<T>, TE<T>>(
    {
      context: {
        iterator: 0,
      },
      states: {
        idle: {
          on: {},
        },
        update: {
          invoke: {
            src: 'update',
          },
        },
        set: {
          invoke: {
            src: 'set',
          },
        },
        delete: {
          invoke: {
            src: 'delete',
          },
        },
        remove: {
          invoke: {
            src: 'remove',
          },
        },
        retrieve: {
          invoke: {
            src: 'retrieve',
          },
        },
        fetch: {
          invoke: {
            src: '',
          },
        },
        success: {
          on: {},
        },

        error: {
          on: {},
        },
      },
    },
    {
      actions: {
        errorUpdate: assign({ error: _ => 'update' }),
        errorSet: assign({ error: _ => 'set' }),
        errorDelete: assign({ error: _ => 'delete' }),
        errorRemove: assign({ error: _ => 'remove' }),
        errorRetrieve: assign({ error: _ => 'retrieve' }),
        errorFetch: assign({ error: _ => 'fetch' }),
      },
      services: {},
    }
  );
}
