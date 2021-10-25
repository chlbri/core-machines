import { DeepPartial } from 'core';
import { Entity, WithoutId } from 'core-data';

export type SingleEvent<T extends Entity> =
  | { type: 'update'; data: WithoutId<DeepPartial<T>> }
  | { type: 'delete' }
  | { type: 'remove' }
  | { type: 'retrieve' }
  | { type: 'save' }
  | { type: 'fetch'; id: string }
  | { type: 'refetch' };

