// placeholder until typescript supports object spread operator

export const spread = <T>(...args: T[]): T => {
  return Object.assign({}, ...args)
}
