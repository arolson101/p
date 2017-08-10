import PouchDB from 'pouchdb'
import { DbInfo } from './db'

export interface ImportsState {
  online: OnlineInterface
  db: DbInterface
}

export interface OnlineInterface {
}

const defaultOnlineInterface = {
}

export interface DbInterface {
  createDbInfo: (name: string) => DbInfo
  openDb: (info: DbInfo, password: string) => PouchDB.Database<any>
  deleteDb: (info: DbInfo) => void
  listDbs: () => DbInfo[]
  genLocalId: (name: string) => string
}

const defaultDbInterface: DbInterface = {
  createDbInfo: (name: string): DbInfo => { throw new Error('import not initialized') },
  openDb: (info: DbInfo, password: string): PouchDB.Database<any> => { throw new Error('import not initialized') },
  deleteDb: (info: DbInfo): void => { throw new Error('import not initialized') },
  listDbs: (): DbInfo[] => { throw new Error('import not initialized') },
  genLocalId: (name: string) => { throw new Error('import not initialized') },
}

const defaultState: ImportsState = {
  online: defaultOnlineInterface,
  db: defaultDbInterface
}

export const IMPORT_INTIALIZE = 'import/initialize'

export interface ImportInitAction {
  type: typeof IMPORT_INTIALIZE
  imports: ImportsState
}

export const importsInit = (imports: ImportsState): ImportInitAction => ({
  type: IMPORT_INTIALIZE,
  imports
})

type Actions = ImportInitAction | EmptyAction

const reducer = (state: ImportsState = defaultState, action: Actions): ImportsState => {
  switch (action.type) {
    case IMPORT_INTIALIZE:
      return action.imports
    default:
      return state
  }
}

export interface ImportsSlice {
  imports: ImportsState
}

export const ImportsSlice = {
  imports: reducer
}
