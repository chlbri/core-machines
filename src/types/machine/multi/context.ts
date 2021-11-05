import { Entity } from 'core-data';
import { DataConverter, DocumentData } from '../../data';
import {
  AsyncStateErrorString,
  ErrorStateString,
  InternalStateErrorString,
} from '../../error';

export type MultiContext<T extends Entity> = {
  iterator: number;
  lastId?: string;
  data?: T[];
  selectedValues?: T[];
  currentPage: number;
  col: string;
  pageSize: number;
  canGoToPrevPage?: true;
  canGoToNextPage?: true;
  totalFromDatabase?: number;
  totalPages?: number;
  totalData?: number;
  totalExceedTotalFromDatabase?: true;
  canNextFetch?: true;
  maxFromDatabase: number;
  nextFetching?: true;
  needToFecth?: number;
  error?: ErrorStateString;
  // ids?: string[];
};

export type MultiContextPending = {
  selectedValues: undefined;
  current: undefined;
  error: undefined;
  totalFromDataBase: number;
  totalPages: number;
  totalData: number;
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
