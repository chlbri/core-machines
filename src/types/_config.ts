import { DeepPartial } from 'core';
import { WithoutId } from 'core-data';
import ReturnData from 'core-promises';

export type NOmit<T, K extends keyof T> = Omit<T, K>;

export type GetRD<T> = T extends ReturnData<infer TT, any> ? TT : never;

export type DPW<T> = WithoutId<DeepPartial<T>>;
