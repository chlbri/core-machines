import { Entity } from 'core-data';
import { DPW } from '../../_config';

export type SingleEvent<T extends Entity> =
  | { type: 'update'; data: DPW<T> }
  | { type: 'set'; data: DPW<T> }
  | { type: 'delete' }
  | { type: 'remove' }
  | { type: 'retrieve' }
  | { type: 'SEND' }
  | { type: 'save' }
  | { type: 'fetch'; _id: string }
  | { type: 'refetch' };
