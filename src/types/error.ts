import {
  ASYNC_STATE_ERROR_STRINGS,
  STATE_ERROR_STRINGS,
} from '../constants/strings';

export type AsyncStateErrorString = typeof ASYNC_STATE_ERROR_STRINGS[number];

export type ErrorStateString = typeof STATE_ERROR_STRINGS[number];

export default class StateError extends Error {
  message: ErrorStateString;
  constructor(msg: ErrorStateString) {
    super(msg);
    this.message = msg;
  }
}
