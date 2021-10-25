export * from './types';
export * from './values';
import __db from './db.json';
import { DataMock } from './types';

const db: DataMock[] = __db;
export { db };
