import * as jsondiffpatch from 'jsondiffpatch'
import * as PouchDB from 'pouchdb-browser'
import * as R from 'ramda'
import * as zlib from 'zlib'

type Doc = PouchDB.Core.IdMeta

interface Delta {
  t: number
  d: string // compressed json
}

type VersionedDoc = Doc & {
  $deltas: Delta[]
}

const nakedDoc = (doc: any): Object => {
  let ret: any = {}
  for (let key in doc) {
    if (!key.startsWith('$') && (!key.startsWith('_') || key === '_attachments')) {
      ret[key] = doc[key]
    }
  }
  return ret
}

const rebuildObject = R.reduce(
  (next: Object, change: Delta) => {
    const raw = zlib.inflateSync(new Buffer(change.d, 'base64')).toString()
    const delta = JSON.parse(raw) as jsondiffpatch.Delta<Doc, Doc>
    return jsondiffpatch.patch(next, delta)
  },
  {}
)

export const incomingDelta = (doc: VersionedDoc): VersionedDoc => {
  const t = new Date().valueOf()

  if (!doc.$deltas) {
    doc.$deltas = []
  }

  let next = nakedDoc(doc)
  let prev = rebuildObject(doc.$deltas)

  const delta = jsondiffpatch.diff(prev, next)
  if (delta) {
    const d = zlib.deflateSync(JSON.stringify(delta)).toString('base64')
    doc.$deltas.push({t, d})
    // console.log(`doc ${doc._id}: updated: `, doc)
  }

  return doc
}

const sortDeltas = R.sort((a: Delta, b: Delta) => a.t - b.t)

export const resolveConflict = (a: VersionedDoc, b: VersionedDoc): VersionedDoc => {
  const $deltas = sortDeltas(a.$deltas || []).concat(b.$deltas || [])
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
