import { Entity } from 'core-data';
import { StateMachine } from 'xstate';
import { MultiContext } from './context';
import { MultiEvent } from './event';
import { MultiTypeState } from './state';

export type MultiMachine<T extends Entity> = StateMachine<
  MultiContext<T>,
  any,
  MultiEvent,
  MultiTypeState<T>
>;
