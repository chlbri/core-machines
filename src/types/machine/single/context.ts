import { DeepPartial } from 'core';
import {
  AsyncStateErrorString,
  ErrorStateString,
  InternalStateErrorString,
} from '../../error';

export type SingleContext<T> = {
  iterator: number;
  id?: string;
  current?: T;
  previous?: T;
  mutations?: DeepPartial<T>[];
  error?: ErrorStateString;
  needToFecth: number;
};

export type SingleContextSuccess<T> = {
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
