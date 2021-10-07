import createListMachine from '../src/machines/listMachine';
import { mockDAO } from './.config/values';

export const machine = createListMachine(mockDAO, { col: 'news' });

export const modif = { login: 'modifiedLogin' };
