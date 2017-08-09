import { randomBytes } from 'crypto'

export type makeid = '<makeid>'
export const makeid = () => {
  return randomBytes(4).toString('hex') as makeid
}
