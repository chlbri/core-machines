/* eslint-disable @typescript-eslint/no-unused-vars */
import { CRUD, Entity, QueryOptions } from 'core-data';
import ReturnData from 'core-promises';
import produce from 'immer';
import {
  assign,
  createMachine as create,
  TransitionsConfig,
} from 'xstate';
import StateError from '../types/error';
import {
  SingleContext,
  SingleEvent,
  SingleTypeState,
} from '../types/machine/single';
import { DPW } from '../types/_config';

export type DAOSingle<T extends Entity> = Pick<
  CRUD<T>,
  | 'updateOneById'
  | 'setOneById'
  | 'deleteOneById'
  | 'removeOneById'
  | 'retrieveOneById'
  | 'readOneById'
>;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function createModifMachine<T extends Entity>(
  crud: DAOSingle<T>,
  options?: QueryOptions,
) {
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
      target: 'update',
    },

    delete: {
      target: 'delete',
    },
    remove: {
      target: 'remove',
    },
    retrieve: {
      target: 'retrieve',
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
      context: {
        iterator: 0,
        needToFecth: 0,
        mutations: [],
      },
      states: {
        idle: {
          on: onEvents,
        },
        update: {
          entry,
          always: {
            actions: 'update',
            target: 'pending',
          },
        },
        pending: {
          entry,
          on: {
            save: {},
          },
        },

        delete: {
          entry,
          always: {
            actions: 'delete',
            target: 'pending',
          },
        },
        remove: {
          entry,
          invoke: {
            src: 'remove',
            ...asyncHandle,
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
              draft.onDone.actions = ['assignPrevious', 'assignCurrent'];
              draft.onError = [{ target: 'error', actions: [] }];
            }),
          },
        },
        refetch: {
          entry,

          invoke: {
            src: 'refetch',
            ...produce(asyncHandle, draft => {
              draft.onDone.actions = ['assignPrevious', 'assignCurrent'];
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
      },

      actions: {
        iterate: assign({ iterator: ctx => ctx.iterator + 1 }),
        assignPrevious: assign({ previous: ctx => ctx.current }),
        assignCurrent: assign({
          current: (ctx, _event: any) => {
            if (!_event.data) return undefined;
            const data = _event.data;
            if (data instanceof ReturnData) {
              const _data = data as ReturnData<T, any>;
              return _data.forEach({
                client: () => {
                  throw new Error();
                },
                information: () => {
                  throw new Error();
                },
                permission: () => {
                  throw new Error();
                },
                redirect: () => {
                  throw new Error();
                },
                server: () => {
                  throw new Error();
                },
                success: (_, { _id, ...payload }) => {
                  console.log('payload', '=>', ctx.previous);

                  return payload as DPW<T>;
                },
                timeout: () => {
                  throw new Error();
                },
              });
            }
            return undefined;
          },
          _id: (_, ev) => {
            if (!ev.data) return undefined;
            const data = ev.data;
            if (data instanceof ReturnData) {
              const _data = data as ReturnData<T, any>;

              return _data.forEach({
                client: () => {
                  throw new Error();
                },
                information: () => {
                  throw new Error();
                },
                permission: () => {
                  throw new Error();
                },
                redirect: () => {
                  throw new Error();
                },
                server: () => {
                  throw new Error();
                },
                success: (_, payload) => {
                  return payload._id;
                },
                timeout: () => {
                  throw new Error();
                },
              });
            }
            return undefined;
          },
        }),
        // #region NeedToFetch
        addNeedToFetch: assign({
          needToFecth: ctx => ctx.needToFecth + 1,
        }),
        rinitNeedToFetch: assign({
          needToFecth: _ => 0,
        }),
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
            if (!ctx.mutations) return undefined;
            return [...ctx.mutations, event.data];
          },
        }),
        delete: assign({
          mutations: (ctx, ev) => {
            if (ev.type !== 'delete') return undefined;
            if (!ctx.mutations) return undefined;
            const next = {
              _deletedAt: false,
            } as DPW<T>;

            return [...ctx.mutations, next];
          },
        }),

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
        save: (ctx, ev) => {
          if (ev.type !== 'update') {
            throw new StateError('incorrectState');
          }
          if (!ctx._id) throw new StateError('idNotDefined');
          if (!ctx.mutations) throw new StateError('noMutations');
          if (!ctx.mutations.length)
            throw new StateError('emptyMutations');
          return crud.updateOneById(ctx._id, ev.data);
        },
        remove: (ctx, ev) => {
          if (ev.type !== 'remove') {
            throw new StateError('incorrectState');
          }
          if (!ctx._id) throw new StateError('idNotDefined');
          return crud.removeOneById('ctx.id');
        },

        fetch: (_, ev) => {
          if (ev.type !== 'fetch') throw new StateError('incorrectState');
          if (!ev.id) throw new StateError('idNotDefined');
          return crud.readOneById(ev.id);
        },
        refetch: (ctx, ev) => {
          if (ev.type !== 'refetch')
            throw new StateError('incorrectState');
          if (!ctx._id) throw new StateError('idNotDefined');
          return crud.readOneById(ctx._id);
        },
      },
    },
  );

  return machine;
}
