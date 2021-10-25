import type { Entity } from 'core-data';
import type { StateMachine } from 'xstate';
import type { SingleContext } from './context';
import type { SingleEvent } from './event';
import type { SingleTypeState } from './state';

export type SingleMachine<T extends Entity> = StateMachine<
  SingleContext<T>,
  any,
  SingleEvent<T>,
  SingleTypeState<T>
>;
