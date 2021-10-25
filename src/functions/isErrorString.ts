import { STATE_ERROR_STRINGS } from './strings';
import { ErrorStateString } from '../types/error';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function isErrorStateString(arg: any): arg is ErrorStateString {
  return [...STATE_ERROR_STRINGS].includes(arg);
}
