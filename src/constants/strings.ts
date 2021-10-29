export const ASYNC_STATE_ERROR_STRINGS = [
  'update',
  'set',
  'delete',
  'remove',
  'retrieve',
  'fetch',
] as const;

export const INTERNAL_STATE_ERROR_STRINGS = [
  'incorrectState',
  'idNotDefined',
  'idNotMatch',
  'noData',
  'noMutations',
  'emptyMutations',
] as const;

export const STATE_ERROR_STRINGS = [
  ...ASYNC_STATE_ERROR_STRINGS,
  ...INTERNAL_STATE_ERROR_STRINGS,
] as const;
