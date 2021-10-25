import { NFunction } from 'core';
import ReturnData from 'core-promises';
import { assign, createMachine, interpret, StateMachine } from 'xstate';
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

function guardRD(func: RDStateKeys) {
  const out = (_: any, ev: any) => {
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
        ClientError: state,
        Information: state,
        PermissionError: state,
        Redirect: state,
        ServerError: state,
        Success: state,
        TimeoutError: state,
      },
    },
    {
      actions: {
        iterate: assign({ iterator: ctx => ctx.iterator + 1 }),
        assignData: assign({
          data: (_, ev: any) => {
            const data = ev.data;
            if (data instanceof ReturnData) {
              return data;
            }
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

async function tt({ id, password }: { id?: string; password: string }) {
  return new ReturnData({
    status: 200,
    payload: 2,
  });
}

// #region Test
const interp = interpret(createRDMachine(tt));
interp.send({ type: 'SEND', data: { password: '' } });
// #endregion
