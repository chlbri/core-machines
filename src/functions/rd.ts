import { DPW } from '../types/_config';

export function reduceMutations<T>(...mutations: DPW<T>[]): DPW<T> {
  return mutations.reduce((acc, curr) => {
    return { ...acc, ...curr };
  });
}
