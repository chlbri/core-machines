export type Error =
  | 'update'
  | 'set'
  | 'delete'
  | 'remove'
  | 'retrieve'
  | 'fetch';

export type TC<T> = {
  iterator: number;
  current?: T;
  previous?: T;
  error?: Error;
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
  error: Error;
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
