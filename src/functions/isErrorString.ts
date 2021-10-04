import { STATE_ERROR_STRINGS } from '../constants/strings';
import { ErrorStateString } from '../types/error';

export default function isErrorStateString(arg: any): arg is ErrorStateString {
  return [...STATE_ERROR_STRINGS].includes(arg);
}
