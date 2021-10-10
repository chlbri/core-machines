export type MultiEvent =
  | { type: 'FETCH' | 'PREVIOUS' | 'NEXT' | 'REFETCH' }
  | { type: 'GO_TO_TARGET_PAGE'; page: number }
  | { type: 'CHANGE_PAGE_SIZE'; pageSize: number }
  | { type: 'REMOVE'; id: string }
  | { type: 'DELETE'; id: string };
