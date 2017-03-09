const autobind = require('autobind-decorator')
import * as update from 'immutability-helper'
import * as React from 'react'
import { Panel, Button, PageHeader, ListGroup, ListGroupItem } from 'react-bootstrap'
import { injectIntl, FormattedMessage, defineMessages, FormattedRelative } from 'react-intl'
import { connect } from 'react-redux'
import { SyncConnection } from '../../docs/index'
import { AppState, mapDispatchToProps, pushChanges } from '../../state/index'
import { SyncProvider, syncProviders } from '../../sync/index'
// import { Favico } from './forms/Favico'
import { IntlProps } from './props'

const messages = defineMessages({
  page: {
    id: 'Syncs.page',
    defaultMessage: 'Sync Connections'
  },
  settings: {
    id: 'Syncs.settings',
    defaultMessage: 'Options'
  },
  addSync: {
    id: 'Syncs.addSync',
    defaultMessage: 'Add Sync'
  },
  expires: {
    id: 'Syncs.expires',
    defaultMessage: 'Expires'
  },
})

interface ConnectedProps {
  syncs: SyncConnection.Doc
}

interface DispatchProps {
  pushChanges: pushChanges.Fcn
}

type AllProps = ConnectedProps & DispatchProps & IntlProps

@injectIntl
@(connect<ConnectedProps, DispatchProps, IntlProps>(
  (state: AppState): ConnectedProps => ({
    syncs: state.db.current!.cache.syncs,
  }),
  mapDispatchToProps<DispatchProps>({ pushChanges })
) as any)
export class Syncs extends React.Component<AllProps, {}> {
  render () {
    const { syncs } = this.props

    return (
      <div style={{paddingBottom: 10}}>

        <PageHeader>
          <FormattedMessage {...messages.page}/>
        </PageHeader>

        {syncProviders.map(provider =>
          <Panel
            key={provider.id}
            header={
              <h1><FormattedMessage {...provider.title}/></h1>
            }
          >
            <ListGroup fill>
              {syncs.connections.filter(sync => sync.provider === provider.id).map((sync, index) =>
                <ListGroupItem key={sync.provider}>
                  <FormattedMessage {...messages.expires}/>
                  {' '}
                  <FormattedRelative value={SyncConnection.expiration(sync).valueOf()}/>
                  <Button onClick={() => this.refreshToken(provider, sync, index)}>refresh</Button>
                  <Button className='pull-right' onClick={() => this.removeSync(index)}>remove</Button>
                </ListGroupItem>
              )}
              <ListGroupItem>
                <Button onClick={() => this.addSync(provider)}>
                  <i className='fa fa-plus'/>
                  {' '}
                  <FormattedMessage {...messages.addSync}/>
                </Button>
              </ListGroupItem>
            </ListGroup>
          </Panel>
        )}
      </div>
    )
  }

  @autobind
  async addSync (provider: SyncProvider) {
    try {
      const { pushChanges, syncs } = this.props
      const token = await provider.getToken()
      const sync: SyncConnection = {
        provider: provider.id,
        token,
        tokenTime: new Date().valueOf()
      }
      const nextSyncs = update(syncs, { connections: { $push: [sync] } })
      pushChanges({docs: [nextSyncs]})
    } catch (err) {
      console.log(err)
    }
  }

  @autobind
  async removeSync (index: number) {
    try {
      const { pushChanges, syncs } = this.props
      const nextSyncs = update(syncs, { connections: { $splice: [[index, 1]] } })
      pushChanges({docs: [nextSyncs]})
    } catch (err) {
      console.log(err)
    }
  }

  @autobind
  async refreshToken (provider: SyncProvider, sync: SyncConnection, index: number) {
    try {
      const { pushChanges, syncs } = this.props
      const token = await provider.refreshToken(sync.token)
      const nextSync = {
        ...sync,
        token: {
          ...sync.token,
          ...token
        },
        tokenTime: new Date().valueOf()
      }
      const nextSyncs = update(syncs, { connections: { [index]: { $set: nextSync } } })
      pushChanges({docs: [nextSyncs]})
    } catch (err) {
      console.log(err)
    }
  }
}
