import { DeepPartial } from 'core';
import { Entity, WithoutId } from 'core-data';
import {
  AsyncStateErrorString,
  ErrorStateString,
  InternalStateErrorString,
} from '../../error';
import { DPW } from '../../_config';


export type SingleContext<T extends Entity> = {
  iterator: number;
  _id?: string;
  current?: DPW<T>;
  previous?: DPW<T>;
  mutations?: WithoutId<DeepPartial<T>>[];
  error?: ErrorStateString;
  needToFecth: number;
};

export type SingleContextSuccess<T extends Entity> = {
  current: WithoutId<T>;
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
  current: WithoutId<T>;
  error: InternalStateErrorString;
};
