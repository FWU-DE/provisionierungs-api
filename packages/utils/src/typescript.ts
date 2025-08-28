// Helper that resolves all keys when hovering over a type
export type DeepIdentity<T> = { [P in keyof T]: DeepIdentity<T[P]> };
export type Identity<T> = { [P in keyof T]: T[P] };

// Helper that makes all keys optional, except keys in K
export type PartialExcept<T, K extends keyof T> = Partial<Omit<T, K>> & Pick<T, K>;

export type PropertiesOnly<T> = Omit<
  T,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  { [K in keyof T]: T[K] extends Function ? K : never }[keyof T]
>;
