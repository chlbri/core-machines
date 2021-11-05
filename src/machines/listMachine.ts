/* eslint-disable @typescript-eslint/no-unused-vars */
import { CRUD, DSO, Entity, QueryOptions } from 'core-data';
import produce from 'immer';
import {
  assign,
  createMachine as create,
  TransitionsConfig,
} from 'xstate';
import { DataConverter } from '../types';
import StateError from '../types/error';
// import StateError from '../types/error';
import {
  MultiContext,
  MultiEvent,
  MultiMachine,
} from '../types/machine/multi';

// export type DAOSingle<T> = CRUD<T>;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types

type CreateListMachineOptions<T extends Entity> = {
  col: string;
  pageSize?: number;
  filters?: DSO<T>;
  options?: QueryOptions;
};

export type DAOList<T extends Entity> = Pick<
  CRUD<T>,
  | 'count'
  | 'countAll'
  | 'readMany'
  | 'readOneById'
  | 'deleteOneById'
  | 'retrieveOneById'
  | 'removeOneById'
>;

export default function createListMachine<T extends Entity>(
  dao: DAOList<T>,
  {
    col,
    pageSize,
    filters = {},
    options = {},
  }: CreateListMachineOptions<T>,
) /* : MultiMachine<T> */ {
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
            onDone: {
              target: 'success',
              actions: [
                'assign_previous',
                'assign_current',
                'assign_total',
                'assign_totalPages',
                'assign_selectedValues',
              ],
            },
            onError: [
              {
                cond: 'isEmpty',
                target: 'internalError',
              },
              { target: 'error' },
            ],
          },
          exit: ['fetchNextEnd', 'assign_lastId'],
        },

        refetching: {},
        deleting: {
          entry,
          invoke: {
            src: 'delete',
            onDone: {
              target: 'success',
            },
            onError: [
              {
                target: 'error',
              },
            ],
          },
        },
        removing: {
          entry,
          invoke: {
            src: 'remove',
            onDone: {
              target: 'success',
            },
            onError: [
              {
                target: 'error',
              },
            ],
          },
        },

        internalError: {
          entry,
        },

        success: {
          entry,
          on: {
            FETCH: {
              target: 'fetching',
            },
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
            DELETE: 'deleting',
            REMOVE: 'removing',
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
        iterate: assign({ iterator: ctx => ctx.iterator + 1 }),
        goToFirstPage: assign({ currentPage: _ => 0 }),
        goToLastPage: assign({
          currentPage: ctx => {
            if (!ctx.totalPages) throw new Error();
            return ctx.totalPages - 1;
          },
        }),
        goToNextPage: assign({ currentPage: ctx => ctx.currentPage + 1 }),
        goToPrevPage: assign({ currentPage: ctx => ctx.currentPage - 1 }),
        assign_selectedValues: assign({
          selectedValues: ctx => {
            if (!ctx.current) throw new Error();

            const first = ctx.pageSize * ctx.currentPage;
            const last = first + ctx.pageSize;
            return ctx.current.slice(first, last);
          },
        }),
        assign_previous: assign({
          previous: ctx => ctx.current,
        }),
        assign_current: assign({
          current: (ctx, event: any) => {
            if (!event?.data?.data) throw new Error();
            const datas = event.data.data;
            if (!Array.isArray(datas)) throw new Error();
            const isArrayOfT = datas.map(data => !!data.id);
            if (!isArrayOfT) throw new Error();
            return produce(ctx.current ?? [], draft => {
              draft.push(...datas);
            });
          },
        }),

        assign_totalPages: assign({
          totalPages: ctx => {
            if (!ctx.total) throw new Error();
            if (ctx.pageSize === 0) throw new Error();
            const division = Math.ceil(ctx.total / ctx.pageSize);
            const isZero = division === 0;
            return isZero ? 1 : division;
          },
        }),
        assign_total: assign({
          total: ctx => {
            if (!ctx.current) throw new Error();

            return ctx.current.length;
          },
        }),
        assign_pageSize: assign({
          pageSize: (ctx, event) => {
            if (event.type !== 'CHANGE_PAGE_SIZE') throw new Error();
            return event.pageSize;
          },
        }),

        assign_canGoToPrevPage: assign({
          canGoToPrevPage: ctx => (ctx.currentPage > 0 ? true : undefined),
        }),
        assign_totalExceedDataBaseTotalError: assign({
          totalExceedTotalFromDatabase: ctx => {
            if (!ctx.total) throw new Error();
            if (!ctx.totalFromDatabase) throw new Error();

            return ctx.total > ctx.totalFromDatabase ? true : undefined;
          },
        }),
        assign_canNextFetch: assign({
          canNextFetch: ctx => {
            if (!ctx.total) throw new Error();
            if (!ctx.totalFromDatabase) throw new Error();
            if (!ctx.totalPages) throw new Error();
            if (!ctx.maxFromDatabase) throw new Error();
            return ctx.currentPage === ctx.totalPages - 1 &&
              ctx.total < ctx.totalFromDatabase &&
              ctx.total < ctx.maxFromDatabase
              ? true
              : undefined;
          },
        }),
        fetchNextStart: assign({
          nextFetching: _ => true,
        }),
        assign_lastId: assign({
          lastId: ctx => ctx.current?.[0]?._id,
        }),
        fetchNextEnd: assign({
          nextFetching: _ => undefined,
        }),

        assign_canGoToNextPage: assign({
          canGoToNextPage: ctx => {
            if (!ctx.totalPages) throw new Error();

            return ctx.currentPage < ctx.totalPages - 2 ? true : undefined;
          },
        }),
        assign_error: assign({
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
        fetch: async ctx => {
          const _options = produce(options, draft => {
            draft.after = ctx.lastId;
          });
          const data = await dao.readMany({ filters, options: _options });

          const size = await dao.count({ filters, options: _options });
          return data.successMap({
            success: (_, data) => {
              const lastId = [...data].pop()?._id;
              const out = { data, size, lastId };
              return out;
            },
          });
        },
        refetch: async ctx => {
          const _options = { ...options, after: ctx.lastId };
          const data = await dao.readMany({filters, options:_options});
          const size = await dao.count({ filters, options: _options });
          const out = { data, size };
          return out;
        },

        delete: async (ctx, ev) => {
          if (ev.type !== 'DELETE') throw new Error();
          return await dao.deleteOneById({ id: ev.id, options });
        },
        remove: async (ctx, ev) => {
          if (ev.type !== 'REMOVE') throw new Error();
          return await dao.removeOneById({ id: ev.id, options });
        },
      },
      guards: {
        canNextFetch: ctx => ctx.canNextFetch === true,
        canGoToNextPage: ctx => ctx.canGoToNextPage === true,
        canGoToPrevPage: ctx => ctx.canGoToPrevPage === true,
        nextFetching: ctx => ctx.nextFetching === true,
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
    },
  );

  return machine;
}
