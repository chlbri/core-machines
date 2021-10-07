import { DataConverter, DocumentData } from '../../data';
import { AsyncStateErrorString, ErrorStateString, InternalStateErrorString } from '../../error';

export type MultiContext<T extends DocumentData> = {
  iterator: number;
  last?: string;
  previous?: T[];
  current?: T[];
  selectedValues?: T[];
  currentPage: number;
  col: string;
  converter?: DataConverter<T> | null;
  pageSize: number;
  canGotoPrevPage?: true;
  canGotoNextPage?: true;
  totalFromDataBase?: number;
  totalPages?: number;
  total?: number;
  totalExceedTotalFromDatabase?: true;
  canNextFetch?: true;
  maxFromDatabase?: number;
  nextFetching?: true;
  needToFecth?: number;
  error?: ErrorStateString;
  ids?: string[];
};

export type MultiContextPending = {
  selectedValues: undefined;
  current: undefined;
  error: undefined;
  totalFromDataBase: number;
  totalPages: number;
  total: number;
  totalExceedTotalFromDatabase: true;
};

export type MultiContextSuccess<T extends DocumentData> = {
  selectedValues: T[];
  current: T[];
  error: undefined;
  totalFromDataBase: number;
  totalPages: number;
  total: number;
  totalExceedTotalFromDatabase: true;
};

export type MultiContextInternalError<T extends DocumentData> = {
  selectedValues: T[];
  current: T[];
  totalFromDataBase: number;
  totalPages: number;
  total: number;
  totalExceedTotalFromDatabase: true;
  error: InternalStateErrorString;
};

export type MultiContextAsyncError = {
  selectedValues: undefined;
  current: undefined;
  totalFromDataBase: undefined;
  totalPages: number;
  total: number;
  totalExceedTotalFromDatabase: undefined;
  error: AsyncStateErrorString;
};
