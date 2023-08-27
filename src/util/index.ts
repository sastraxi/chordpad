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

export const sum = <T extends number>(array: Array<T>) =>
  array.reduce((accum, current) => accum + current, 0)

/**
 * Returns an array whose value is a running sum of all
 * the numbers before the current index.
 */
export const accum = (numbers: Array<number>) => numbers.reduce<Array<number>>((output, _num, index) => {
  if (index === 0) {
    output.push(0)
  } else {
    output.push(output[index - 1] + numbers[index - 1])
  }
  return output
}, [])

export const constrain = (val: number, min: number, max: number) =>
  Math.max(min, Math.min(max, val))

export const debounce = <F extends (...args: Parameters<F>) => ReturnType<F>>(
  func: F,
  waitFor: number,
) => {
  let timeout: number | undefined

  const debounced = (...args: Parameters<F>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), waitFor)
  }

  return debounced
}
