import { db, __db } from './db';
export function resetDB() {
  db.length = 0;
  db.push(...__db);
}
export function emptyDB() {
  db.length = 0;
}
