import { NFunction } from 'core';
import ReturnData, { error, isTimeout } from 'core-promises';
import { assign, createMachine, sendParent, StateMachine } from 'xstate';
import { RDContext } from './context';
import { RDEvent } from './event';
import { RDState } from './state';

// #region Configuration

type RDStateKeys = keyof Pick<
  ReturnData<any, any>,
  | 'isClienError'
  | 'isInformation'
  | 'isRedirect'
  | 'isPermission'
  | 'isServerError'
  | 'isSuccess'
  | 'isTimeoutError'
>;

type StateType = 'atomic' | 'compound' | 'parallel' | 'final' | 'history';

function guardRD<TC>(func: RDStateKeys) {
  const out = (_: TC, ev: any) => {
    const data = ev.data;
    if (data instanceof ReturnData) {
      return data[func];
    }
    return false;
  };
  return out;
}

export const guardedTransitions = [
  {
    cond: 'isClientError',
    actions: 'assignData',
    target: 'ClientError',
  },
  {
    cond: 'isInformation',
    actions: 'assignData',
    target: 'Information',
  },
  {
    cond: 'isRedirect',
    actions: 'assignData',
    target: 'PermissionError',
  },
  {
    cond: 'isPermissionError',
    actions: 'assignData',
    target: 'Redirect',
  },
  {
    cond: 'isServerError',
    actions: 'assignData',
    target: 'ServerError',
  },
  {
    cond: 'isSuccess',
    actions: 'assignData',
    target: 'Success',
  },
  {
    cond: 'isTimeoutError',
    actions: 'assignData',
    target: 'TimeoutError',
  },
];

// #endregion

export function createRDMachine<I extends any, O>(
  func: NFunction<[I], Promise<ReturnData<O, any>>>,
): StateMachine<RDContext<O>, any, RDEvent<I>, RDState<O>> {
  const entry = 'iterate';
  const state = {
    entry,
    on: {
      SEND: 'Pending',
    },
  };

  return createMachine<RDContext<O>, RDEvent<I>, RDState<O>>(
    {
      context: {
        iterator: 0,
      },
      initial: 'Idle',
      states: {
        Idle: state,
        Pending: {
          entry,
          invoke: {
            src: (_, ev) => func(ev.data),
            onDone: guardedTransitions,
            onError: guardedTransitions,
          },
        },
        ClientError: {
          entry: sendParent(ctx => {
            if (!ctx.data) error();
            return ctx.data.maybeMap({
              client: (status, message) => ({
                type: 'SEND',
                status,
                message,
              }),
              else: error,
            });
          }),
          on: {
            SEND: 'Pending',
          },
        },
        Information: {
          entry: sendParent(ctx => {
            if (!ctx.data) error();
            return ctx.data.maybeMap({
              information: (status, payload, message) => ({
                type: 'SEND',
                status,
                payload,
                message,
              }),
              else: error,
            });
          }),
          on: {
            SEND: 'Pending',
          },
        },
        PermissionError: {
          entry: sendParent(ctx => {
            if (!ctx.data) error();
            return ctx.data.maybeMap({
              permission: (status, payload, notPermitteds) => ({
                type: 'SEND',
                payload,
                notPermitteds,
              }),
              else: error,
            });
          }),
          on: {
            SEND: 'Pending',
          },
        },
        Redirect: {
          entry: sendParent(ctx => {
            if (!ctx.data) error();
            return ctx.data.maybeMap({
              redirect: (status, payload, message) => ({
                type: 'SEND',
                status,
                payload,
                message,
              }),
              else: error,
            });
          }),
          on: {
            SEND: 'Pending',
          },
        },
        ServerError: {
          entry: sendParent(ctx => {
            if (!ctx.data) error();
            return ctx.data.maybeMap({
              server: (status, message) => ({
                type: 'SEND',
                status,
                message,
              }),
              else: error,
            });
          }),
          on: {
            SEND: 'Pending',
          },
        },
        Success: {
          entry: sendParent(ctx => {
            if (!ctx.data) error();
            return ctx.data.maybeMap({
              success: (status, payload) => ({
                type: 'SEND',
                status,
                payload,
              }),
              else: error,
            });
          }),
          on: {
            SEND: 'Pending',
          },
        },
        TimeoutError: {
          entry: sendParent(ctx => {
            if (!ctx.data) error();
            return ctx.data.maybeMap({
              timeout: status => ({ type: 'SEND', status }),
              else: error,
            });
          }),
          on: {
            SEND: 'Pending',
          },
        },
      },
    },
    {
      actions: {
        iterate: assign({ iterator: ctx => ctx.iterator + 1 }),
        assignData: assign({
          data: (_, ev: any) => ev.data,
        }),
      },
      guards: {
        isClientError: guardRD('isClienError'),
        isInformation: guardRD('isInformation'),
        isRedirect: guardRD('isRedirect'),
        isPermissionError: guardRD('isPermission'),
        isServerError: guardRD('isServerError'),
        isSuccess: guardRD('isSuccess'),
        isTimeoutError: guardRD('isTimeoutError'),
      },
    },
  );
}
