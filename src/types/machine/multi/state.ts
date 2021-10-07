import {
  MultiContext,
  MultiContextSuccess,
  MultiContextInternalError,
  MultiContextAsyncError,
  MultiContextPending,
} from './context';
import { DocumentData } from '../../data';

export type MultiTypeState<T extends DocumentData> =
  | { value: 'idle'; context: MultiContext<T> & { iterator: 0 } }
  | {
      value:
        | 'update'
        | 'set'
        | 'delete'
        | 'remove'
        | 'retrieve'
        | 'fetch'
        | 'refetch';
      context: MultiContext<T> & MultiContextPending;
    }
  | { value: 'success'; context: MultiContext<T> & MultiContextSuccess<T> }
  | {
      value: 'internalError';
      context: MultiContext<T> & MultiContextInternalError<T>;
    }
  | { value: 'error'; context: MultiContext<T> & MultiContextAsyncError };
