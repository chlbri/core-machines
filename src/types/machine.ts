import { ErrorStateString } from './error';

export type TC<T> = {
  iterator: number;
  id?: string;
  current?: T;
  previous?: T;
  error?: ErrorStateString;
  needToFecth: number;
};

export type TCpending = {
  current: undefined;
  error: undefined;
};

export type TCSuccess<T> = {
  current: T;
  error: undefined;
};

export type TCError<T> = {
  current: T;
  error: ErrorStateString;
};

export type TE<T> =
  | { type: 'update'; data: T }
  | { type: 'set'; data: T }
  | { type: 'delete' }
  | { type: 'remove' }
  | { type: 'retrieve' }
  | { type: 'fetch' };

export type TT<T> =
  | { value: 'idle'; context: TC<T> & { iterator: 0 } }
  | {
      value: 'update' | 'set' | 'delete' | 'remove' | 'retrieve' | 'fetch';
      context: TC<T> & TCpending;
    }
  | { value: 'success'; context: TC<T> & TCSuccess<T> }
  | { value: 'error'; context: TC<T> & TCError<T> };
