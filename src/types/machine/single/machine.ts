import { StateMachine } from 'xstate';
import { DocumentData } from '../../data';
import { SingleContext } from './context';
import { SingleEvent } from './event';
import { SingleTypeState } from './state';

export type SingleMachine<T extends DocumentData> = StateMachine<
  SingleContext<T>,
  any,
  SingleEvent<T>,
  SingleTypeState<T>
>;
