import * as moment from 'moment'
import * as R from 'ramda'
import * as React from 'react'
import { Button, Grid, Col, Panel, ListGroup, ListGroupItem, PageHeader } from 'react-bootstrap'
import { FormattedDate, FormattedMessage, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes, withHandlers } from 'recompose'
import ui, { ReduxUIProps } from 'redux-ui'
import { createSelector } from 'reselect'
import { Bill } from '../../docs/index'
import { selectBillViews } from '../../selectors'
import { AppState, mapDispatchToProps } from '../../state/index'
import { showBillDialog } from '../dialogs/index'
import { CurrencyDisplay } from '../components/CurrencyDisplay'
import { Favico } from '../components/Favico'
import { SettingsMenu } from '../components/SettingsMenu'

const messages = defineMessages({
  page: {
    id: 'Bills.page',
    defaultMessage: 'Bills'
  },
  settings: {
    id: 'Bills.settings',
    defaultMessage: 'Options'
  },
  addBill: {
    id: 'Bills.addBill',
    defaultMessage: 'Add Bill'
  }
})

interface BillDisplay {
  view: Bill.View
  next: Date
}

interface BillDisplayGroup {
  name: string
  order: number
  bills: BillDisplay[]
}

interface ConnectedProps {
  groups: BillDisplayGroup[]
}

interface DispatchProps {
  showBillDialog: typeof showBillDialog
}

interface Handlers {
  createBill: () => void
}

type EnhancedProps = Handlers & ConnectedProps & DispatchProps

const enhance = compose<EnhancedProps, undefined>(
  setDisplayName('Bills'),
  onlyUpdateForPropTypes,
  setPropTypes({}),
  connect<ConnectedProps, DispatchProps, {}>(
    (state: AppState): ConnectedProps => ({
      groups: selectBillDisplayGroups(state)
    }),
    mapDispatchToProps<DispatchProps>({ showBillDialog })
  ),
  withHandlers<Handlers, ConnectedProps & ConnectedProps & DispatchProps>({
    createBill: ({ showBillDialog }) => () => {
      showBillDialog({})
    },
  })
)

export const Bills = enhance((props) => {
  const { groups, createBill, showBillDialog } = props

  return (
    <div style={{height: '100%', display: 'flex', flexDirection: 'column'}}>

      <PageHeader>
        <SettingsMenu
          items={[
            {
              message: messages.addBill,
              onClick: createBill
            }
          ]}
        />

        <FormattedMessage {...messages.page}/>
      </PageHeader>

      {groups.map(group =>
        <Panel key={group.name} header={<h1>{group.name}</h1>}>

          <ListGroup fill>
          {group.bills.map(bill => {
            return (
              <ListGroupItem key={bill.view.doc.name}>
                <Grid fluid>
                  <Col xs={2}>
                    <FormattedDate value={bill.next} /><br/>
                    <small><em>{bill.view.rrule.toText()}</em></small>
                  </Col>
                  <Col xs={4}>
                    <Favico value={bill.view.doc.favicon}/>
                    {' '}
                    {bill.view.doc.name}<br/>
                    <small>{bill.view.doc.notes}</small>
                  </Col>
                  <Col xs={3}>
                    <small>
                    {bill.view.account && bill.view.account.name}<br/>
                    {bill.view.budget && bill.view.category &&
                      `${bill.view.budget.name}: ${bill.view.category.name}`
                    }
                    </small>
                  </Col>
                  <Col xs={2}>
                    <CurrencyDisplay amount={bill.view.doc.amount}/>
                  </Col>
                  <Col xs={1}>
                    <Button bsStyle='link' onClick={() => showBillDialog({edit: bill.view})}>
                      <i className='fa fa-edit'/>
                    </Button>
                  </Col>
                </Grid>
              </ListGroupItem>
            )
          })}
          </ListGroup>
        </Panel>
      )}
    </div>
  )
})

const getGroup = (bill: BillDisplay) => {
  return bill.view.doc.group
}

const makeBillDisplayGroup = (startDate: Date) => R.pipe(
  R.map((view: Bill.View): BillDisplay => ({
    view,
    next: view.rrule.after(startDate, true)
  })),
  R.groupBy(getGroup),
  R.mapObjIndexed((bills: BillDisplay[], name: string): BillDisplayGroup => ({
    name,
    order: moment(name, 'MMMM YYYY').valueOf(),
    bills: R.sortBy(bill => bill.next.valueOf(), bills)
  })),
  R.values,
  R.sortBy((group: BillDisplayGroup) => group.order.toString())
)

const getMonthStart = (): Date => {
  const date = new Date()
  date.setDate(1)
  return date
}

const selectBillDisplayGroups = createSelector(
  (state: AppState) => selectBillViews(state),
  (state: AppState) => getMonthStart(),
  (bills, start) => {
    return makeBillDisplayGroup(start)(bills)
  }
)