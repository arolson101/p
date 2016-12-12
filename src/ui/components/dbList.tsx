import * as React from 'react'
import { Grid, ListGroup, ListGroupItem } from 'react-bootstrap'
import { FormattedMessage, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { DbInfo } from '../../docs'
import { AppState } from '../../state'
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
    id: 'login.newDb',
    defaultMessage: 'New'
  },
  newDbDescription: {
    id: 'login.newDbDescription',
    defaultMessage: 'Create a new data store'
  }
})

interface ConnectedProps {
  dbInfos: DbInfo.Cache
}

interface Props {}
type AllProps = RouteProps<any> & ConnectedProps & Props

export const DbListComponent = (props: AllProps) => (
  <Grid>
    {props.dbInfos &&
      <div>
        <ListGroup>
          {Lookup.map(props.dbInfos, dbInfo =>
            <ListGroupItem
              href={props.router.createHref(DbInfo.to.read(dbInfo))}
              key={dbInfo._id}
            >
              <h4><i {...icons.openDb}/> {dbInfo.title}</h4>
            </ListGroupItem>
          )}
          {/*Lookup.hasAny(props.dbInfos) &&
            <Divider/>
          */}
          <ListGroupItem
            href={props.router.createHref(DbInfo.to.create())}
          >
            <h4><i {...icons.openDb}/> <FormattedMessage {...messages.newDb}/></h4>
            <p><FormattedMessage {...messages.newDbDescription}/></p>
          </ListGroupItem>
        </ListGroup>
      </div>
    }
  </Grid>
)

export const DbList = connect(
  (state: AppState): ConnectedProps => ({
    dbInfos: state.db.meta.infos
  })
)(DbListComponent) as React.ComponentClass<Props>
