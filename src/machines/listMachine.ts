/* eslint-disable @typescript-eslint/no-unused-vars */
import produce from 'immer';
import { createMachine as create, TransitionsConfig } from 'xstate';
import { CRUD } from '../types/crud';
// import StateError from '../types/error';
import { MultiContext, MultiEvent } from '../types/machine/multi';
import { SingleEvent } from '../types/machine/single';

// export type DAOSingle<T> = CRUD<T>;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types

type CreateListMachineProps = {
  col: string;
  pageSize?: number;
};

export default function createListMachine<T>(
  crud: CRUD<T>,
  { col, pageSize }: CreateListMachineProps
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

  const onEvents: TransitionsConfig<MultiContext<T>, SingleEvent<T>> = {
    update: {
      target: 'update',
    },
    set: {
      target: 'set',
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

  const machine = create<MultiContext<T>, MultiEvent<T>>(
    {
      initial: 'idle',
      context: {
        iterator: 0,
        needToFecth: 0,
        col,
        pageSize: pageSize ?? 20,
        currentPage: 0,
      },
      states: {
        idle: {
          // on: onEvents,
        },
        createMany: {},
        createOne: {},
        upsertOne: {},
        readAll: {},
        readMany: {},
        readManyByIds: {},
        readOne: {},
        readOneById: {},
        countAll: {},
        count: {},
        updateAll: {},
        updateMany: {},
        updateManyByIds: {},
        updateOne: {},
        updateOneById: {},
        setAll: {},
        setMany: {},
        setManyByIds: {},
        setOne: {},
        setOneById: {},
        deleteAll: {},
        deleteMany: {},
        deleteManyByIds: {},
        deleteOne: {},
        deleteOneById: {},
        removeAll: {},
        removeMany: {},
        removeManyByIds: {},
        removeOne: {},
        removeOneById: {},
        retrieveAll: {},
        retrieveMany: {},
        retrieveManyByIds: {},
        retrieveOne: {},
        retrieveOneById: {},

        internalError: {
          entry,

          always: {},
        },

        success: {
          entry,

          // on: onEvents,
        },

        error: {
          entry,

          // on: onEvents,
        },
      },
    },
    {
      services: {
        rert: () => {
          return crud.count({});
        },
      },
    }
    // {
    //   guards: {
    //     isError_idNotMatch: (_, _event: any) => {
    //       if (!_event.data) return false;
    //       const data = _event.data;
    //       if (data instanceof StateError) {
    //         return data.message === 'idNotMatch';
    //       }
    //       return false;
    //     },
    //   },

    //   actions: {
    //     iterate: assign({ iterator: (ctx) => ctx.iterator + 1 }),
    //     assignPrevious: assign({ previous: (ctx) => ctx.current }),
    //     assignCurrent: assign({
    //       current: (_, _event: any) => {
    //         if (!_event.data) return undefined;
    //         return _event.data;
    //       },
    //     }),
    //     // #region NeedToFetch
    //     addNeedToFetch: assign({
    //       needToFecth: (ctx) => ctx.needToFecth + 1,
    //     }),
    //     rinitNeedToFetch: assign({
    //       needToFecth: (_) => 0,
    //     }),
    //     // #endregion
    //     assignAsyncError: assign({
    //       error: (_, _event: any) => {
    //         if (!_event.data) return undefined;
    //         const data = _event.data;
    //         if (data instanceof StateError) {
    //           return data.message;
    //         }
    //         return undefined;
    //       },
    //     }),
    //   },

    //   services: {
    //     update: async (ctx, ev) => {
    //       if (ev.type !== 'update') {
    //         throw new StateError('incorrectState');
    //       }
    //       if (!ctx.id) throw new StateError('idNotDefined');
    //       const updatedID = await crud.updateOneById(ctx.id, ev.data);
    //       if (updatedID !== ctx.id) throw new Error('idNotMatch');
    //     },

    //     set: async (ctx, ev) => {
    //       if (ev.type !== 'set') throw new StateError('incorrectState');
    //       if (!ctx.id) throw new StateError('idNotDefined');
    //       const setID = await crud.setOneById(ctx.id, ev.data);
    //       if (setID !== ctx.id) throw new Error('idNotMatch');
    //     },

    //     delete: async (ctx, ev) => {
    //       if (ev.type !== 'delete') throw new StateError('incorrectState');
    //       if (!ctx.id) throw new StateError('idNotDefined');
    //       const deletedID = await crud.deleteOneById(ctx.id);
    //       if (deletedID !== ctx.id) throw new Error('idNotMatch');
    //     },

    //     remove: async (ctx, ev) => {
    //       if (ev.type !== 'remove') throw new StateError('incorrectState');
    //       if (!ctx.id) throw new StateError('idNotDefined');
    //       const removedID = await crud.removeOneById(ctx.id);
    //       if (removedID !== ctx.id) throw new Error('idNotMatch');
    //     },

    //     retrieve: async (ctx, ev) => {
    //       if (ev.type !== 'retrieve') throw new StateError('incorrectState');
    //       if (!ctx.id) throw new StateError('idNotDefined');
    //       const retrievedID = await crud.retrieveOneById(ctx.id);
    //       if (retrievedID !== ctx.id) throw new Error('idNotMatch');
    //     },

    //     fetch: async (ctx, ev) => {
    //       if (ev.type !== 'fetch') throw new StateError('incorrectState');
    //       if (!ev.id) throw new StateError('idNotDefined');
    //       const fetchData = await crud.readOneById(ev.id);
    //       if (fetchData.id !== ctx.id) throw new Error('idNotMatch');
    //       return fetchData;
    //     },
    //     refetch: async (ctx, ev) => {
    //       if (ev.type !== 'refetch') throw new StateError('incorrectState');
    //       if (!ctx.id) throw new StateError('idNotDefined');
    //       const fetchData = await crud.readOneById(ctx.id);
    //       if (fetchData.id !== ctx.id) throw new Error('idNotMatch');
    //       return fetchData;
    //     },
    //   },
    // }
  );

  return machine;
}
