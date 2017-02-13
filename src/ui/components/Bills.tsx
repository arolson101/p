import * as moment from 'moment'
import * as R from 'ramda'
import * as React from 'react'
import { Grid, Col, Panel, ListGroup, ListGroupItem, PageHeader } from 'react-bootstrap'
import { injectIntl, FormattedDate, FormattedMessage, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { AutoSizer } from 'react-virtualized'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes } from 'recompose'
import { createSelector } from 'reselect'
import { VictoryChart, VictoryLine, VictoryTheme, VictoryAxis, VictoryStack } from 'victory'
import { Bank, Bill, Account } from '../../docs'
import { AppState } from '../../state'
import { CurrencyDisplay } from './CurrencyDisplay'
import { Favico } from './forms/Favico'
import { RouteProps } from './props'
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

interface DataPoint {
  date: Date
  value: number
}

interface AccountData {
  name: string
  points: DataPoint[]
}

interface ConnectedProps {
  groups: BillDisplayGroup[]
  data: AccountData[]
}

type AllProps = ConnectedProps & RouteProps<any>

const enhance = compose<AllProps, {}>(
  setDisplayName('Bills'),
  onlyUpdateForPropTypes,
  setPropTypes({}),
  injectIntl,
  connect<ConnectedProps, {}, {}>(
    (state: AppState): ConnectedProps => ({
      groups: selectBillDisplayGroups(state),
      data: selectAccountData(state)
    })
  )
)

export const Bills = enhance((props: AllProps) => {
  const { groups, router } = props
  const now = new Date()

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

      <AutoSizer disableHeight>
        {(autoSizerProps: AutoSizer.ChildrenProps) => (
          <div style={{width: autoSizerProps.width, borderStyle: 'solid', borderWidth: 1}}>
            <VictoryChart
              height={200}
              width={autoSizerProps.width}
              domainPadding={20}
              theme={VictoryTheme.material}
            >
              <VictoryAxis
                scale='time'
              />
              <VictoryAxis
                dependentAxis
                tickFormat={(x) => (`$${x}`)}
              />
              <VictoryStack
                colorScale={'warm'}
              >
                {props.data.map(account => account.points.length &&
                  <VictoryLine
                    key={account.name}
                    name={account.name}
                    data={account.points}
                    x='date'
                    y='value'
                  />
                )}
              </VictoryStack>
            </VictoryChart>
          </div>
        )}
      </AutoSizer>

      {groups.map(group =>
        <Panel key={group.name} header={<h1>{group.name}</h1>}>

          <ListGroup fill>
          {group.bills.map(bill => {
            const past = bill.next < now
            return (
              <ListGroupItem key={bill.view.doc.name} href={router.createHref(Bill.to.edit(bill.view.doc))}>
                <Grid fluid className={past ? 'text-muted' : ''}>
                  <Col xs={2}>
                    <FormattedDate value={bill.next} /><br/>
                    <small><em>{bill.view.rrule.toText()}</em></small>
                  </Col>
                  <Col xs={5}>
                    <Favico value={bill.view.doc.favicon} greyscale={past}/>
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

const getGroup = (date?: Date) => {
  if (!date) {
    return 'none'
  }

  return moment(date).format('MMMM YYYY')
}

const makeBillDisplayGroup = (startDate: Date) => R.pipe(
  R.map((view: Bill.View): BillDisplay => ({
    view,
    next: view.rrule.after(startDate, true)
  })),
  R.groupBy((bill: BillDisplay) => getGroup(bill.next)),
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

const selectAccountData = createSelector(
  (state: AppState) => state.db.current!.view.banks,
  (state: AppState) => state.db.current!.view.bills,
  (banks, bills) => {
    const start = new Date()
    const end = moment(start).add(3, 'months').toDate()
    return R.pipe(
      R.chain((bank: Bank.View) => bank.accounts),
      R.map((account: Account.View): AccountData => {
        const points = R.pipe(
          R.filter((bill: Bill.View) => bill.doc.account === account.doc._id),
          R.chain(
            (bill: Bill.View) => bill.rrule.between(start, end, true)
              .map(date => ({date, value: bill.doc.amount, name: bill.doc.name}))
          ),
          R.sort((a: DataPoint, b: DataPoint) => a.date.valueOf() - b.date.valueOf()),
          R.reduce(
            (pts: DataPoint[], pt: DataPoint) => {
              const prev = pts[pts.length - 1].value
              pts.push({...pt, value: pt.value + prev})
              return pts
            },
            [{date: start, value: account.balance}]
          )
        )(bills)

        console.log(account.doc.name, points)

        return {
          name: account.doc.name,
          points
        }
      })
    )(banks)
  }
)
