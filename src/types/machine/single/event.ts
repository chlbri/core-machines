import { DocumentData } from '../../data';

export type SingleEvent<T extends DocumentData> =
  | { type: 'update'; data: T }
  | { type: 'set'; data: T }
  | { type: 'delete' }
  | { type: 'remove' }
  | { type: 'retrieve' }
  | { type: 'fetch'; id: string }
  | { type: 'refetch' };
