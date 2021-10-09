import {
  SingleContext,
  SingleContextSuccess,
  SingleContextPending,
  SingleAsyncError,
  SingleInternalError,
} from './context';
import { DocumentData } from '../../data';

export type SingleTypeState<T extends DocumentData> =
  | { value: 'idle'; context: SingleContext<T> & { iterator: 0 } }
  | {
      value:
        | 'update'
        | 'set'
        | 'delete'
        | 'remove'
        | 'retrieve'
        | 'fetch'
        | 'refetch';
      context: SingleContext<T> & SingleContextPending;
    }
  | { value: 'success'; context: SingleContext<T> & SingleContextSuccess<T> }
  | {
      value: 'internalError';
      context: SingleContext<T> & SingleInternalError<T>;
    }
  | { value: 'error'; context: SingleContext<T> & SingleAsyncError };
