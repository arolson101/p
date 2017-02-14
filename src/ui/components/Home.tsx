import autobind = require('autobind-decorator')
import * as moment from 'moment'
import * as R from 'ramda'
import * as React from 'react'
import { Row, OverlayTrigger, Popover, Grid, Col, Alert, Panel, InputGroup, ButtonToolbar, Button,
  PageHeader, ListGroup, ListGroupItem, ProgressBar } from 'react-bootstrap'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { AutoSizer } from 'react-virtualized'
import { shallowEqual } from 'recompose'
import { ReduxFormProps, FieldArray, reduxForm } from 'redux-form'
import { createSelector } from 'reselect'
import { VictoryChart, VictoryLine, VictoryTheme, VictoryAxis, VictoryStack, VictoryGroup, VictoryVoronoiTooltip } from 'victory'
import { deleteBudget } from '../../actions'
import { Bank, Bill, Account, Budget, Category } from '../../docs'
import { AppState, mapDispatchToProps, pushChanges } from '../../state'
import { Validator } from '../../util'
import { CurrencyDisplay } from './CurrencyDisplay'
import { SettingsMenu } from './SettingsMenu'
import { typedFields, forms } from './forms'
import { Favico } from './forms/Favico'
import { IntlProps } from './props'

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
  },
  editBudget: {
    id: 'Budgets.editBudget',
    defaultMessage: 'Edit'
  },
  budget: {
    id: 'Budgets.budget',
    defaultMessage: 'Budget'
  },
  frequency: {
    id: 'Budgets.frequency',
    defaultMessage: 'Frequency'
  },
  category: {
    id: 'Budgets.category',
    defaultMessage: 'Category'
  },
  targetAmount: {
    id: 'Budgets.targetAmount',
    defaultMessage: 'Amount'
  },
  uniqueBudget: {
    id: 'Budgets.uniqueBudget',
    defaultMessage: 'Budget name already used'
  },
  uniqueCategory: {
    id: 'Budgets.uniqueCategory',
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
  editing?: boolean
  month?: Date
}

type AllProps = ReduxFormProps<Values> & ConnectedProps & DispatchProps & IntlProps

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

const { TextField } = typedFields<any>()

@injectIntl
@(connect<ConnectedProps, DispatchProps, IntlProps>(
  (state: AppState): ConnectedProps => ({
    lang: state.i18n.lang,
    budgets: state.db.current!.view.budgets,
    data: selectAccountData(state)
  }),
  mapDispatchToProps<DispatchProps>({ pushChanges, deleteBudget })
) as any)
@(reduxForm<AllProps, Values>({
  form: 'BudgetForm',
  validate: (values, props) => {
    const v = new Validator(values)
    const { intl: { formatMessage } } = props
    v.arrayUnique('budgets', 'name', formatMessage(messages.uniqueBudget))
    for (let i = 0; values.budgets && i < values.budgets.length; i++) {
      const vi = v.arraySubvalidator('budgets', i) as Validator<BudgetValues>
      vi.arrayUnique('categories', 'name', formatMessage(messages.uniqueCategory))
      const budget = values.budgets[i]
      for (let j = 0; budget && budget.categories && j < budget.categories.length; j++) {
        const ci = vi.arraySubvalidator('categories', j)
        ci.numeral('amount', formatMessage(forms.number))
      }
    }
    return v.errors
  }
}) as any)
export class Home extends React.Component<AllProps, State> {
  state: State = {
    editing: false,
    month: new Date()
  }

  render() {
    const { budgets, handleSubmit, data, intl: { formatDate, formatNumber } } = this.props
    const { editing, month } = this.state

    return (
      <form onSubmit={handleSubmit(this.onSubmit)}>
        <div className='form-horizontal container-fluid' style={{paddingBottom: 10}}>

          <PageHeader>
            <SettingsMenu
              items={[
                {
                  message: messages.editBudget,
                  onClick: this.toggleEdit
                },
              ]}
            />
            <FormattedMessage {...messages.page}/>
          </PageHeader>

          <AutoSizer disableHeight>
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
          </AutoSizer>

          <h3>
            {moment(month).format('MMMM YYYY')}
            <ButtonToolbar className='pull-right'>
              <Button bsStyle='link' onClick={this.prevMonth}><i className='fa fa-caret-left'/></Button>
              <Button bsStyle='link' onClick={this.nextMonth}><i className='fa fa-caret-right'/></Button>
            </ButtonToolbar>
          </h3>

          {editing &&
            <FieldArray name='budgets' component={renderBudgets}>
              <Button onClick={this.toggleEdit}>
                <FormattedMessage {...forms.cancel}/>
              </Button>
              <Button type='submit' bsStyle='primary'>
                <FormattedMessage {...forms.save}/>
              </Button>
            </FieldArray>
          }

          {!editing && budgets.map(budget =>
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
      </form>
    )
  }

  async onSubmit(values: Values) {
    const v = new Validator(values)
    const { budgets, pushChanges, intl: { formatMessage }, lang } = this.props
    const changes: AnyDocument[] = []

    for (let i = 0; values.budgets && i < values.budgets.length; i++) {
      const bv = v.arraySubvalidator('budgets', i) as Validator<BudgetValues>
      bv.required(['name'], formatMessage(forms.required))
      const bvalues = values.budgets[i]
      if (bvalues) {
        const lastBudget = budgets.find(budget => budget.doc._id === bvalues._id)
        let nextBudget = lastBudget
          ? lastBudget.doc
          : Budget.doc({name: bvalues.name, categories: []}, lang)

        nextBudget = {
          ...nextBudget,
          name: bvalues.name
        }

        const categories = bvalues.categories.map(bc => {
          if (!bc) {
            return '' as Category.DocId
          }
          if (bc._id && lastBudget) {
            const existingCategory = lastBudget.categories.find(cat => cat.doc._id === bc._id)
            if (!existingCategory) {
              throw new Error('existing category id ' + bc._id + ' not found')
            }
            const nextCategory = {
              ...existingCategory.doc,
              ...bc
            }
            if (!shallowEqual(existingCategory, nextCategory)) {
              changes.push(nextCategory)
            }
            return existingCategory.doc._id
          } else {
            const newCategory = Category.doc(nextBudget, {name: bc.name, amount: bc.amount}, lang)
            changes.push(newCategory)
            return newCategory._id
          }
        })

        if (!R.equals(categories, nextBudget.categories)) {
          nextBudget = { ...nextBudget, categories }
        }

        if (!lastBudget || !shallowEqual(lastBudget.doc, nextBudget)) {
          changes.push(nextBudget)
        }
      }
      const categories = values.budgets[i].categories
      for (let c = 0; categories && c < categories.length; c++) {
        const cv = bv.arraySubvalidator('categories', c)
        cv.required(['name'], formatMessage(forms.required))
      }
    }
    v.maybeThrowSubmissionError()

    if (changes.length) {
      await pushChanges({docs: changes})
    }
  }

  @autobind
  toggleEdit() {
    const editing = !this.state.editing
    if (editing) {
      const { budgets, initialize } = this.props
      const values: Values = {
        budgets: budgets.map((budget): BudgetValues => ({
          name: budget.doc.name,
          _id: budget.doc._id,
          categories: budget.categories.map((category): CategoryValues => ({
            name: category.doc.name,
            _id: category.doc._id,
            amount: category.doc.amount
          }))
        }))
      }
      initialize(values, false)
    }
    this.setState({editing})
  }

  @autobind
  prevMonth() {
    const month = moment(this.state.month).subtract(1, 'month').toDate()
    this.setState({month})
  }

  @autobind
  nextMonth() {
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

const renderBudgets = injectIntl((props: any) => {
  const { children, fields, meta: { error }, intl: { formatMessage } } = props
  return (
    <div>
      {error &&
        <Alert bsStyle='danger'>{error}</Alert>
      }
      {fields.map((budget: string, index: number) =>
        <FieldArray
          key={`${budget}.categories`}
          name={`${budget}.categories`}
          component={renderCategories}
        >
          <TextField
            name={`${budget}.name`}
            label={formatMessage(messages.budget)}
            addonAfter={
              <InputGroup.Button>
                <Button bsStyle='danger' onClick={() => fields.remove(index)}>
                  <i className='fa fa-trash-o fa-lg'/>
                </Button>
              </InputGroup.Button>
            }
          />
          {/*<TextField
            name={`${budget}.frequency`}
            label={formatMessage(messages.frequency)}
          />*/}
        </FieldArray>
      )}
      <Button onClick={() => fields.push()}>
        <i className={Budget.icon}/>
        {' '}
        <FormattedMessage {...messages.addBudget}/>
      </Button>
      <ButtonToolbar className='pull-right'>
        {children}
      </ButtonToolbar>
    </div>
  )
})

const renderCategories = injectIntl((props: any) => {
  const { name, fields, children, meta: { error }, intl: { formatMessage } } = props
  return (
    <Panel key={name} header={children}>
      <ListGroup fill>
        {fields.map((category: string, index: number) =>
          <ListGroupItem key={category}>
            <TextField
              name={`${category}.name`}
              label={formatMessage(messages.category)}
              addonAfter={
                <InputGroup.Button>
                  <Button bsStyle='danger' onClick={() => fields.remove(index)}>
                    <i className='fa fa-minus'/>
                  </Button>
                </InputGroup.Button>
              }
            />
            <TextField
              name={`${category}.amount`}
              label={formatMessage(messages.targetAmount)}
            />
          </ListGroupItem>
        )}
        {error &&
          <ListGroupItem>
            <Alert bsStyle='danger'>{error}</Alert>
          </ListGroupItem>
        }
      </ListGroup>
      <ButtonToolbar>
        <Button onClick={() => fields.push()}><i className='fa fa-plus'/> add category</Button>
      </ButtonToolbar>
    </Panel>
  )
})


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
