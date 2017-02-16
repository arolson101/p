const autobind = require('autobind-decorator')
import * as moment from 'moment'
import * as R from 'ramda'
import * as React from 'react'
import { Row, OverlayTrigger, Popover, Grid, Col, Panel, ButtonToolbar, Button,
  PageHeader, ListGroup, ListGroupItem, ProgressBar } from 'react-bootstrap'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { AutoSizer } from 'react-virtualized'
import { createSelector } from 'reselect'
// import { VictoryChart, VictoryLine, VictoryTheme, VictoryAxis, VictoryStack, VictoryGroup, VictoryVoronoiTooltip } from 'victory'
import { deleteBudget } from '../../actions/index'
import { Bank, Bill, Account, Budget, Category } from '../../docs/index'
import { AppState, mapDispatchToProps, pushChanges } from '../../state/index'
import { CurrencyDisplay } from './CurrencyDisplay'
import { Favico } from './forms/Favico'
import { IntlProps } from './props'

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
  lang: string
  budgets: Budget.View[]
  data: AccountData[]
}

interface DispatchProps {
  pushChanges: pushChanges.Fcn
  deleteBudget: deleteBudget.Fcn
}

interface State {
  month?: Date
}

type AllProps = ConnectedProps & DispatchProps & IntlProps

interface CategoryValues {
  _id: string
  name: string
  amount: number
}

interface BudgetValues {
  _id: string
  name: string
  categories: CategoryValues[]
}

interface Values {
  budgets: BudgetValues[]
}

@injectIntl
@(connect<ConnectedProps, DispatchProps, IntlProps>(
  (state: AppState): ConnectedProps => ({
    lang: state.i18n.lang,
    budgets: state.db.current!.view.budgets,
    data: selectAccountData(state)
  }),
  mapDispatchToProps<DispatchProps>({ pushChanges, deleteBudget })
) as any)
export class Home extends React.Component<AllProps, State> {
  state: State = {
    month: new Date()
  }

  render () {
    const { budgets, data, intl: { formatDate, formatNumber } } = this.props
    const { month } = this.state

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
            <Button bsStyle='link' onClick={this.prevMonth}><i className='fa fa-caret-left'/></Button>
            <Button bsStyle='link' onClick={this.nextMonth}><i className='fa fa-caret-right'/></Button>
          </ButtonToolbar>
        </h3>

        {budgets.map(budget =>
          <Panel key={budget.doc._id} header={
            <h1>{budget.doc.name}</h1>
          }>
            <ListGroup fill>
              {budget.categories.length === 0 &&
                <ListGroupItem>
                  <small><em>no categories</em></small>
                </ListGroupItem>
              }
              {budget.categories.map(category =>
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
              )}
            </ListGroup>
          </Panel>
        )}
      </div>
    )
  }

  @autobind
  prevMonth () {
    const month = moment(this.state.month).subtract(1, 'month').toDate()
    this.setState({month})
  }

  @autobind
  nextMonth () {
    const month = moment(this.state.month).add(1, 'month').toDate()
    this.setState({month})
  }
}

const CategoryProgress = ({category}: {category: Category.View}) => {
  const max = parseFloat(category.doc.amount as any)
  const expenses = category.doc.amount / 4
  const contributions = category.doc.amount / 3

  const overlay = (
    <Popover id={'popover-category-' + category.doc._id}>
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
            [{date: start, value: account.balance, name: 'initial balance'}]
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
