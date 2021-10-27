/* eslint-disable @typescript-eslint/no-unused-vars */
import { CRUD, Entity, QueryOptions } from 'core-data';
import ReturnData, { error } from 'core-promises';
import produce, { createDraft, original } from 'immer';
import {
  assign,
  createMachine as create,
  send,
  TransitionsConfig,
} from 'xstate';
import { reduceMutations } from '../functions/rd';
import StateError from '../types/error';
import {
  SingleContext,
  SingleEvent,
  SingleTypeState,
} from '../types/machine/single';
import { DPW } from '../types/_config';
import { assign as _assign } from '@xstate/immer';
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
  options?: QueryOptions;
  initialContext?: SingleContext<T>;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function createModifMachine<T extends Entity>({
  crud,
  options,
  initialContext,
}: Props<T>) {
  const updateOneById = createRDMachine(crud.updateOneById);
  const setOneById = createRDMachine(crud.setOneById);
  const deleteOneById = createRDMachine(crud.deleteOneById);
  const removeOneById = createRDMachine(crud.removeOneById);
  const retrieveOneById = createRDMachine(crud.retrieveOneById);
  const readOneById = createRDMachine(crud.readOneById);

  const asyncHandle = {
    onDone: {
      target: 'success',
      actions: ['addNeedToFetch'],
    },
    onError: [
      {
        cond: 'isError_idNotMatch',
        actions: ['addNeedToFetch', 'assignAsyncError'],
        target: 'success',
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
        mutations: [],
      },
      states: {
        idle: {
          on: onEvents,
        },

        pending: {
          entry,
          on: {
            save: 'save',
          },
        },
        save: {
          invoke: {
            src: 'save',
            onDone: {
              target: 'success',
              actions: ['addNeedToFetch'],
            },

            onError: [
              {
                cond: 'isError_idNotMatch',
                actions: ['addNeedToFetch', 'assignAsyncError'],
                target: 'success',
              },
              { target: 'error', actions: [] },
            ],
          },
          on: {
            SEND: {
              target: 'success',
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
          exit: 'rinitMutations',
        },

        remove: {
          invoke: {
            id: 'remove',
            src: removeOneById,
            onDone: {
              target: 'success',
              actions: ['addNeedToFetch'],
            },

            onError: [
              {
                cond: 'isError_idNotMatch',
                actions: ['addNeedToFetch', 'assignAsyncError'],
                target: 'success',
              },
              { target: 'error', actions: [] },
            ],
          },
          on: {
            SEND: {
              target: 'success',
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
          entry,
          invoke: {
            src: 'set',
            onDone: {
              target: 'success',
              actions: ['addNeedToFetch'],
            },
            onError: [
              {
                cond: 'isError_idNotMatch',
                actions: ['addNeedToFetch', 'assignAsyncError'],
                target: 'success',
              },
              { target: 'error', actions: [] },
            ],
          },
        },
        retrieve: {
          entry,
          always: {
            actions: 'retrieve',
            target: 'pending',
          },
        },
        fetch: {
          entry,

          invoke: {
            src: 'fetch',
            ...produce(asyncHandle, draft => {
              draft.onDone.actions = ['assignFetch', 'rinitNeedToFetch'];
              draft.onError = [{ target: 'error', actions: [] }];
            }),
          },
        },
        refetch: {
          entry,

          invoke: {
            src: 'refetch',
            ...produce(asyncHandle, draft => {
              draft.onDone.actions = ['assignFetch'];
              draft.onError = [{ target: 'error', actions: [] }];
            }),
          },
        },

        checking: {
          entry,
          always: {},
        },

        success: {
          entry,
          on: onEvents,
        },

        error: {
          entry,

          on: onEvents,
        },
        ClientError: {},
        Information: {},
        PermissionError: {},
        Redirect: {},
        ServerError: {},
        Success: {},
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
        assignPrevious: assign({ previous: ctx => ctx.current }),
        assignCurrent: assign({
          current: (_, _event: any) => {
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
        assignFetch: _assign((ctx, _event: any) => {
          if (!_event.data) return ctx;
          const data = _event.data;
          if (data instanceof ReturnData) {
            ctx.previous = ctx.current;
            const { _id, ...payload } = data.maybeMap({
              success: (_, data) => data,
              else: error,
            });
            ctx._id = _id;
            ctx.current = payload;
          }
        }),
        // #region NeedToFetch
        addNeedToFetch: _assign(ctx => ctx.needToFecth++),
        rinitNeedToFetch: _assign(ctx => (ctx.needToFecth = 0)),
        // #endregion
        assignAsyncError: assign({
          error: (_, _event: any) => {
            if (!_event.data) return undefined;
            const data = _event.data;
            if (data instanceof StateError) {
              return data.message;
            }
            return undefined;
          },
        }),
        update: assign({
          mutations: (ctx, event) => {
            if (event.type !== 'update') return undefined;
            return [...(ctx.mutations ?? []), event.data];
          },
        }),
        delete: assign({
          mutations: (ctx, ev) => {
            if (ev.type !== 'delete') return undefined;
            const next = {
              _deletedAt: false,
            } as DPW<T>;
            return [...(ctx.mutations ?? []), next];
          },
        }),
        rinitMutations: _assign(ctx => (ctx.mutations = [])),

        retrieve: assign({
          mutations: (ctx, event) => {
            if (event.type !== 'retrieve') return undefined;
            if (!ctx.mutations) return undefined;
            const next = {
              _deletedAt: false,
            } as DPW<T>;
            return [...ctx.mutations, next];
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
