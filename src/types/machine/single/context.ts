import { DocumentData } from '../../data';
import { AsyncStateErrorString, ErrorStateString, InternalStateErrorString } from '../../error';

export type SingleContext<T extends DocumentData> = {
  iterator: number;
  id?: string;
  current?: T;
  previous?: T;
  error?: ErrorStateString;
  needToFecth: number;
};


export type SingleContextSuccess<T extends DocumentData> = {
  current: T;
  error: undefined;
};


export type SingleContextPending = {
  current: undefined;
  error: undefined;
};

export type SingleAsyncError = {
  current: undefined;
  error: AsyncStateErrorString;
};

export type SingleInternalError<T> = {
  current: T;
  error: InternalStateErrorString;
};
