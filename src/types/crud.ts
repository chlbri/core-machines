import { NOmit } from './.config';
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

export type Data<T> =
  | (T & {
      id: string;
    })
  | {
      id: string;
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

// #region Read

export type ReadAll<T> = (options?: QueryOptions) => Promise<T[]>;

export type ReadMany<T> = (
  filters: QueryParams<T>,
  options?: QueryOptions
) => Promise<T[]>;

export type ReadManyByIds<T> = (
  ids: string[],
  options?: QueryOptions
) => Promise<T[]>;

export type ReadOne<T> = (
  filters: QueryParams<T>,
  options?: NOmit<QueryOptions, 'limit'>
) => Promise<Data<T>>;

export type ReadOneById<T> = (
  id: string,
  options?: NOmit<QueryOptions, 'limit'>
) => Promise<Data<T>>;

// #endregion

// #region Count

export type CountAll = () => Promise<number>;

export type Count<T> = (
  filters: QueryParams<T>,
  options?: NOmit<QueryOptions, 'limit'>
) => Promise<number>;

// #endregion

// #region Update

export type UpdateAll<T> = (data: T, options?: QueryOptions) => Promise<number>;

export type UpdateMany<T> = (
  filters: QueryParams<T>,
  data: T,
  options?: QueryOptions
) => Promise<number>;

export type UpdateManyByIds<T> = (
  ids: string[],
  data: T,
  options?: QueryOptions
) => Promise<number>;

export type UpdateOne<T> = (
  filters: QueryParams<T>,
  data: T,
  options?: NOmit<QueryOptions, 'limit'>
) => Promise<string>;

export type UpdateOneById<T> = (
  id: string,
  data: T,
  options?: NOmit<QueryOptions, 'limit'>
) => Promise<string>;

// #endregion

// #region Set

export type SetAll<T> = (data: T, options?: QueryOptions) => Promise<number>;

export type SetMany<T> = (
  filters: QueryParams<T>,
  data: T,
  options?: QueryOptions
) => Promise<number>;

export type SetManyByIds<T> = (
  ids: string[],
  data: T,
  options?: QueryOptions
) => Promise<number>;

export type SetOne<T> = (
  filters: QueryParams<T>,
  data: T,
  options?: NOmit<QueryOptions, 'limit'>
) => Promise<string>;

export type SetOneById<T> = (
  id: string,
  data: T,
  options?: NOmit<QueryOptions, 'limit'>
) => Promise<string>;

// #endregion

// #region Delete

export type DeleteAll = (options?: QueryOptions) => Promise<number>;

export type DeleteMany<T> = (
  filters: QueryParams<T>,
  options?: QueryOptions
) => Promise<number>;

export type DeleteManyByIds = (
  ids: string[],
  options?: QueryOptions
) => Promise<number>;

export type DeleteOne<T> = (
  filters: QueryParams<T>,
  options?: NOmit<QueryOptions, 'limit'>
) => Promise<string>;

export type DeleteOneById = (
  id: string,
  options?: NOmit<QueryOptions, 'limit'>
) => Promise<string>;

// #endregion

// #region Remove

export type RemoveAll = (options?: QueryOptions) => Promise<number>;

export type RemoveMany<T> = (
  filters: QueryParams<T>,
  options?: QueryOptions
) => Promise<number>;

export type RemoveManyByIds = (
  ids: string[],
  options?: QueryOptions
) => Promise<number>;

export type RemoveOne<T> = (
  filters: QueryParams<T>,
  options?: NOmit<QueryOptions, 'limit'>
) => Promise<string>;

export type RemoveOneById = (
  id: string,
  options?: NOmit<QueryOptions, 'limit'>
) => Promise<string>;

// #endregion

// #region Retrieve

export type RetrieveAll = (options?: QueryOptions) => Promise<number>;

export type RetrieveMany<T> = (
  filters: QueryParams<T>,
  options?: QueryOptions
) => Promise<number>;

export type RetrieveManyByIds = (
  ids: string[],
  options?: QueryOptions
) => Promise<number>;

export type RetrieveOne<T> = (
  filters: QueryParams<T>,
  options?: NOmit<QueryOptions, 'limit'>
) => Promise<string>;

export type RetrieveOneById = (
  id: string,
  options?: NOmit<QueryOptions, 'limit'>
) => Promise<string>;

// #endregion

export interface CRUD<T> {
  createMany: CreateMany<T>;
  createOne: CreateOne<T>;
  upsertOne: UpsertOne<T>;
  readAll: ReadAll<T>;
  readMany: ReadMany<T>;
  readManyByIds: ReadManyByIds<T>;
  readOne: ReadOne<T>;
  readOneById: ReadOneById<T>;
  countAll: CountAll;
  count: Count<T>;
  updateAll: UpdateAll<T>;
  updateMany: UpdateMany<T>;
  updateManyByIds: UpdateManyByIds<T>;
  updateOne: UpdateOne<T>;
  updateOneById: UpdateOneById<T>;
  setAll: SetAll<T>;
  setMany: SetMany<T>;
  setManyByIds: SetManyByIds<T>;
  setOne: SetOne<T>;
  setOneById: SetOneById<T>;
  deleteAll: DeleteAll;
  deleteMany: DeleteMany<T>;
  deleteManyByIds: DeleteManyByIds;
  deleteOne: DeleteOne<T>;
  deleteOneById: DeleteOneById;
  removeAll: RemoveAll;
  removeMany: RemoveMany<T>;
  removeManyByIds: RemoveManyByIds;
  removeOne: RemoveOne<T>;
  removeOneById: RemoveOneById;
  retrieveAll: RetrieveAll;
  retrieveMany: RetrieveMany<T>;
  retrieveManyByIds: RetrieveManyByIds;
  retrieveOne: RetrieveOne<T>;
  retrieveOneById: RetrieveOneById;
}
