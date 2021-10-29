import { StringKeys } from 'core';
import { Entity } from 'core-data';
import {
  AsyncStateErrorString,
  ErrorStateString,
  InternalStateErrorString,
} from '../../error';
import { DPW } from '../../_config';

export type SingleContext<T extends Entity> = {
  iterator: number;
  _id?: string;
  payload?: DPW<T>;
  _mutations: DPW<T>[];
  errors: ErrorStateString[];
  notPermitteds:StringKeys<T>[];
  message?: string;
  needToFecth: number;
};

export type SingleContextSuccess<T extends Entity> = {
  current: DPW<T>;
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

export type SingleInternalError<T extends Entity> = {
  current: DPW<T>;
  error: InternalStateErrorString;
};
