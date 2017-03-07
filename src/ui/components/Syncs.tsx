const autobind = require('autobind-decorator')
import * as moment from 'moment'
import * as React from 'react'
import { Panel, Button, PageHeader, ListGroup, ListGroupItem } from 'react-bootstrap'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { SyncConnection } from '../../docs/index'
import { AppState, mapDispatchToProps, pushChanges } from '../../state/index'
import { SyncProvider, syncProviders } from '../../sync/index'
import { Favico } from './forms/Favico'
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
  editBudget: {
    id: 'Syncs.editBudget',
    defaultMessage: 'Edit'
  },
  budget: {
    id: 'Syncs.budget',
    defaultMessage: 'Budget'
  },
  frequency: {
    id: 'Syncs.frequency',
    defaultMessage: 'Frequency'
  },
  category: {
    id: 'Syncs.category',
    defaultMessage: 'Category'
  },
  targetAmount: {
    id: 'Syncs.targetAmount',
    defaultMessage: 'Amount'
  },
  uniqueBudget: {
    id: 'Syncs.uniqueBudget',
    defaultMessage: 'Budget name already used'
  },
  uniqueCategory: {
    id: 'Syncs.uniqueCategory',
    defaultMessage: 'Category name already used in this budget'
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
                  {sync.provider}
                  <Button onClick={() => this.removeSync(index)}>remove</Button>
                </ListGroupItem>
              )}
              <ListGroupItem>
                <Button onClick={() => this.addSync(provider)}>
                  <i className='fa fa-add'/>
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
      const expires = moment().add(token.expires_in, 'seconds').valueOf()
      const nextSyncs = {
        ...syncs,
        connections: [
          ...syncs.connections,
          {
            provider: provider.id,
            accessToken: token.access_token,
            refreshToken: token.refresh_token,
            tokenType: token.token_type,
            expires
          }
        ]
      }
      pushChanges({docs: [nextSyncs]})
    } catch (err) {
      console.log(err)
    }
  }

  @autobind
  async removeSync (index: number) {
    try {
      const { pushChanges, syncs } = this.props
      const nextSyncs = {
        ...syncs,
        connections: [
          ...syncs.connections.slice(0, index),
          ...syncs.connections.slice(index + 1)
        ]
      }
      pushChanges({docs: [nextSyncs]})
    } catch (err) {
      console.log(err)
    }
  }
}
