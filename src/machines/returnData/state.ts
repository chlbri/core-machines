import {
  ClientError,
  Information,
  Permission,
  Redirect,
  Server,
  Success,
  Timeout,
} from 'core-promises';
import { RDContext } from './context';

type ClientErrorState = { data: ClientError };
type InformationState<T> = { data: Information<T> };
type PermissionState<T> = { data: Permission<T> };
type RedirectState<T> = { data: Redirect<T> };
type ServerState = { data: Server };
type SuccessState<T> = { data: Success<T> };
type TimeoutState = { data: Timeout };
type Pending = { data?: undefined };

export type RDState<T> =
  | { value: 'Idle'; context: RDContext<T> }
  | { value: 'Pending'; context: RDContext<T> & Pending }
  | {
      value: 'ClientError';
      context: RDContext<T> & ClientErrorState;
    }
  | {
      value: 'Information';
      context: RDContext<T> & InformationState<T>;
    }
  | {
      value: 'PermissionError';
      context: RDContext<T> & PermissionState<T>;
    }
  | {
      value: 'Redirect';
      context: RDContext<T> & RedirectState<T>;
    }
  | {
      value: 'ServerError';
      context: RDContext<T> & ServerState;
    }
  | {
      value: 'Success';
      context: RDContext<T> & SuccessState<T>;
    }
  | {
      value: 'TimeoutError';
      context: RDContext<T> & TimeoutState;
    };
