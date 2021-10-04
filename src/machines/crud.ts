import produce from 'immer';
import {
  ActionTypes,
  assign,
  createMachine as create,
  ErrorPlatformEvent,
  ServiceConfig,
} from 'xstate';
import { createModel } from 'xstate/lib/model';
import isErrorStateString from '../functions/isErrorString';
import { CRUD } from '../types/crud';
import StateError from '../types/error';
import { TC, TE } from '../types/machine';

export default function createMachine<T>(crud: CRUD<T>) {
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
      { target: 'error' },
    ],
  };
  const machine = create<TC<T>, TE<T>>(
    {
      context: {
        iterator: 0,
        needToFecth: 0,
      },
      states: {
        idle: {
          on: {},
        },
        update: {
          invoke: {
            src: 'update',
            ...asyncHandle,
          },
        },
        set: {
          invoke: {
            src: 'set',
            ...asyncHandle,
          },
        },
        delete: {
          invoke: {
            src: 'delete',
            ...asyncHandle,
          },
        },
        remove: {
          invoke: {
            src: 'remove',
            ...asyncHandle,
          },
        },
        retrieve: {
          invoke: {
            src: 'retrieve',
            ...asyncHandle,
          },
        },
        fetch: {
          invoke: {
            src: 'fetch',
            ...produce(asyncHandle, draft => {
              draft.onDone.actions.push(
                'assignCurrent',
                'assignPreviousassignPrevious'
              );
            }),
          },
        },
        checking: {
          always: {},
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
        assignPrevious: assign({ previous: ctx => ctx.current }),
        assignCurrent: assign({
          current: (_, _event: any) => {
            if (!_event.data) return undefined;
            return _event.data;
          },
        }),
        // #region NeedToFetch
        addNeedToFetch: assign({
          needToFecth: ({ needToFecth }) => needToFecth++,
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
      },
      services: {
        update: async (ctx, ev) => {
          if (ev.type !== 'update') {
            throw new StateError('incorrectState');
          }
          if (!ctx.id) throw new StateError('idNotDefined');
          const updatedID = await crud.updateOneById(ctx.id, ev.data);
          if (updatedID !== ctx.id) throw new Error('idNotMatch');
        },
        set: async (ctx, ev) => {
          if (ev.type !== 'set') throw new StateError('incorrectState');
          if (!ctx.id) throw new StateError('idNotDefined');
          const setID = await crud.setOneById(ctx.id, ev.data);
          if (setID !== ctx.id) throw new Error('idNotMatch');
        },
        delete: async (ctx, ev) => {
          if (ev.type !== 'delete') throw new StateError('incorrectState');
          if (!ctx.id) throw new StateError('idNotDefined');
          const deletedID = await crud.deleteOneById(ctx.id);
          if (deletedID !== ctx.id) throw new Error('idNotMatch');
        },
        remove: async (ctx, ev) => {
          if (ev.type !== 'delete') throw new StateError('incorrectState');
          if (!ctx.id) throw new StateError('idNotDefined');
          const removedID = await crud.removeOneById(ctx.id);
          if (removedID !== ctx.id) throw new Error('idNotMatch');
        },
        retrieve: async (ctx, ev) => {
          if (ev.type !== 'delete') throw new StateError('incorrectState');
          if (!ctx.id) throw new StateError('idNotDefined');
          const retrievedID = await crud.retrieveOneById(ctx.id);
          if (retrievedID !== ctx.id) throw new Error('idNotMatch');
        },
        fetch: async (ctx, ev) => {
          if (ev.type !== 'delete') throw new StateError('incorrectState');
          if (!ctx.id) throw new StateError('idNotDefined');
          const fetchData = await crud.readOneById(ctx.id);
          if (fetchData.id !== ctx.id) throw new Error('idNotMatch');
          return fetchData;
        },
      },
    }
  );
}
