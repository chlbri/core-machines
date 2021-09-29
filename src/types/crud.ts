export type WhereFilterOp =
  | '<'
  | '<='
  | '=='
  | '!='
  | '>='
  | '>'
  | 'array-contains'
  | 'in'
  | 'not-in'
  | 'array-contains-any';

export type QueryFieldParams<T = any> = {
  oprString: WhereFilterOp;
  value: T;
};

export type QueryFieldArrayParams<T = any> = {
  oprString: WhereFilterOp;
  value: T;
}[];

export type QueryParams<T = any> = {
  [key in keyof T]?: QueryFieldParams<T[key]> | QueryFieldArrayParams<T[key]>;
};

export type OmitQuery<T> = Omit<T, 'createdAt' | 'updatedAt' | 'deletedAt'>;
export type WithoutId<T> = Omit<T, 'id'>;

export type ErrorHandler = (error?: any) => never;

export type QueryOptions = {
  limit?: number;
  errorHandler?: ErrorHandler;
};

// #region Create
export type CreateMany<T> = (
  data: T[],
  errorHandler?: ErrorHandler
) => Promise<{
  all: number;
  done: number;
  ids: string[];
}>;

export type CreateOne<T> = (
  data: T,
  errorHandler?: ErrorHandler
) => Promise<string>;

export type UpsertOne<T> = (
  id: string,
  data: T,
  errorHandler?: ErrorHandler
) => Promise<string>;
// #endregion
