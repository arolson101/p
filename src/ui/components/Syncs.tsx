import * as React from 'react'
import { Panel, Button, PageHeader, ListGroup, ListGroupItem } from 'react-bootstrap'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { compose, withHandlers } from 'recompose'
import { SyncConnection } from '../../docs/index'
import { AppState, mapDispatchToProps, pushChanges, deleteDoc } from '../../state/index'
import { SyncProvider, syncProviders } from '../../sync/index'
import { runSync } from '../../state/db/sync'
// import { Favico } from './forms/Favico'
import { SyncStatus } from './SyncStatus'

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

interface Handlers {
  addSync: (provider: SyncProvider<any>) => void
  removeSync: (provider: SyncConnection.Doc) => void
  runSync: (provider: SyncConnection.Doc) => void
}

type EnhancedProps = Handlers & ConnectedProps & DispatchProps & IntlProps

const enhance = compose<EnhancedProps, undefined>(
  injectIntl,
  connect<ConnectedProps, DispatchProps, IntlProps>(
    (state: AppState): ConnectedProps => ({
      syncs: state.db.current!.view.syncs,
      lang: state.i18n.lang,
    }),
    mapDispatchToProps<DispatchProps>({ pushChanges, runSync })
  ),
  withHandlers<Handlers, ConnectedProps & DispatchProps & IntlProps>({
    addSync: ({ pushChanges, lang }) => async (provider: SyncProvider<any>) => {
      try {
        const config = await provider.createConfig()
        const sync = SyncConnection.doc(config, lang)
        pushChanges({docs: [sync]})
      } catch (err) {
        console.log(err)
      }
    },
    removeSync: ({ pushChanges }) => async (provider: SyncConnection.Doc) => {
      try {
        pushChanges({docs: [deleteDoc(provider)]})
      } catch (err) {
        console.log(err)
      }
    },
    runSync: ({ runSync }) => async (provider: SyncConnection.Doc) => {
      try {
        runSync({config: provider})
      } catch (err) {
        console.log(err)
      }
    }
  })
)

export const Syncs = enhance(props => {
  const { syncs, runSync, removeSync, addSync } = props

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
                <SyncStatus sync={sync}/>
                <Button onClick={() => runSync(sync)}>run sync</Button>
                <Button className='pull-right' onClick={() => removeSync(sync)}>remove</Button>
              </ListGroupItem>
            )}
            <ListGroupItem>
              <Button onClick={() => addSync(provider)}>
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
})
