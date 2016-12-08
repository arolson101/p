import * as PouchDB from 'pouchdb-browser'
import * as React from 'react'
import { ListGroup, ListGroupItem } from 'react-bootstrap'
import { FormattedMessage, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { DbInfo } from '../../docs'
import { AppState, MetaDb } from '../../state'
import { Lookup } from '../../util'
import { RouteProps } from './props'

const icons = {
  newDb: {
    className: 'fa fa-user-plus'
  },
  openDb: {
    className: 'fa fa-sign-in'
  }
}

const messages = defineMessages({
  newDb: {
    id: 'dbIndex.newDb',
    defaultMessage: 'New'
  },
  newDbDescription: {
    id: 'dbIndex.newDbDescription',
    defaultMessage: 'Create a new data store'
  }
})

interface ConnectedProps {
  dbInfos: DbInfo.Cache
  metaDb: MetaDb
}

interface Props {}
type AllProps = RouteProps & ConnectedProps & Props

export const DbIndexComponent = (props: AllProps) => (
  <div>
    {props.dbInfos &&
      <div>
        <ListGroup>
          {Lookup.map(props.dbInfos, dbInfo =>
            <ListGroupItem
              href={props.router.createHref(DbInfo.path(dbInfo))}
              key={dbInfo._id}
            >
              <h4><i {...icons.openDb}/> {dbInfo.title}</h4>
            </ListGroupItem>
          )}
          {/*Lookup.hasAny(props.dbInfos) &&
            <Divider/>
          */}
          <ListGroupItem
            href={props.router.createHref('/?create')}
          >
            <h4><i {...icons.openDb}/> <FormattedMessage {...messages.newDb}/></h4>
            <p><FormattedMessage {...messages.newDbDescription}/></p>
          </ListGroupItem>
        </ListGroup>
      </div>
    }
  </div>
)

export const DbIndex = connect(
  (state: AppState): ConnectedProps => ({
    dbInfos: state.db.meta.infos,
    metaDb: state.db.meta
  })
)(DbIndexComponent) as React.ComponentClass<Props>
