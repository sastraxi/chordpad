export const range = (n: number) =>
  Array.from({ length: n }, (_value, key) => key)

export const replace = <T>(array: Array<T>, index: number, item: T): Array<T> => ([
  ...array.slice(0, index),
  item,
  ...array.slice(index + 1),
])

export const remove = <T>(array: Array<T>, index: number): Array<T> => ([
  ...array.slice(0, index),
  ...array.slice(index + 1),
])

export const update = <T>(array: Array<T>, index: number, updates: Partial<T>): Array<T> => ([
  ...array.slice(0, index),
  { ...array[index], ...updates },
  ...array.slice(index + 1),
])

export const msecToBpm = (durationMs: number) => (1000 / durationMs) * 60
export const bpmToMsec = (bpm: number) => (1000 / (bpm / 60))

export const sum = <T extends number>(array: Array<T>) =>
  array.reduce((accum, current) => accum + current, 0)

export const constrain = (val: number, min: number, max: number) =>
  Math.max(min, Math.min(max, val))
