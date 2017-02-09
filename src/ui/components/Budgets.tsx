import * as React from 'react'
import { PageHeader } from 'react-bootstrap'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { Column } from 'react-virtualized'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes } from 'recompose'
import { Budget } from '../../docs'
import { AppState } from '../../state'
import { BudgetDetail } from './BudgetDetail'
import { ListWithDetails, getRowData } from './ListWithDetails'
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

      <ListWithDetails
        items={budgets}
        columns={[
          {
            label: 'Name',
            dataKey: '',
            width: 300,
            flexGrow: 1,
            cellDataGetter: getRowData,
            cellRenderer: nameCellRenderer
          }
        ]}
        DetailComponent={BudgetDetail}
        toView={Budget.to.view}
      />
    </div>
  )
})

const nameCellRenderer = ({cellData}: Column.CellRendererArgs<Budget.View>) => (
  <div>
    {cellData.doc.name}<br/>
    <small>group: {cellData.doc.group}</small>
  </div>
)
