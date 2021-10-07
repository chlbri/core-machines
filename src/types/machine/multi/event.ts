import { NOmit } from '../../.config';
import { QueryOptions, QueryParams } from '../../crud';
import { DocumentData } from '../../data';

export type MultiEvent<T extends DocumentData> =
  | { type: 'createMany'; data: T[] }
  | { type: 'createOne'; data: T }
  | { type: 'upsertOne'; id: string; data: T }
  | { type: 'readAll'; options?: QueryOptions }
  | { type: 'readMany'; filters: QueryParams<T>; options?: QueryOptions }
  | { type: 'readManyByIds'; ids: string[]; options?: QueryOptions }
  | {
      type: 'readOne';
      filters: QueryParams<T>;
      options?: NOmit<QueryOptions, 'limit'>;
    }
  | { type: 'readOneById'; id: string; options?: NOmit<QueryOptions, 'limit'> }
  | { type: 'updateAll'; data: T; options?: QueryOptions }
  | {
      type: 'updateMany';
      filters: QueryParams<T>;
      data: T;
      options?: QueryOptions;
    }
  | { type: 'updateManyByIds'; ids: string[]; data: T; options?: QueryOptions }
  | {
      type: 'updateOne';
      filters: QueryParams<T>;
      data: T;
      options?: NOmit<QueryOptions, 'limit'>;
    }
  | {
      type: 'updateOneById';
      id: string;
      data: T;
      options?: NOmit<QueryOptions, 'limit'>;
    }
  | { type: 'setAll'; data: T; options?: QueryOptions }
  | {
      type: 'setMany';
      filters: QueryParams<T>;
      data: T;
      options?: QueryOptions;
    }
  | { type: 'setManyByIds'; ids: string[]; data: T; options?: QueryOptions }
  | {
      type: 'setOne';
      filters: QueryParams<T>;
      data: T;
      options?: NOmit<QueryOptions, 'limit'>;
    }
  | {
      type: 'setOneById';
      id: string;
      data: T;
      options?: NOmit<QueryOptions, 'limit'>;
    }
  | { type: 'deleteAll'; options?: QueryOptions }
  | { type: 'deleteMany'; filters: QueryParams<T>; options?: QueryOptions }
  | { type: 'deleteManyByIds'; ids: string[]; options?: QueryOptions }
  | {
      type: 'deleteOne';
      filters: QueryParams<T>;
      options?: NOmit<QueryOptions, 'limit'>;
    }
  | {
      type: 'deleteOneById';
      id: string;
      options?: NOmit<QueryOptions, 'limit'>;
    }
  | { type: 'removeAll'; options?: QueryOptions }
  | { type: 'removeMany'; options?: QueryOptions }
  | { type: 'removeManyByIds'; ids: string[]; options?: QueryOptions }
  | {
      type: 'removeOne';
      filters: QueryParams<T>;
      options?: NOmit<QueryOptions, 'limit'>;
    }
  | {
      type: 'removeOneById';
      id: string;
      options?: NOmit<QueryOptions, 'limit'>;
    }
  | { type: 'retrieveAll'; options?: QueryOptions }
  | { type: 'retrieveMany'; options?: QueryOptions }
  | { type: 'retrieveManyByIds'; ids: string[]; options?: QueryOptions }
  | {
      type: 'retrieveOne';
      filters: QueryParams<T>;
      options?: NOmit<QueryOptions, 'limit'>;
    }
  | {
      type: 'retrieveOneById';
      id: string;
      options?: NOmit<QueryOptions, 'limit'>;
    };
