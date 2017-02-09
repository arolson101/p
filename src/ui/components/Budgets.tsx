import * as React from 'react'
import { PageHeader, ListGroup, ListGroupItem } from 'react-bootstrap'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes } from 'recompose'
import { Budget } from '../../docs'
import { AppState } from '../../state'
import { SettingsMenu } from './SettingsMenu'

const messages = defineMessages({
  page: {
    id: 'Budgets.page',
    defaultMessage: 'Budgets'
  },
  settings: {
    id: 'Budgets.settings',
    defaultMessage: 'Options'
  },
  addBudget: {
    id: 'Budgets.addBudget',
    defaultMessage: 'Add Budget'
  }
})

interface ConnectedProps {
  budgets: Budget.View[]
}

type AllProps = ConnectedProps

const enhance = compose<AllProps, {}>(
  setDisplayName('Budget'),
  onlyUpdateForPropTypes,
  setPropTypes({}),
  injectIntl,
  connect<ConnectedProps, {}, {}>(
    (state: AppState): ConnectedProps => ({
      budgets: state.db.current!.view.budgets
    })
  )
)

export const Budgets = enhance((props: AllProps) => {
  const { budgets } = props

  return (
    <div style={{height: '100%', display: 'flex', flexDirection: 'column'}}>

      <PageHeader>
        <SettingsMenu
          items={[
            {
              message: messages.addBudget,
              to: Budget.to.create()
            }
          ]}
        />

        <FormattedMessage {...messages.page}/>
      </PageHeader>

      <ListGroup>
        {budgets.map(budget =>
          <ListGroupItem key={budget.doc._id}>
            {budget.doc.name}
          </ListGroupItem>
        )}
      </ListGroup>
    </div>
  )
})
