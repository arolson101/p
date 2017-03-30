const autobind = require('autobind-decorator')
import * as React from 'react'
import { Panel, Button, PageHeader, ListGroup, ListGroupItem } from 'react-bootstrap'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { SyncConnection } from '../../docs/index'
import { AppState, mapDispatchToProps, pushChanges, deleteDoc } from '../../state/index'
import { SyncProvider, syncProviders } from '../../sync/index'
import { runSync } from '../../state/db/sync'
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
})

interface ConnectedProps {
  syncs: SyncConnection.Doc[]
  lang: string
}

interface DispatchProps {
  pushChanges: pushChanges.Fcn
  runSync: runSync.Fcn
}

type AllProps = ConnectedProps & DispatchProps & IntlProps

@injectIntl
@(connect<ConnectedProps, DispatchProps, IntlProps>(
  (state: AppState): ConnectedProps => ({
    syncs: state.db.current!.view.syncs,
    lang: state.i18n.lang,
  }),
  mapDispatchToProps<DispatchProps>({ pushChanges, runSync })
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
              {syncs.filter(sync => sync.provider === provider.id).map((sync) =>
                <ListGroupItem key={sync.provider}>
                  {provider.drawConfig(sync)}
                  <Button onClick={() => this.runSync(sync)}>run sync</Button>
                  <Button className='pull-right' onClick={() => this.removeSync(sync)}>remove</Button>
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
  async addSync (provider: SyncProvider<any>) {
    try {
      const { pushChanges, lang } = this.props
      const config = await provider.createConfig()
      const sync = SyncConnection.doc(config, lang)
      pushChanges({docs: [sync]})
    } catch (err) {
      console.log(err)
    }
  }

  @autobind
  async removeSync (provider: SyncConnection.Doc) {
    try {
      const { pushChanges } = this.props
      pushChanges({docs: [deleteDoc(provider)]})
    } catch (err) {
      console.log(err)
    }
  }

  @autobind
  async runSync (provider: SyncConnection.Doc) {
    try {
      const { runSync } = this.props
      runSync({config: provider})
    } catch (err) {
      console.log(err)
    }
  }
}
