import { ErrorStateString } from './error';

export type SingleTC<T> = {
  iterator: number;
  id?: string;
  current?: T;
  previous?: T;
  error?: ErrorStateString;
  needToFecth: number;
};
export type ListTC<T> = {
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

export type SingleTE<T> =
  | { type: 'update'; data: T }
  | { type: 'set'; data: T }
  | { type: 'delete' }
  | { type: 'remove' }
  | { type: 'retrieve' }
  | { type: 'fetch'; id: string }
  | { type: 'refetch' };

export type SingleTT<T> =
  | { value: 'idle'; context: SingleTC<T> & { iterator: 0 } }
  | {
      value:
        | 'update'
        | 'set'
        | 'delete'
        | 'remove'
        | 'retrieve'
        | 'fetch'
        | 'refetch';
      context: SingleTC<T> & TCpending;
    }
  | { value: 'success'; context: SingleTC<T> & TCSuccess<T> }
  | { value: 'error'; context: SingleTC<T> & TCError<T> };


  