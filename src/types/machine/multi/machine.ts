import { StateMachine } from 'xstate';
import { DocumentData } from '../../data';
import { MultiContext } from './context';
import { MultiEvent } from './event';
import { MultiTypeState } from './state';

export type MultiMachine<T extends DocumentData> = StateMachine<
  MultiContext<T>,
  any,
  MultiEvent,
  MultiTypeState<T>
>;
