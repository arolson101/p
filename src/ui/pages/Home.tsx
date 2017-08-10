import * as moment from 'moment'
import * as R from 'ramda'
import * as React from 'react'
import { Row, OverlayTrigger, Popover, Grid, Col, Panel, ButtonToolbar, Button,
  PageHeader, ListGroup, ListGroupItem, ProgressBar } from 'react-bootstrap'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { compose, withHandlers, withState } from 'recompose'
// import { AutoSizer } from 'react-virtualized'
import { createSelector } from 'reselect'
// import { VictoryChart, VictoryLine, VictoryTheme, VictoryAxis, VictoryStack, VictoryGroup, VictoryVoronoiTooltip } from 'victory'
import { deleteBudget } from 'core/actions'
import { Bank, Bill, Account, Budget, Category } from 'core/docs'
import { selectAccounts, selectBills, selectBudgets } from 'core/selectors'
import { AppState, mapDispatchToProps } from 'core/state'
import { CurrencyDisplay } from '../components/CurrencyDisplay'
import { Favico } from '../components/Favico'

const messages = defineMessages({
  page: {
    id: 'Home.page',
    defaultMessage: 'Home'
  },
  settings: {
    id: 'Home.settings',
    defaultMessage: 'Options'
  },
  addBudget: {
    id: 'Home.addBudget',
    defaultMessage: 'Add Budget'
  },
  editBudget: {
    id: 'Home.editBudget',
    defaultMessage: 'Edit'
  },
  budget: {
    id: 'Home.budget',
    defaultMessage: 'Budget'
  },
  frequency: {
    id: 'Home.frequency',
    defaultMessage: 'Frequency'
  },
  category: {
    id: 'Home.category',
    defaultMessage: 'Category'
  },
  targetAmount: {
    id: 'Home.targetAmount',
    defaultMessage: 'Amount'
  },
  uniqueBudget: {
    id: 'Home.uniqueBudget',
    defaultMessage: 'Budget name already used'
  },
  uniqueCategory: {
    id: 'Home.uniqueCategory',
    defaultMessage: 'Category name already used in this budget'
  },
})

interface DataPoint {
  date: Date
  value: number
  name: string
}

interface AccountData {
  name: string
  points: DataPoint[]
}

interface ConnectedProps {
  budgets: Budget.View[]
  data: AccountData[]
}

interface DispatchProps {
  deleteBudget: deleteBudget.Fcn
}

interface StateProps {
  month?: Date
  setMonth: (month?: Date) => void
}

interface Handlers {
  setPrevMonth: () => void
  setNextMonth: () => void
}

type EnhancedProps = Handlers & StateProps & ConnectedProps & DispatchProps & IntlProps

// interface CategoryValues {
//   _id: string
//   name: string
//   amount: number
// }

// interface BudgetValues {
//   _id: string
//   name: string
//   categories: CategoryValues[]
// }

// interface Values {
//   budgets: BudgetValues[]
// }

const enhance = compose<EnhancedProps, undefined>(
  injectIntl,
  connect<ConnectedProps, DispatchProps, IntlProps>(
    (state: AppState): ConnectedProps => ({
      budgets: selectBudgets(state),
      data: selectAccountData(state)
    }),
    mapDispatchToProps<DispatchProps>({ deleteBudget })
  ),
  withState('month', 'setMonth', undefined),
  withHandlers<StateProps & ConnectedProps & DispatchProps & IntlProps, Handlers>({
    setPrevMonth: ({setMonth, month}) => () => {
      const prev = moment(month).subtract(1, 'month').toDate()
      setMonth(prev)
    },

    setNextMonth: ({setMonth, month}) => () => {
      const next = moment(month).add(1, 'month').toDate()
      setMonth(next)
    }
  })
)

export const Home = enhance(props => {
  // const { budgets, data, intl: { formatDate, formatNumber } } = this.props
  const { budgets, month, setPrevMonth, setNextMonth } = props

  return (
    <div style={{paddingBottom: 10}}>

      <PageHeader>
        <FormattedMessage {...messages.page}/>
      </PageHeader>

      {/*<AutoSizer disableHeight>
        {(autoSizerProps: AutoSizer.ChildrenProps) => (
          <div style={{width: autoSizerProps.width}}>
            <VictoryChart
              height={300}
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
                {data.map(account => account.points.length > 1 &&
                  <VictoryGroup
                    key={account.name}
                    data={account.points}
                    x='date'
                    y='value'
                    name={account.name}
                  >
                    <VictoryLine
                    />
                    <VictoryVoronoiTooltip
                      labels={
                        (d: DataPoint) => {
                          const date = formatDate(d.date, {})
                          const amount = formatNumber(d.value, {style: 'currency', currency: 'USD'})
                          return `${account.name}\n${date} - ${d.name}\n${amount}`
                        }
                      }
                    />
                  </VictoryGroup>
                )}
              </VictoryStack>
            </VictoryChart>
          </div>
        )}
      </AutoSizer>*/}

      <h3>
        {moment(month).format('MMMM YYYY')}
        <ButtonToolbar className='pull-right'>
          <Button bsStyle='link' onClick={setPrevMonth}><i className='fa fa-caret-left'/></Button>
          <Button bsStyle='link' onClick={setNextMonth}><i className='fa fa-caret-right'/></Button>
        </ButtonToolbar>
      </h3>

      {budgets.map(budget =>
        <Panel key={budget.doc._id} header={
          <h1>{budget.doc.name}</h1>
        }>
          <ListGroup fill>
            {budget.doc.categories.length === 0 &&
              <ListGroupItem>
                <small><em>no categories</em></small>
              </ListGroupItem>
            }
             {/*budget.categories.map(category =>
              <ListGroupItem key={category.doc._id}>
                <Grid fluid>
                  <Row>
                    <Col xs={2}>
                      {category.doc.name}
                    </Col>
                    <Col xs={8}>
                      <CategoryProgress category={category}/>
                    </Col>
                    <Col xs={2}>
                      <em><small>
                        <CurrencyDisplay amount={category.doc.amount}/>
                      </small></em>
                    </Col>
                  </Row>
                  {category.bills.map(bill =>
                    <Row key={bill.doc._id}>
                      <Col xs={8} xsOffset={2}>
                        <Favico value={bill.doc.favicon}/>
                        {' '}
                        {bill.doc.name}
                      </Col>
                      <Col xs={2}>
                        <em><small>
                          <CurrencyDisplay amount={bill.doc.amount}/>
                        </small></em>
                      </Col>
                    </Row>
                  )}
                </Grid>
              </ListGroupItem>
            )*/}
          </ListGroup>
        </Panel>
      )}
    </div>
  )
})

const CategoryProgress = ({category}: {category: Category.Doc}) => {
  const max = parseFloat(category.amount as any)
  const expenses = category.amount / 4
  const contributions = category.amount / 3

  const overlay = (
    <Popover id={'popover-category-' + category._id}>
      Contributions: ${contributions}<br/>
      Expenses: ${expenses}
    </Popover>
  )

  if (contributions > expenses) {
    return <OverlayTrigger trigger={['hover', 'focus']} placement='bottom' overlay={overlay}>
      <ProgressBar>
        <ProgressBar max={max} now={expenses} label={`expenses $ ${expenses}`}/>
        <ProgressBar max={max} now={contributions - expenses} label={`contributed $ ${contributions}`} bsStyle='success'/>
      </ProgressBar>
    </OverlayTrigger>
  } else {
    return <ProgressBar>
      <ProgressBar max={max} now={contributions} label={`contributed $ ${contributions}`} bsStyle='success'/>
      <ProgressBar max={max} now={expenses - contributions} label={`expenses $ ${expenses}`} bsStyle='danger'/>
    </ProgressBar>
  }
}

const selectAccountData = createSelector(
  (state: AppState) => selectAccounts(state),
  (state: AppState) => selectBills(state),
  (accounts, bills) => {
    return []
    // const start = new Date()
    // const end = moment(start).add(3, 'months').toDate()
    // return R.pipe(
    //   R.map((account: Account.Doc): AccountData => {
    //     const points = R.pipe(
    //       R.filter((bill: Bill.Doc) => bill.account === account._id),
    //       R.chain(
    //         (bill: Bill.Doc) => bill.rrule.between(start, end, true)
    //           .map(date => ({date, value: bill.doc.amount, name: bill.doc.name}))
    //       ),
    //       R.sort((a: DataPoint, b: DataPoint) => a.date.valueOf() - b.date.valueOf()),
    //       R.reduce(
    //         (pts: DataPoint[], pt: DataPoint) => {
    //           const prev = pts[pts.length - 1].value
    //           pts.push({...pt, value: pt.value + prev})
    //           return pts
    //         },
    //         [{date: start, value: 0 /*account.balance*/, name: 'initial balance'}]
    //       )
    //     )(bills)

    //     // console.log(account.doc.name, points)

    //     return {
    //       name: account.name,
    //       points
    //     }
    //   })
    // )(accounts)
  }
)
