import { DataMock } from './types';

/***
 * This value doesn't change
 */
export const __db: DataMock[] = [
  {
    login: 'login1',
    firstName: 'levi',
    id: 'id1',
  },
  {
    login: 'login2',
    firstName: 'charles',
    id: 'id2',
  },
  {
    login: 'login3',
    firstName: 'alfred',
    id: 'id3',
  },
  {
    login: 'login4',
    firstName: 'bernard',
    id: 'id4',
  },
  {
    login: 'login5',
    firstName: 'jean',
    id: 'id5',
  },
];

export const db = [...__db];
