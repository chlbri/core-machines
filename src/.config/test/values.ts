import { CRUD } from 'core-data';
import dt from './db.json';
import { DataMock } from './types';

export const db: DataMock[] = dt.map(data => ({
  ...data,
  _createdAt: new Date(),
  _updatedAt: new Date(),
  _deletedAt: false,
}));

export const __dataMock = db[0];

const error = () => {
  throw new Error();
};

export const mockDAO: CRUD<DataMock> = {
  updateOneById: error,
  setOneById: error,
  deleteOneById: error,
  removeOneById: error,
  retrieveOneById: error,
  readOneById: error,
  createMany: error,
  createOne: error,
  upsertOne: error,
  readAll: error,
  readMany: error,
  readManyByIds: error,
  readOne: error,
  updateAll: error,
  updateMany: error,
  updateManyByIds: error,
  updateOne: error,
  setAll: error,
  setMany: error,
  setManyByIds: error,
  setOne: error,
  deleteAll: error,
  deleteMany: error,
  deleteManyByIds: error,
  deleteOne: error,
  removeAll: error,
  removeMany: error,
  removeManyByIds: error,
  removeOne: error,
  retrieveAll: error,
  retrieveMany: error,
  retrieveManyByIds: error,
  retrieveOne: error,
  countAll: error,
  count: error,
};
