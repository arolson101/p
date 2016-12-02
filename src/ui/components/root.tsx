import * as React from 'react'
import { Router, Link } from 'react-router'
import { createSelector } from 'reselect'
import { DbInfo, Institution, Account } from '../../docs'
import { AppState, historyAPI, OpenDb } from '../../state'
import { promisedConnect, Promised, Lookup } from '../../util'
import { Body } from './body'

interface Props {}

interface Params {
  db: DbInfo.Id
  institution: Institution.Id
  account: Account.Id
}

type RouteProps = Router.RouteComponentProps<Params, any>

interface ConnectedProps {
  metaDb: OpenDb
  current?: OpenDb
}

interface DispatchedProps {
  dispatch: Redux.Dispatch<AppState>
}

interface DbQueryResults {
  institutions: Lookup<Institution>
  accounts: Lookup<Account>
}

interface AsyncProps {
  dbInfos: Lookup<DbInfo.Doc>
  dbq?: DbQueryResults
}

export type RootProps =
  React.Props<any>
  & RouteProps
  & Props
  & ConnectedProps
  & DispatchedProps
  & DbQueryResults
  & AsyncProps

export const RootComponent = (props: RootProps) => (
  <div>
    <a href='#' onClick={(event) => {
      event.preventDefault()
      historyAPI.goBack()
    }}>&lt;</a>{' '}
    <a href='#' onClick={(event) => {
      event.preventDefault()
      historyAPI.goForward()
    }}>&gt;</a>{' '}
    [ {props.location!.pathname + props.location!.search} ]{' '}
    <Link to='/'>/</Link>{' '}
    <div>
      <Body {...props}/>
    </div>
  </div>
)

const queryDbInfos = createSelector(
  (state: AppState) => state.db.meta!,
  async (meta): Promise<Lookup<DbInfo>> => {
    const results = await meta.handle.find({selector: DbInfo.all})
    return Lookup.create(results.docs)
  }
)

const queryCurrentDb = createSelector(
  (state: AppState) => state.db.current,
  async (current): Promise<DbQueryResults | undefined> => {
    if (current) {
      const iresults = await current.handle.find({selector: Institution.all})
      const institutions = Lookup.create<Institution>(iresults.docs)
      const aresults = await current.handle.find({selector: Account.all})
      const accounts = Lookup.create<Account>(aresults.docs)
      return { institutions, accounts }
    }
  }
)

export const Root = promisedConnect(
  (state: AppState, props: RouteProps): ConnectedProps & Promised<AsyncProps> => ({
    metaDb: state.db.meta!,
    dbInfos: queryDbInfos(state),
    dbq: queryCurrentDb(state, props),
    current: state.db.current
  })
)(RootComponent as any) as React.ComponentClass<Props>
