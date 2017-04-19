import * as moment from 'moment'
import * as R from 'ramda'
import * as React from 'react'
import { Grid, Col, Panel, ListGroup, ListGroupItem, PageHeader } from 'react-bootstrap'
import { injectIntl, FormattedDate, FormattedMessage, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes } from 'recompose'
import { createSelector } from 'reselect'
import { Bill } from '../../docs/index'
import { AppState } from '../../state/index'
import { CurrencyDisplay } from './CurrencyDisplay'
import { Favico } from './forms/Favico'
import { RouteProps, IntlProps } from './props'
import { SettingsMenu } from './SettingsMenu'

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

type AllProps = ConnectedProps & RouteProps<any> & IntlProps

const enhance = compose<AllProps, void>(
  setDisplayName('Bills'),
  onlyUpdateForPropTypes,
  setPropTypes({}),
  injectIntl,
  withRouter,
  connect<ConnectedProps, {}, {}>(
    (state: AppState): ConnectedProps => ({
      groups: selectBillDisplayGroups(state)
    })
  )
)

export const Bills = enhance((props) => {
  const { groups, history } = props

  return (
    <div style={{height: '100%', display: 'flex', flexDirection: 'column'}}>

      <PageHeader>
        <SettingsMenu
          items={[
            {
              message: messages.addBill,
              to: Bill.to.create()
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
              <ListGroupItem key={bill.view.doc.name} onClick={() => history.push(Bill.to.edit(bill.view.doc))}>
                <Grid fluid>
                  <Col xs={2}>
                    <FormattedDate value={bill.next} /><br/>
                    <small><em>{bill.view.rrule.toText()}</em></small>
                  </Col>
                  <Col xs={5}>
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
    bills: R.sortBy(bill => bill.next, bills)
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
  (state: AppState) => state.db.current!.view.bills,
  (state: AppState) => getMonthStart(),
  (bills, start) => {
    return makeBillDisplayGroup(start)(bills)
  }
)
