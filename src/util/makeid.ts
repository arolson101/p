import * as shortid from 'shortid'

export type makeid = '<makeid>'
export const makeid = shortid.generate as () => makeid
