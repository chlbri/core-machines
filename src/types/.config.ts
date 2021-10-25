import ReturnData, { Status } from 'core-promises';
import { TypeOf } from 'zod';

export type NOmit<T, K extends keyof T> = Omit<T, K>;

export type GetRD<T> = T extends ReturnData<infer TT, any> ? TT : never;
