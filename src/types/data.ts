export type Primitive = string | number | boolean | undefined | null;
export interface DocumentData {
  /** A mapping between a field and its value. */
  [field: string]: any;
}

export type PartialWithFieldValue<T> = T extends Primitive
  ? T
  : T extends Record<any, any>
  ? {
      [K in keyof T]?: PartialWithFieldValue<T[K]>;
    }
  : Partial<T>;

export type DataConverter<T> = {
  toJSON: (obj: PartialWithFieldValue<T>) => DocumentData;
  fromJSON: (snap: any) => T;
};
