import * as R from 'ramda'
import * as React from 'react'
import { Grid, Col, Alert, Panel, InputGroup, ButtonToolbar, Button,
  PageHeader, ListGroup, ListGroupItem, ProgressBar } from 'react-bootstrap'
import { injectIntl, FormattedMessage, FormattedNumber, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes, withHandlers, shallowEqual } from 'recompose'
import { ReduxFormProps, FieldArray, reduxForm } from 'redux-form'
import ui, { ReduxUIProps } from 'redux-ui'
import { deleteBudget } from '../../actions'
import { Budget, Category } from '../../docs'
import { AppState, mapDispatchToProps, pushChanges } from '../../state'
import { Validator } from '../../util'
import { withPropChangeCallback } from '../enhancers'
import { SettingsMenu } from './SettingsMenu'
import { typedFields, forms } from './forms'
import { IntlProps, RouteProps } from './props'

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

interface ConnectedProps {
  lang: string
  budgets: Budget.View[]
}

interface DispatchProps {
  pushChanges: pushChanges.Fcn
  deleteBudget: deleteBudget.Fcn
}

interface UIState {
  editing: boolean
}

interface EnhancedProps {
  onSubmit: (values: Values) => void
}

type AllProps = ReduxFormProps<Values> & ReduxUIProps<UIState> & EnhancedProps & ConnectedProps & DispatchProps

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

const enhance = compose<AllProps, {}>(
  setDisplayName('Budget'),
  onlyUpdateForPropTypes,
  setPropTypes({}),
  injectIntl,
  connect<ConnectedProps, DispatchProps, {}>(
    (state: AppState): ConnectedProps => ({
      lang: state.i18n.lang,
      budgets: state.db.current!.view.budgets
    }),
    mapDispatchToProps<DispatchProps>({ pushChanges, deleteBudget })
  ),
  ui<UIState, ConnectedProps & DispatchProps & RouteProps<Budget.Params> & IntlProps, {}>({
    state: {
      editing: false
    } as UIState
  }),
  reduxForm<EnhancedProps & ConnectedProps & DispatchProps & RouteProps<Budget.Params> & IntlProps, Values>({
    form: 'BudgetForm',
    validate: (values, props) => {
      const v = new Validator(values)
      const { intl: { formatMessage } } = props
      v.arrayUnique('budgets', 'name', formatMessage(messages.uniqueBudget))
      for (let i = 0; values.budgets && i < values.budgets.length; i++) {
        const vi = v.arraySubvalidator('budgets', i) as Validator<BudgetValues>
        vi.arrayUnique('categories', 'name', formatMessage(messages.uniqueCategory))
        const budget = values.budgets[i]
        for (let j = 0; budget.categories && j < budget.categories.length; j++) {
          const ci = vi.arraySubvalidator('categories', j)
          ci.numeral('amount', formatMessage(forms.number))
        }
      }
      return v.errors
    }
  }),
  withHandlers<EnhancedProps, ReduxFormProps<Values> & ReduxUIProps<UIState> & ConnectedProps & DispatchProps & IntlProps>({
    onSubmit: (props) => async (values: Values) => {
      const v = new Validator(values)
      const { budgets, updateUI, pushChanges, intl: { formatMessage }, lang } = props
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
          cv.required(['name', 'amount'], formatMessage(forms.required))
        }
      }
      v.maybeThrowSubmissionError()

      if (changes.length) {
        await pushChanges({docs: changes})
      }
      updateUI({editing: false})
    }
  }),
  withPropChangeCallback<EnhancedProps & ReduxFormProps<Values> & ReduxUIProps<UIState> & ConnectedProps & DispatchProps & IntlProps>(
    'budgets',
    (props) => {
      const { budgets, initialize } = props
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
  ),
)

const { TextField } = typedFields<any>()

export const Budgets = enhance((props: AllProps) => {
  const { ui: { editing }, updateUI, budgets } = props

  return (
    <form onSubmit={props.handleSubmit(props.onSubmit)}>
      <div className='form-horizontal container-fluid' style={{paddingBottom: 10}}>

        <PageHeader>
          <SettingsMenu
            items={[
              {
                message: messages.editBudget,
                onClick: () => updateUI({editing: !editing})
              },
            ]}
          />
          <FormattedMessage {...messages.page}/>
        </PageHeader>

        {editing &&
          <FieldArray name='budgets' component={renderBudgets}>
            <Button onClick={() => updateUI({editing: false})}>
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
                  <Col xs={2}>
                    {category.doc.name}
                  </Col>
                  <Col xs={8}>
                    <CategoryProgress category={category}/>
                  </Col>
                  <Col xs={2}>
                    <em className='pull-right'><small>
                      <FormattedNumber value={category.doc.amount} style='currency' currency='USD'/>
                    </small></em>
                  </Col>
                  </Grid>
                </ListGroupItem>
              )}
            </ListGroup>
          </Panel>
        )}
      </div>
    </form>
  )
})

import { OverlayTrigger, Popover } from 'react-bootstrap'

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
