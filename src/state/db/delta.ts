import * as jsondiffpatch from 'jsondiffpatch'
import * as PouchDB from 'pouchdb-browser'
import * as R from 'ramda'
import * as zlib from 'zlib'

type Doc = PouchDB.Core.IdMeta & { [key: string]: any }
type CompressedJson = '<compressed json>'

interface Delta {
  t: number
  d: CompressedJson
}

interface NakedDoc {
  __tagNakedDoc: string // dummy tag to enforce type
  [key: string]: any
}

type VersionedDoc = Doc & {
  $deltas: Delta[]
}

const nakedDoc = (doc: any): NakedDoc => {
  const ret = {} as NakedDoc
  for (let key in doc) {
    if (!key.startsWith('$') && (!key.startsWith('_') || key === '_attachments')) {
      ret[key] = doc[key]
    }
  }
  return ret
}

const stringToBuffer = (str: CompressedJson) => new Buffer(str, 'base64')
const bufferToString = (buffer: Buffer) => buffer.toString('base64') as CompressedJson

const dehydrate = R.pipe(
  JSON.stringify as (obj: jsondiffpatch.Delta<NakedDoc, NakedDoc>) => string,
  (x: string) => new Buffer(x), // not necessary- deflateSync accepts a string but the typing doesn't have it
  zlib.deflateSync,
  bufferToString
)

const hydrate = R.pipe(
  stringToBuffer,
  zlib.inflateSync,
  R.toString,
  JSON.parse as (str: string) => jsondiffpatch.Delta<NakedDoc, NakedDoc>
)

const rebuildObject = R.reduce(
  (next: NakedDoc, change: Delta) => {
    const delta = hydrate(change.d)
    return jsondiffpatch.patch(next, delta)
  },
  {} as NakedDoc
)

export const incomingDelta = (doc: Doc): VersionedDoc => {
  const t = new Date().valueOf()

  if (!doc.$deltas) {
    doc.$deltas = []
  }

  let next = nakedDoc(doc)
  let prev = rebuildObject(doc.$deltas)

  const delta = jsondiffpatch.diff(prev, next)
  if (delta) {
    const d = dehydrate(delta)
    doc.$deltas.push({t, d})
    // console.log(`doc ${doc._id}: updated: `, doc)
  }

  return doc as VersionedDoc
}

const mergeDeltas = (a: Delta[], b: Delta[]): Delta[] =>
  R.pipe(
    R.flatten,
    R.uniq,
    R.sort((d1: Delta, d2: Delta) => d1.t - d2.t)
  )([a, b])

export const resolveConflict = (a: VersionedDoc, b: VersionedDoc): VersionedDoc => {
  const $deltas = mergeDeltas(a.$deltas || [], b.$deltas || [])
  const merged = rebuildObject($deltas)
  const ret = {
    ...a,
    ...b,
    ...merged,
    $deltas
  }

  console.log('resolved conflict: ', a, b, ret)
  return ret
}

// const copy = (a: any) => { return ({...a, $deltas: [...a.$deltas]})}
// const a = incomingDelta({_id: 'a', a: 'a', b: 'b'})
// const a2 = incomingDelta({ ...copy(a), a: 'a2' })
// const a3 = incomingDelta({ ...copy(a2), a: 'a3' })

// const b2 = incomingDelta({ ...copy(a2), b: 'b2' })
// const b3 = incomingDelta({ ...copy(b2), a: 'b3' })
// resolveConflict(a3, b3)
