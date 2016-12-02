import createSagaMiddleware, { takeLatest } from 'redux-saga'
import { call, put } from 'redux-saga/effects'
import { DocChangeAction, DbInfo, Account, Institution } from '../docs'
import * as Db from '../state/db'

export const sagaMiddleware = createSagaMiddleware()

export function* appSaga() {
  yield takeLatest(Db.DB_SET_META, onDbSetMeta)
  yield takeLatest(Db.DB_SET_CURRENT, onDbSetCurrent)
  yield takeLatest(DbInfo.CHANGE_ACTION, onDbInfoChange)
  yield takeLatest(Institution.CHANGE_ACTION, onInstitutionChange)
  yield takeLatest(Account.CHANGE_ACTION, onAccountChange)
}

// update DbInfo cache
function* updateDbInfoCache(handle: PouchDB.Database<any>) {
  const results: PouchDB.FindResult<DbInfo.Doc> = yield call([handle, handle.find], {selector: DbInfo.all})
  const cache = yield DbInfo.createCache(results.docs)
  yield put(DbInfo.cacheSetAction(cache))
}

// update Institution cache
function* updateInstitutionCache(handle?: PouchDB.Database<any>) {
  let results: PouchDB.FindResult<Institution.Doc> | undefined = undefined
  if (handle) {
    results = yield call([handle, handle.find], {selector: Institution.all})
  }
  const cache = Institution.createCache(results ? results.docs : [])
  yield put(Institution.cacheSetAction(cache))
}

// update Account cache
function* updateAccountCache(handle?: PouchDB.Database<any>) {
  let results: PouchDB.FindResult<Account.Doc> | undefined = undefined
  if (handle) {
    results = yield call([handle, handle.find], {selector: Account.all})
  }
  const cache = Account.createCache(results ? results.docs : [])
  yield put(Account.cacheSetAction(cache))
}

// meta db set
function* onDbSetMeta(action: Db.SetMetaDbAction) {
  yield updateDbInfoCache(action.meta.handle)
}

// current db set
function *onDbSetCurrent(action: Db.SetDbAction) {
  const handle = action.current && action.current.handle
  yield updateInstitutionCache(handle)
  yield updateAccountCache(handle)
}

// DbInfo changed
function* onDbInfoChange(action: DocChangeAction) {
  yield updateDbInfoCache(action.handle)
}

// Institution changed
function* onInstitutionChange(action: DocChangeAction) {
  yield updateInstitutionCache(action.handle)
}

// Account changed
function* onAccountChange(action: DocChangeAction) {
  yield updateAccountCache(action.handle)
}
