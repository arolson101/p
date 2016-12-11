// import * as shortid from 'shortid'
import * as getSlug from 'speakingurl'
import { randomBytes } from 'crypto'

export type makeid = '<makeid>'
// export const makeid = shortid.generate as () => makeid
export const makeid = (key: string, lang: string) => {
  return getSlug(key, { lang }) + '-' + randomBytes(4).toString('hex') as makeid
}
