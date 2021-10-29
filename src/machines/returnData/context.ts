import ReturnData, { _ReturnData } from 'core-promises';

export type RDContext<T> = {
  // isClientError?: true;
  // isInformation?: true;
  // isPermission?: true;O
  // isRedirect?: true;
  // isServerError?: true;
  // isSuccess?: true;
  // isTimeoutError?: true;
  data?: ReturnData<T, any>;
  iterator: number;
};
