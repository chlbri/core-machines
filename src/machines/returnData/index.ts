import { NFunction } from 'core';
import ReturnData, { isTimeout, _ReturnData } from 'core-promises';
import { assign, createMachine, sendParent, StateMachine } from 'xstate';
import { RDContext } from './context';
import { RDEvent } from './event';
import { RDState } from './state';

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

  const final = { ...state, type: 'final' as StateType };
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
        ClientError: final,
        Information: final,
        PermissionError: final,
        Redirect: final,
        ServerError: final,
        Success: final,
        TimeoutError: {
          entry: [
            sendParent(ctx => {
              if (!ctx.data) return { type: '' };
              const data = ctx.data;
              if (!isTimeout(data)) {
                return { type: '' };
              }
              return { type: 'SEND', data: { status: data.status } };
            }),
            () => {
              console.log('respond to');
            },
          ],
        },
      },
    },
    {
      actions: {
        iterate: assign({ iterator: ctx => ctx.iterator + 1 }),
        assignData: assign({
          data: (_, ev: any) => {
            const data = ev.data;
            if (data instanceof ReturnData) {
              return data.map<_ReturnData<O, any>>({
                client: (status, message) => ({
                  status,
                  message,
                }),
                information: (status, payload, message) => ({
                  status,
                  payload,
                  message,
                }),
                permission: (status, payload, notPermitteds) => ({
                  status,
                  payload,
                  notPermitteds,
                }),
                redirect: (status, payload, message) => ({
                  status,
                  payload,
                  message,
                }),
                server: (status, message) => ({
                  status,
                  message,
                }),
                success: (status, payload) => ({
                  status,
                  payload,
                }),
                timeout: status => ({
                  status,
                }),
              });
            }
            return undefined;
          },
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
