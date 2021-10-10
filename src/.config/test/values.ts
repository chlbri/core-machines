import produce from 'immer';
import { mock, mockDeep } from 'jest-mock-extended';
import { CRUD } from '../../types';
import { db, __db } from './db';
import { DataMock } from './types';

export const __dataMock = __db[0];

export const mockDAO: CRUD<DataMock> = {
  updateOneById: () => {
    throw new Error();
  },
  setOneById: async (id, data) => {
    throw new Error('Function not implemented.');
  },
  deleteOneById: async (id) => {
    throw new Error('Function not implemented.');
  },
  removeOneById: async (id) => {
    throw new Error('Function not implemented.');
  },
  retrieveOneById: async (id) => {
    throw new Error('Function not implemented.');
  },
  readOneById: async (id) => {
    throw new Error('Function not implemented.');
  },
  createMany: function (data, errorHandler) {
    throw new Error('Function not implemented.');
  },
  createOne: function (data, errorHandler) {
    throw new Error('Function not implemented.');
  },
  upsertOne: function (id: string, data, errorHandler) {
    throw new Error('Function not implemented.');
  },
  readAll: function (options) {
    throw new Error('Function not implemented.');
  },
  readMany: function (filters, options) {
    throw new Error('Function not implemented.');
  },
  readManyByIds: function (ids, options) {
    throw new Error('Function not implemented.');
  },
  readOne: function (filters, options) {
    throw new Error('Function not implemented.');
  },
  updateAll: function (data, options) {
    throw new Error('Function not implemented.');
  },
  updateMany: function (filters, data, options) {
    throw new Error('Function not implemented.');
  },
  updateManyByIds: function (ids, data, options) {
    throw new Error('Function not implemented.');
  },
  updateOne: function (filters, data, options) {
    throw new Error('Function not implemented.');
  },
  setAll: function (data, options) {
    throw new Error('Function not implemented.');
  },
  setMany: function (filters, data, options) {
    throw new Error('Function not implemented.');
  },
  setManyByIds: function (ids, data, options) {
    throw new Error('Function not implemented.');
  },
  setOne: function (filters, data, options): Promise<string> {
    throw new Error('Function not implemented.');
  },
  deleteAll: function (options): Promise<number> {
    throw new Error('Function not implemented.');
  },
  deleteMany: function (filters, options) {
    throw new Error('Function not implemented.');
  },
  deleteManyByIds: function (ids, options) {
    throw new Error('Function not implemented.');
  },
  deleteOne: function (filters, options) {
    throw new Error('Function not implemented.');
  },
  removeAll: function (options): Promise<number> {
    throw new Error('Function not implemented.');
  },
  removeMany: function (filters, options) {
    throw new Error('Function not implemented.');
  },
  removeManyByIds: function (ids, options) {
    throw new Error('Function not implemented.');
  },
  removeOne: function (filters, options) {
    throw new Error('Function not implemented.');
  },
  retrieveAll: function (options): Promise<number> {
    throw new Error('Function not implemented.');
  },
  retrieveMany: function (filters, options) {
    throw new Error('Function not implemented.');
  },
  retrieveManyByIds: function (ids, options) {
    throw new Error('Function not implemented.');
  },
  retrieveOne: function (filters, options) {
    throw new Error('Function not implemented.');
  },
  countAll: function () {
    throw new Error('Function not implemented.');
  },
  count: function (filters, options) {
    throw new Error('Function not implemented.');
  },
};
