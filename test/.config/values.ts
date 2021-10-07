import produce from 'immer';
import { CRUD } from '../../src/types/crud';
import { db, __db } from './db';
import { DataMock } from './types';

export const __dataMock = __db[0];

export const mockDAO: CRUD<DataMock> = {
  updateOneById: async (id, data) => {
    db.length = 0;
    const index = __db.findIndex((value) => value.id === id);

    db.push(
      ...produce(__db, (draft) => {
        draft[index] = { ...draft[index], ...data };
      })
    );
    return id;
  },
  setOneById: async (id, data) => {
    db.length = 0;
    const index = __db.findIndex((value) => value.id === id);
    db.push(
      ...produce(__db, (draft) => {
        draft[index] = data;
      })
    );
    return id;
  },
  deleteOneById: async (id) => {
    db.length = 0;
    const index = __db.findIndex((value) => value.id === id);
    db.push(
      ...produce(__db, (draft) => {
        draft[index].deleted = new Date();
      })
    );

    return id;
  },
  removeOneById: async (id) => {
    db.length = 0;
    return id;
  },
  retrieveOneById: async (id) => {
    db.length = 0;
    const index = __db.findIndex((value) => value.id === id);
    db.push(
      ...produce(__db, (draft) => {
        draft[index].deleted = undefined;
      })
    );
    db.length;
    return id;
  },
  readOneById: async (id) => {
    const out = __db.find((data) => data.id === id);
    if (!out) throw new Error('Not Found')
    return { ...out, id };
  },
  createMany: function (/* data, errorHandler */) {
    throw new Error('Function not implemented.');
  },
  createOne: function (/* data, errorHandler */) {
    throw new Error('Function not implemented.');
  },
  upsertOne: function (/* id: string, data , errorHandler */) {
    throw new Error('Function not implemented.');
  },
  readAll: function (/* options */) {
    throw new Error('Function not implemented.');
  },
  readMany: function (/* filters , options */) {
    throw new Error('Function not implemented.');
  },
  readManyByIds: function (/* ids, options */) {
    throw new Error('Function not implemented.');
  },
  readOne: function (/* filters , options */) {
    throw new Error('Function not implemented.');
  },
  updateAll: function (/* data, options */) {
    throw new Error('Function not implemented.');
  },
  updateMany: function (/* filters , data, options */) {
    throw new Error('Function not implemented.');
  },
  updateManyByIds: function (/* ids, data , options */) {
    throw new Error('Function not implemented.');
  },
  updateOne: function (/* filters, data, options */) {
    throw new Error('Function not implemented.');
  },
  setAll: function (/* data, options */) {
    throw new Error('Function not implemented.');
  },
  setMany: function (/* filters, data, options */) {
    throw new Error('Function not implemented.');
  },
  setManyByIds: function (/* ids, data, options */) {
    throw new Error('Function not implemented.');
  },
  setOne: function (/* filters, data, options */): Promise<string> {
    throw new Error('Function not implemented.');
  },
  deleteAll: function (/* options */): Promise<number> {
    throw new Error('Function not implemented.');
  },
  deleteMany: function (/* filters, options */) {
    throw new Error('Function not implemented.');
  },
  deleteManyByIds: function (/* ids, options */) {
    throw new Error('Function not implemented.');
  },
  deleteOne: function (/* filters, options */) {
    throw new Error('Function not implemented.');
  },
  removeAll: function (/* options */): Promise<number> {
    throw new Error('Function not implemented.');
  },
  removeMany: function (/* filters, options */) {
    throw new Error('Function not implemented.');
  },
  removeManyByIds: function (/* ids, options */) {
    throw new Error('Function not implemented.');
  },
  removeOne: function (/* filters, options */) {
    throw new Error('Function not implemented.');
  },
  retrieveAll: function (/* options */): Promise<number> {
    throw new Error('Function not implemented.');
  },
  retrieveMany: function (/* filters, options */) {
    throw new Error('Function not implemented.');
  },
  retrieveManyByIds: function (/* ids, options */) {
    throw new Error('Function not implemented.');
  },
  retrieveOne: function (/* filters, options */) {
    throw new Error('Function not implemented.');
  },
  countAll: function () {
    throw new Error('Function not implemented.');
  },
  count: function (/* filters, options */) {
    throw new Error('Function not implemented.');
  },
};
