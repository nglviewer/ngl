export type TypedArray = (
  Int8Array | Int16Array | Int32Array |
  Uint8ClampedArray | Uint8Array | Uint16Array | Uint32Array |
  Float32Array | Float64Array
)

export type NumberArray = number[] | TypedArray

export type Partial<T> = { [p in keyof T]?: T[p] }