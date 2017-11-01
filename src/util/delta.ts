import { DiffPatcher, Delta as JSONDelta } from 'jsondiffpatch/src/diffpatcher'
import * as R from 'ramda'
import * as zlib from 'zlib'

type Doc<T> = PouchDB.Core.IdMeta & { [key: string]: any } & T
type CompressedJson = '<compressed json>'

interface Delta {
  t: number
  d: CompressedJson
}

interface NakedDoc {
  __tagNakedDoc: string // dummy tag to enforce type
  [key: string]: any
}

type VersionedDoc<T> = Doc<T> & {
  $deltas: Delta[]
}

const diffPatcher = new DiffPatcher()

const nakedDoc = (doc: any): NakedDoc => {
  const ret = {} as NakedDoc
  for (let key in doc) {
    if (!key.startsWith('$') && (!key.startsWith('_') || key === '_attachments')) {
      ret[key] = doc[key]
    }
  }
  return ret
}

const CJSONToBuffer = (str: CompressedJson) => new Buffer(str, 'base64')
const bufferToCJSON = (buffer: Buffer) => buffer.toString('base64') as CompressedJson

const dehydrate = R.pipe(
  JSON.stringify as (obj: JSONDelta) => string,
  zlib.deflateSync,
  bufferToCJSON
)

const hydrate = R.pipe(
  CJSONToBuffer,
  zlib.inflateSync,
  R.toString,
  JSON.parse as (str: string) => JSONDelta,
)

const rebuildObject = R.reduce(
  (next: NakedDoc, change: Delta) => {
    const delta = hydrate(change.d)
    return diffPatcher.patch(next, delta)
  },
  {} as NakedDoc
)

const now = () => new Date().valueOf()

export const incomingDelta = <T>(idoc: Doc<T>, timeFcn = now): VersionedDoc<T> => {
  const t = timeFcn()
  const doc = idoc as VersionedDoc<T>

  if (!doc.$deltas) {
    doc.$deltas = []
  }

  let next = nakedDoc(doc)
  let prev = rebuildObject(doc.$deltas)

  const delta = diffPatcher.diff(prev, next)
  if (delta) {
    const d = dehydrate(delta) as any
    doc.$deltas.push({ t, d })
    // console.log(`doc ${doc._id}: updated: `, doc)
  }

  return doc
}

const mergeDeltas = (a: Delta[], b: Delta[]): Delta[] =>
  R.pipe(
    R.flatten,
    R.uniq,
    R.sort((d1: Delta, d2: Delta) => d1.t - d2.t)
  )([a, b])

export const resolveConflict = <T>(a: VersionedDoc<any>, b: VersionedDoc<any>): VersionedDoc<T> => {
  const $deltas = mergeDeltas(a.$deltas || [], b.$deltas || [])
  const merged = rebuildObject($deltas)
  const ret = {
    ...a,
    ...b,
    ...merged,
    $deltas
  }

  // console.log('resolved conflict: ', a, b, ret)
  return ret
}
