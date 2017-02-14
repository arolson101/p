import autobind = require('autobind-decorator')
import * as numeral from 'numeral'
import * as R from 'ramda'
import * as React from 'react'
import { Row, Grid, Col, Alert, Panel, InputGroup, ButtonToolbar, Button, PageHeader, ListGroup, ListGroupItem } from 'react-bootstrap'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { shallowEqual } from 'recompose'
import { ReduxFormProps, FieldArray, reduxForm } from 'redux-form'
import { deleteBudget } from '../../actions'
import { Bill, Budget, Category } from '../../docs'
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
  categoryAmount: {
    id: 'Budgets.categoryAmount',
    defaultMessage: 'Category budget'
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

interface ConnectedProps {
  lang: string
  budgets: Budget.View[]
}

interface DispatchProps {
  pushChanges: pushChanges.Fcn
  deleteBudget: deleteBudget.Fcn
}

interface State {
  editing: boolean
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
    budgets: state.db.current!.view.budgets
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
export class Budgets extends React.Component<AllProps, State> {
  state: State = {
    editing: false
  }

  render() {
    const { budgets, handleSubmit } = this.props
    const { editing } = this.state

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

          {editing &&
            <FieldArray name='budgets' component={this.renderBudgets}>
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
              <h1>
                {budget.doc.name}
                <span className='pull-right'>
                  <CurrencyDisplay amount={this.budgetTotal(budget)}/>
                </span>
              </h1>
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
                        <Col xs={10}>{category.doc.name}</Col>
                        <Col xs={2}><CurrencyDisplay amount={this.categoryTotal(category)}/></Col>
                      </Row>

                      {category.doc.amount > 0 && category.bills.length > 0 &&
                        <Row>
                          <Col xs={2}></Col>
                          <Col xs={4}><FormattedMessage {...messages.categoryAmount}/></Col>
                          <Col xs={2}>
                            <CurrencyDisplay amount={category.doc.amount}/>
                          </Col>
                        </Row>
                      }

                      {category.bills.map(bill =>
                        <Row key={bill.doc._id}>
                          <Col xs={4} xsOffset={2}>
                            <Link to={Bill.to.edit(bill.doc)}>
                              <Favico value={bill.doc.favicon}/>
                              {' '}
                              {bill.doc.name}
                            </Link>
                          </Col>
                          <Col xs={2}>
                            <CurrencyDisplay amount={bill.doc.amount}/>
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

  @autobind
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
              ...bc,
              amount: numeral(bc.amount).value()
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

    this.setState({editing: false})
  }

  budgetTotal(budget: Budget.View): number {
    return budget.categories.reduce((val, category) => val + this.categoryTotal(category), 0)
  }

  categoryTotal(category: Category.View): number {
    return category.bills.reduce((val, bill) => val + bill.doc.amount, category.doc.amount)
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
  renderBudgets({ children, fields, meta: { error } }: any) {
    const { intl: { formatMessage } } = this.props
    return (
      <div>
        {error &&
          <Alert bsStyle='danger'>{error}</Alert>
        }
        {fields.map((budget: string, index: number) =>
          <FieldArray
            key={`${budget}.categories`}
            name={`${budget}.categories`}
            component={this.renderCategories}
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
  }

  @autobind
  renderCategories({ name, fields, children, meta: { error } }: any) {
    const { intl: { formatMessage } } = this.props
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
  }
}
