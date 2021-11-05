import { Entity } from 'core-data';
import {
  MultiContext,
  MultiContextAsyncError,
  MultiContextInternalError,
  MultiContextPending,
  MultiContextSuccess,
} from './context';

export type MultiTypeState<T extends Entity> =
  | {
      value: 'idle';
      context: MultiContext<T> & { iterator: 0; lastId: undefined };
    }
  | {
      value: 'fetching' | 'refetching' | 'deleting' | 'removing';
      context: MultiContext<T> & MultiContextPending;
    }
  | { value: 'success'; context: MultiContext<T> & MultiContextSuccess<T> }
  | {
      value: 'internalError';
      context: MultiContext<T> & MultiContextInternalError<T>;
    }
  | { value: 'error'; context: MultiContext<T> & MultiContextAsyncError };
