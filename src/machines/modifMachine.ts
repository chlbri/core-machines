/* eslint-disable @typescript-eslint/no-unused-vars */
import { assign as _assign } from '@xstate/immer';
import { CRUD, DSO, Entity, QueryOptions } from 'core-data';
import ReturnData, { error } from 'core-promises';
import produce from 'immer';
import {
  assign,
  createMachine as create,
  send,
  TransitionsConfig,
} from 'xstate';
import { reduceMutations } from '../functions';
import StateError from '../types/error';
import {
  SingleContext,
  SingleEvent,
  SingleTypeState,
} from '../types/machine/single';
import { DPW } from '../types/_config';
import { createRDMachine } from './returnData';

export type DAOSingle<T extends Entity> = Pick<
  CRUD<T>,
  | 'updateOneById'
  | 'setOneById'
  | 'deleteOneById'
  | 'removeOneById'
  | 'retrieveOneById'
  | 'readOneById'
>;

type Props<T extends Entity> = {
  crud: DAOSingle<T>;
  filters?: DSO<T>;
  options?: QueryOptions;
  initialContext?: SingleContext<T>;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function createModifMachine<T extends Entity>({
  crud,
  options,
  initialContext,
  filters,
}: Props<T>) {
  const updateOneById = createRDMachine(crud.updateOneById);
  const setOneById = createRDMachine(crud.setOneById);
  const deleteOneById = createRDMachine(crud.deleteOneById);
  const removeOneById = createRDMachine(crud.removeOneById);
  const retrieveOneById = createRDMachine(crud.retrieveOneById);
  const readOneById = createRDMachine(crud.readOneById);

  const asyncHandle = {
    onDone: {
      target: 'data',
      actions: ['addNeedToFetch'],
    },
    onError: [
      {
        cond: 'isError_idNotMatch',
        actions: ['addNeedToFetch', 'assignAsyncError'],
        target: 'data',
      },
      { target: 'error', actions: [] },
    ],
  };

  const entry = 'iterate';

  const onEvents: TransitionsConfig<SingleContext<T>, SingleEvent<T>> = {
    update: {
      target: 'pending',
      actions: 'update',
    },

    delete: {
      target: 'pending',
      actions: 'delete',
    },

    remove: 'remove',
    set: 'set',
    retrieve: {
      target: 'pending',
      actions: 'retrieve',
    },
    fetch: {
      target: 'fetch',
    },
    refetch: {
      target: 'refetch',
    },
  };

  const machine = create<
    SingleContext<T>,
    SingleEvent<T>,
    SingleTypeState<T>
  >(
    {
      initial: 'idle',
      context: initialContext ?? {
        iterator: 0,
        needToFecth: 0,
        _mutations: [],
        errors: [],
        notPermitteds: [],
      },
      states: {
        idle: {
          on: {
            update: {
              target: 'pending',
              actions: 'update',
            },

            delete: {
              target: 'pending',
              actions: 'delete',
            },

            remove: 'remove',
            set: 'set',
            retrieve: {
              target: 'pending',
              actions: 'retrieve',
            },
            fetch: 'fetch',
            refetch: 'refetch',
          },
        },
        pending: {
          entry,
          on: {
            save: 'save',
            update: {
              actions: 'update',
            },
            delete: {
              actions: 'delete',
            },
            retrieve: {
              actions: 'retrieve',
            },
            remove: 'remove',
            set: 'set',
            fetch: 'fetch',
            refetch: 'refetch',
          },
        },
        save: {
          invoke: {
            src: 'save',
            id: 'save',
          },
          on: {
            SEND: {
              target: 'data',
              actions: [
                'addNeedToFetch',
                () => {
                  console.log('answer to');
                },
              ],
            },
          },
          entry: [
            entry,
            send(
              (ctx, ev) => {
                if (ev.type !== 'save') return { type: 'nothing' };
                const mutation = reduceMutations(ctx._mutations);

                return { type: 'SEND', data: { ...mutation, options } };
              },
              { to: 'save' },
            ),
          ],
          exit: 'rinitMutations',
        },
        remove: {
          invoke: {
            id: 'remove',
            src: 'remove',
          },
          on: {
            SEND: {
              target: 'data',
              actions: [
                'addNeedToFetch',
                () => {
                  console.log('answer to');
                },
              ],
            },
          },
          entry: [
            entry,
            send(
              (ctx, ev) => {
                if (ev.type !== 'remove') return { type: 'nothing' };
                return { type: 'SEND', data: { id: ctx._id } };
              },
              { to: 'remove' },
            ),
          ],
        },
        set: {
          invoke: {
            src: 'set',
            id: 'set',
          },
          on: {
            SEND: {
              target: 'data',
              actions: ['addNeedToFetch'],
            },
          },
          entry: [
            entry,
            send(
              (ctx, ev) => {
                if (ev.type !== 'set') return { type: 'nothing' };
                const mutation = reduceMutations(ctx._mutations);

                return { type: 'SEND', data: { ...mutation, options } };
              },
              { to: 'set' },
            ),
          ],
        },
        retrieve: {
          entry,
          always: {
            actions: 'retrieve',
            target: 'pending',
          },
        },
        error: {},
        fetch: {
          invoke: {
            id: 'read',
            src: 'read',
          },
          on: {
            SEND: {
              target: 'data',
              actions: ['assignData', 'assignID', 'rinitNeedToFetch'],
            },
          },
          entry: [
            entry,
            send(
              (ctx, ev) => {
                if (ev.type !== 'fetch') return { type: 'nothing' };
                const id = ev._id;
                return { type: 'SEND', data: { id, filters, options } };
              },
              { to: 'read' },
            ),
          ],
        },
        refetch: {
          invoke: {
            id: 'read',
            src: 'read',
          },
          on: {
            SEND: {
              target: 'data',
              actions: ['assignData', 'assignID', 'rinitNeedToFetch'],
            },
          },
          entry: [
            entry,
            send(
              (ctx, ev) => {
                if (ev.type !== 'refetch') return { type: 'nothing' };
                const id = ctx._id;
                if (!id) return { type: 'nothing' };
                return { type: 'SEND', data: { id, filters, options } };
              },
              { to: 'read' },
            ),
          ],
        },

        checking: {
          entry,
          always: {},
        },

        data: {
          entry,
          on: onEvents,
        },

        ClientError: {},
        Information: {},
        PermissionError: {},
        Redirect: {},
        ServerError: {},
        TimeoutError: {},
      },
    },
    {
      guards: {
        isError_idNotMatch: (_, _event: any) => {
          if (!_event.data) return false;
          const data = _event.data;
          if (data instanceof StateError) {
            return data.message === 'idNotMatch';
          }
          return false;
        },
        idNotDefined: ctx => !ctx._id,
        eventWithoutData: (_, ev: any) => !ev.data,
      },

      actions: {
        iterate: assign({ iterator: ctx => ctx.iterator + 1 }),
        assignCurrent: assign({
          payload: (_, _event: any) => {
            if (!_event.data) return undefined;
            const data = _event.data;
            if (data instanceof ReturnData) {
              const _data = data;
              return _data.maybeMap({
                success: (_, { _id, ...payload }) => payload as DPW<T>,
                else: error,
              });
            }
            return undefined;
          },
          _id: (_, ev) => {
            if (!ev.data) return undefined;
            const data = ev.data;
            if (data instanceof ReturnData) {
              const _data = data as ReturnData<T, any>;
              return _data.maybeMap({
                success: (_, payload) => payload._id,
                else: error,
              });
            }
            return undefined;
          },
        }),
        assignData: assign({
          payload: (_, ev: any) => {
            const { _id, ...payload } = ev.payload;
            return payload;
          },
        }),
        assignID: assign({
          _id: (_, ev: any) => {
            const { _id, ...payload } = ev.payload;
            return _id;
          },
        }),
        assignFetch: _assign((ctx, _event: any) => {
          if (!_event.data) return ctx;
          const data = _event.data;
          if (data instanceof ReturnData) {
            const { _id, ...payload } = data.maybeMap({
              success: (_, data) => data,
              else: error,
            });
            ctx._id = _id;
            ctx.payload = payload;
          }
        }),
        // #region NeedToFetch
        addNeedToFetch: _assign(ctx => ctx.needToFecth++),
        rinitNeedToFetch: _assign(ctx => (ctx.needToFecth = 0)),
        // #endregion
        assignError: _assign((ctx, ev: any) => ctx.errors.push(ev.data)),
        update: assign({
          _mutations: (ctx, e) => {
            if (e.type !== 'update') return ctx._mutations;
            return [...ctx._mutations, e.data];
          },
        }),
        delete: assign({
          _mutations: (ctx, ev) => {
            if (ev.type !== 'delete') return ctx._mutations;
            const next = {
              _deletedAt: false,
            } as DPW<T>;
            return [...ctx._mutations, next];
          },
        }),
        rinitMutations: _assign(ctx => (ctx._mutations = [])),

        retrieve: assign({
          _mutations: (ctx, event) => {
            if (event.type !== 'retrieve') return ctx._mutations;
            const next = {
              _deletedAt: false,
            } as DPW<T>;
            return [...ctx._mutations, next];
          },
        }),
      },

      services: {
        save: createRDMachine(crud.updateOneById),
        remove: createRDMachine(crud.removeOneById),
        set: createRDMachine(crud.setOneById),
        read: createRDMachine(crud.readOneById),
      },
    },
  );

  return machine;
}
