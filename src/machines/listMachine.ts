/* eslint-disable @typescript-eslint/no-unused-vars */
import produce from 'immer';
import { assign, createMachine as create, TransitionsConfig } from 'xstate';
import { DataConverter } from '../types';
import { CRUD, QueryOptions, QueryParams } from '../types/crud';
import StateError from '../types/error';
// import StateError from '../types/error';
import { MultiContext, MultiEvent } from '../types/machine/multi';

// export type DAOSingle<T> = CRUD<T>;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types

type CreateListMachineOptions<T extends { id?: string }> = {
  col: string;
  pageSize?: number;
  filters?: QueryParams<T>;
  options?: QueryOptions;
};

export type DAOList<T> = Pick<
  CRUD<T>,
  | 'count'
  | 'countAll'
  | 'readMany'
  | 'readOneById'
  | 'deleteOneById'
  | 'retrieveOneById'
  | 'removeOneById'
>;

export default function createListMachine<T extends { id?: string }>(
  dao: DAOList<T>,
  { col, pageSize, filters = {}, options = {} }: CreateListMachineOptions<T>
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

  const machine = create<MultiContext<T>, MultiEvent>(
    {
      initial: 'idle',
      context: {
        iterator: 0,
        needToFecth: 0,
        col,
        pageSize: pageSize ?? 20,
        currentPage: 0,
        maxFromDatabase: options.limit ?? 1000,
      },
      states: {
        idle: {
          // on: onEvents,
          on: {
            FETCH: 'fetching',
          },
        },

        fetching: {
          entry,
          invoke: {
            src: 'fetch',
            onDone: 'success',
            onError: [
              {
                cond: 'isEmpty',
                target: 'internalError',
              },
              { target: 'error' },
            ],
          },
          exit: ['fetchNextEnd'],
        },

        successAssignments: {
          entry,
          always: {
            target: 'success',
            actions: [
              'assignPrevious',
              'assignCurrent',
              'assignTotal',
              'assignTotalPages',
            ],
          },
        },

        refetching: {},
        deleting: {},
        removing: {},

        internalError: {
          entry,
        },

        success: {
          entry,
          on: {
            PREVIOUS: [
              {
                cond: 'canGoToPrevPage',
                actions: ['goToPrevPage' /* , 'assignSelectedValues' */],
              },
              { target: 'internalError' },
            ],
            NEXT: [
              {
                cond: 'canNextFetch',
                actions: ['fetchNextStart'],
                target: 'fetching',
              },
              {
                cond: 'canGoToNextPage',
                actions: ['goToNextPage' /* , 'assignSelectedValues' */],
              },
              { target: 'internalError' },
            ],
          },
          // on: onEvents,
        },

        error: {
          entry,
          on: {
            REFETCH: {},
          },
          // on: onEvents,
        },
      },
    },
    {
      actions: {
        iterate: assign({ iterator: (ctx) => ctx.iterator + 1 }),
        goToFirstPage: assign({ currentPage: (_) => 0 }),
        goToLastPage: assign({
          currentPage: (ctx) => {
            if (!ctx.totalPages) throw new Error();
            return ctx.totalPages - 1;
          },
        }),
        goToNextPage: assign({ currentPage: (ctx) => ctx.currentPage + 1 }),
        goToPrevPage: assign({ currentPage: (ctx) => ctx.currentPage - 1 }),
        assignSelectedValues: assign({
          selectedValues: (ctx) => {
            if (!ctx.currentPage) throw new Error();
            if (!ctx.current) throw new Error();

            const first = ctx.pageSize * ctx.currentPage;
            const last = first + ctx.pageSize;
            return ctx.current.slice(first, last);
          },
        }),
        assignPrevious: assign({
          previous: (ctx) => ctx.current,
        }),
        assignCurrent: assign({
          current: (ctx, event: any) => {
            if (!event.data) throw new Error();
            const datas = event.data;
            if (!Array.isArray(datas)) throw new Error();
            const isArrayOfT = datas.map((data) => !!data.id);
            if (!isArrayOfT) throw new Error();
            return produce(ctx.current ?? [], (draft) => {
              draft.push(...datas);
            });
          },
        }),

        assignTotalPages: assign({
          totalPages: (ctx) => {
            if (!ctx.total) throw new Error();
            if (ctx.pageSize === 0) throw new Error();
            const division = Math.ceil(ctx.total / ctx.pageSize);
            const isZero = division === 0;
            return isZero ? 1 : division;
          },
        }),
        assignTotal: assign({
          total: (ctx) => {
            if (!ctx.current) throw new Error();

            return ctx.current.length;
          },
        }),
        assignPageSize: assign({
          pageSize: (ctx, event) =>
            event.type === 'CHANGE_PAGE_SIZE' ? event.pageSize : ctx.pageSize,
        }),

        canGoToPrevPage: assign({
          canGoToPrevPage: (ctx) => (ctx.currentPage > 0 ? true : undefined),
        }),
        assignTotalExceedDataBaseTotalError: assign({
          totalExceedTotalFromDatabase: (ctx) => {
            if (!ctx.total) throw new Error();
            if (!ctx.totalFromDataBase) throw new Error();

            return ctx.total > ctx.totalFromDataBase ? true : undefined;
          },
        }),
        canNextFetch: assign({
          canNextFetch: (ctx) => {
            if (!ctx.total) throw new Error();
            if (!ctx.totalFromDataBase) throw new Error();
            if (!ctx.totalPages) throw new Error();
            if (!ctx.maxFromDatabase) throw new Error();
            return ctx.currentPage === ctx.totalPages - 1 &&
              ctx.total < ctx.totalFromDataBase &&
              ctx.total < ctx.maxFromDatabase
              ? true
              : undefined;
          },
        }),
        fetchNextStart: assign({
          nextFetching: (_) => true,
        }),
        assignLastId: assign({
          lastId: (ctx) => {
            if (!ctx.current) throw new Error();
            if (!ctx.current.length) throw new Error();
            return ctx.current[0].id;
          },
        }),
        fetchNextEnd: assign({
          nextFetching: (_) => undefined,
        }),

        canGoToNextPage: assign({
          canGoToNextPage: (ctx) => {
            if (!ctx.totalPages) throw new Error();

            return ctx.currentPage < ctx.totalPages - 2 ? true : undefined;
          },
        }),
        assignError: assign({
          error: (_, _event: any) => {
            if (!_event.data) return undefined;
            const data = _event.data;
            if (data instanceof StateError) {
              return data.message;
            }
            return undefined;
          },
        }),
      },
      services: {
        fetch: async (ctx) => {
          const _options = produce(options, (draft) => {
            draft.after = ctx.lastId;
          });
          const data = await dao.readMany(filters, _options);

          if (!data.length) throw new StateError('noData');

          const size = await dao.count(filters, _options);
          const lastId = [...data].pop()?.id;
          const out = { data, size, lastId };
          return out;
        },
        refetch: async (ctx) => {
          const _options = { ...options, after: ctx.lastId };
          const data = await dao.readMany(filters, _options);
          const size = await dao.count(filters, _options);
          const out = { data, size };
          return out;
        },

        delete: async (ctx, ev) => {
          if (ev.type !== 'DELETE') throw new Error();
          return await dao.deleteOneById(ev.id, options);
        },
        remove: async (ctx, ev) => {
          if (ev.type !== 'REMOVE') throw new Error();
          return await dao.deleteOneById(ev.id, options);
        },
      },
      guards: {
        canNextFetch: (ctx) => ctx.canNextFetch === true,
        canGoToNextPage: (ctx) => ctx.canGoToNextPage === true,
        canGoToPrevPage: (ctx) => ctx.canGoToPrevPage === true,
        nextFetching: (ctx) => ctx.nextFetching === true,
        targetPageIsWithinBounds: (ctx, event) => {
          if (event.type !== 'GO_TO_TARGET_PAGE') return false;
          if (!ctx.totalPages) throw new Error();
          return event.page >= 0 && event.page <= ctx.totalPages;
        },
        isEmpty: (ctx, event: any) => {
          if (!event.data) throw new Error();
          const data = event.data;

          if (data instanceof StateError) {
            if (data.message === 'noData') {
              return true;
            }
          }

          return false;
        },
      },
    }
  );

  return machine;
}
