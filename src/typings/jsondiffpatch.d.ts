declare module 'jsondiffpatch' {
  export interface Delta<A, B> {
    __tagA: A
    __tagB: B
  }
  export function diff<A, B>(a: A, b: B): Delta<A, B>
  export function patch<A, B>(a: A, patch: Delta<A, B>): B
  export function reverse<A, B>(delta: Delta<A, B>): Delta<B, A>
  export function unpatch<A, B>(b: B, delta: Delta<A, B>): A
}
