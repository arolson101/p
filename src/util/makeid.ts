import { randomBytes } from 'crypto'
import * as getSlug from 'speakingurl'

export type makeid = '<makeid>'
export const makeid = (key: string, lang: string) => {
  return getSlug(key, { lang }) + '-' + randomBytes(4).toString('hex') as makeid
}
