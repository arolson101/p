import * as numeral from 'numeral'
import * as R from 'ramda'
import * as React from 'react'
import { Row, Grid, Col, Alert, Panel, InputGroup, ButtonToolbar, Button, PageHeader, ListGroup, ListGroupItem } from 'react-bootstrap'
import { FormAPI, FieldSpec } from 'react-form'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { SortableContainer, SortableElement } from 'react-sortable-hoc'
import { compose, withState, shallowEqual } from 'recompose'
import { deleteBudget } from 'core/actions'
import { Bill, Budget, Category } from 'core/docs'
import { selectBudgets, selectCategories, selectBills, selectBillsForCategory, selectCategoriesForBudget } from 'core/selectors'
import { AppState, mapDispatchToProps, pushChanges, Cache } from 'core/state'
import { Validator } from 'util/index'
import { showBillDialog } from '../dialogs'
import { CurrencyDisplay } from '../components/CurrencyDisplay'
import { SettingsMenu } from '../components/SettingsMenu'
import { typedFields, forms } from '../components/forms'
import { Favico } from '../components/Favico'

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

type showBillDialogType = typeof showBillDialog

interface ConnectedProps {
  budgets: Budget.View[]
  categoryCache: Cache<Category.View>
}

interface DispatchProps {
  pushChanges: pushChanges.Fcn
  deleteBudget: deleteBudget.Fcn
  showBillDialog: showBillDialogType
}

interface StateProps {
  editing: boolean
  setEditing: (editing: boolean) => void
}

type EnhancedProps = ConnectedProps & DispatchProps & IntlProps & StateProps

interface CategoryValues {
  _id: Category.DocId
  name: string
  amount: number
}

interface BudgetValues {
  _id: Budget.DocId
  name: string
  categories: CategoryValues[]
}

interface Values {
  budgets: BudgetValues[]
}

const enhance = compose<EnhancedProps, {}>(
  injectIntl,
  connect<ConnectedProps, DispatchProps, IntlProps>(
    (state: AppState): ConnectedProps => ({
      budgets: selectBudgets(state),
      categoryCache: state.views.categories
    }),
    mapDispatchToProps<DispatchProps>({ pushChanges, deleteBudget, showBillDialog })
  ),
  withState('editing', 'setEditing', false)
)

export namespace Budgets {
  export type Props = {}
}
export const Budgets = enhance(props => {
  const { budgets, categoryCache, editing, setEditing, showBillDialog } = props
  const { Form2 } = typedFields<Values>()

  let defaultValues: Partial<Values> = {}
  if (editing) {
    defaultValues = {
      budgets: budgets.map((budget): BudgetValues => ({
        name: budget.doc.name,
        _id: budget.doc._id,
        categories: budget.doc.categories
          .map(categoryId => categoryCache[categoryId])
          .filter(category => !!category)
          .map((category): CategoryValues => ({
            name: category.doc.name,
            _id: category.doc._id,
            amount: category.doc.amount
          }))
      }))
    }
  }

  return (
    <Form2
      defaultValues={defaultValues}
      validate={(values: Values) => {
        const { intl: { formatMessage } } = props
        const v = new Validator(values, formatMessage)
        v.arrayUnique('budgets', 'name', messages.uniqueBudget)
        for (let i = 0; values.budgets && i < values.budgets.length; i++) {
          const vi = v.arraySubvalidator<BudgetValues>('budgets', i)
          vi.arrayUnique('categories', 'name', messages.uniqueCategory)
          const budget = values.budgets[i]
          for (let j = 0; budget && budget.categories && j < budget.categories.length; j++) {
            const ci = vi.arraySubvalidator<Category>('categories', j)
            ci.numeral('amount')
          }
        }
        return v.errors
      }}
      onSubmit={async (values: Values, state, api, instance) => {
        const { budgets, pushChanges, setEditing, categoryCache, intl: { formatMessage } } = props
        const v = new Validator(values, formatMessage)
        const changes: AnyDocument[] = []

        // TODO: delete removed category/budget docs

        for (let i = 0; values.budgets && i < values.budgets.length; i++) {
          const bv = v.arraySubvalidator<BudgetValues>('budgets', i)
          bv.required('name')
          const bvalues = values.budgets[i]
          if (bvalues) {
            const lastBudget = budgets.find(budget => budget.doc._id === bvalues._id)
            let nextBudget: Budget.Doc = lastBudget
              ? lastBudget.doc
              : Budget.doc({name: bvalues.name, categories: [], sortOrder: i})

            nextBudget = {
              ...nextBudget,
              name: bvalues.name,
              sortOrder: i
            }

            const categories = (bvalues.categories || []).map(bc => {
              const amount = numeral(bc.amount).value() || 0
              if (!bc) {
                return '' as Category.DocId
              }
              if (bc._id && lastBudget) {
                const existingCategory: Category.Doc | undefined = categoryCache[bc._id] && categoryCache[bc._id].doc
                if (!existingCategory) {
                  throw new Error('existing category id ' + bc._id + ' not found')
                }
                const nextCategory: Category.Doc = {
                  ...existingCategory,
                  ...bc,
                  amount
                }
                if (!shallowEqual(existingCategory, nextCategory)) {
                  changes.push(nextCategory)
                }
                return existingCategory._id
              } else {
                const newCategory = Category.doc(nextBudget, {name: bc.name, amount})
                changes.push(newCategory)
                return newCategory._id
              }
            })

            if (!R.equals(categories, nextBudget.categories)) {
              nextBudget = { ...nextBudget, categories }
            }

            if (!lastBudget || !shallowEqual(lastBudget, nextBudget)) {
              changes.push(nextBudget)
            }
          }
          const categories = values.budgets[i].categories
          for (let c = 0; categories && c < categories.length; c++) {
            const cv = bv.arraySubvalidator<Category>('categories', c)
            cv.required('name')
          }
        }
        v.maybeThrowSubmissionError()

        if (changes.length) {
          await pushChanges({docs: changes})
        }

        setEditing(false)
      }}
    >
      {api => {
        const field = ['budgets']
        const error = api.getError(field)
        return (
          <div className='form-horizontal container-fluid' style={{paddingBottom: 10}}>
            <PageHeader>
              <SettingsMenu
                items={[
                  {
                    message: messages.editBudget,
                    onClick: () => setEditing(!editing)
                  },
                ]}
              />
              <FormattedMessage {...messages.page}/>
            </PageHeader>

            {editing &&
              <div>
                {error &&
                  <Alert bsStyle='danger'>{error}</Alert>
                }
                <SortableBudgetList
                  lockAxis='y'
                  helperClass='sortableHelper'
                  budgets={api.values.budgets}
                  field={field}
                  onSortEnd={(sort) => api.swapValues(field, sort.oldIndex, sort.newIndex)}
                  api={api}
                />
                <Button onClick={() => api.addValue<Partial<Budget>>(field, {})}>
                  <i className={Budget.icon}/>
                  {' '}
                  <FormattedMessage {...messages.addBudget}/>
                </Button>
                <ButtonToolbar className='pull-right'>
                  <Button onClick={() => setEditing(false)}>
                    <FormattedMessage {...forms.cancel}/>
                  </Button>
                  <Button type='submit' bsStyle='primary'>
                    <FormattedMessage {...forms.save}/>
                  </Button>
                </ButtonToolbar>
              </div>
            }

            {!editing && budgets.map(budget =>
              <BudgetDisplay
                key={budget.doc._id}
                budget={budget}
                showBillDialog={showBillDialog}
              />
            )}
          </div>
        )
      }}
    </Form2>
  )
})

interface SortableBudgetListProps {
  field: FieldSpec
  budgets: BudgetValues[]
  api: FormAPI<Values>
}
const SortableBudgetList = SortableContainer<SortableBudgetListProps>(({budgets, field, api}) =>
  <div>
    {budgets.map((budget, index: number) =>
      <SortableCategoryList
        key={budget._id}
        index={index}
        budget={budget}
        field={field}
        api={api}
      />
    )}
  </div>
)

interface SortableCategoryListProps {
  field: FieldSpec
  index: number
  budget: BudgetValues
  api: FormAPI<Values>
}
const SortableCategoryList = SortableElement<SortableCategoryListProps>(({budget, field, index, api}): any => {
  const { TextField2 } = typedFields<Budget>()
  return budget.categories.map((category, categoryIdx) => {
    const header = (
      <TextField2
        name={[field, index, 'name'] as any}
        label={messages.budget}
        addonAfter={
          <InputGroup.Button>
            <Button bsStyle='danger' onClick={() => api.removeValue(field, index)}>
              <i className='fa fa-trash-o fa-lg'/>
            </Button>
          </InputGroup.Button>
        }
      />
    )
    return (
      <Panel header={header}>
        <SortableCategoriesList
          helperClass='sortableHelper'
          lockToContainerEdges
          lockAxis='y'
          categories={budget.categories}
          field={[...field, index]}
          onSortEnd={(sort) => api.swapValues([...field, index], sort.oldIndex, sort.newIndex)}
          api={api}
        />
        <ButtonToolbar>
          <Button onClick={() => api.addValue([...field, index], {})}>
            <i className='fa fa-plus'/> add category
          </Button>
        </ButtonToolbar>
      </Panel>
    )
  })
})

interface SortableCategoriesListProps {
  categories: CategoryValues[]
  api: FormAPI<Values>
  field: FieldSpec
}
const SortableCategoriesList = SortableContainer<SortableCategoriesListProps>(({api, categories, field}) => {
  const error = api.getError(field)
  return <ListGroup fill>
    {categories.map((category, index) =>
      <SortableCategory
        key={category.name}
        index={index}
        category={category}
        field={field}
        api={api}
      />
    )}
    {error &&
      <ListGroupItem>
        <Alert bsStyle='danger'>{error}</Alert>
      </ListGroupItem>
    }
  </ListGroup>
})

interface SortableCategoryProps {
  category: CategoryValues
  api: FormAPI<Values>
  field: FieldSpec
  index: number
}
const SortableCategory = SortableElement<SortableCategoryProps>(({category, api, field, index}) => {
  const { TextField2 } = typedFields<CategoryValues>()
  return (
    <ListGroupItem>
      <TextField2
        name={[...field, index, 'name'] as any}
        label={messages.category}
        addonAfter={
          <InputGroup.Button>
            <Button bsStyle='danger' onClick={() => api.removeValue(field, index)}>
              <i className='fa fa-minus'/>
            </Button>
          </InputGroup.Button>
        }
      />
      <TextField2
        name={[...field, index, 'amount'] as any}
        label={messages.targetAmount}
      />
    </ListGroupItem>
  )
})

const budgetTotal = (categories: Category.View[], allBills: Bill.View[]): number => {
  return categories.reduce((val, category) => val + categoryTotal(category, allBills), 0)
}

const categoryTotal = (category: Category.View, allBills: Bill.View[]): number => {
  return allBills
    .filter(bill => bill.doc.category === category.doc._id)
    .reduce((val, bill) => val + bill.doc.amount, category.doc.amount)
}

const BudgetDisplay = connect(
  (state: AppState, props: { budget: Budget.View, showBillDialog: showBillDialogType }) => ({
    categories: selectCategoriesForBudget(state, props.budget.doc._id),
    allBills: selectBills(state),
    showBillDialog: props.showBillDialog,
    budget: props.budget
  })
)((props) => {
  const { budget, categories, allBills, showBillDialog } = props
  return <Panel header={
    <h1>
      {budget.doc.name}
      <span className='pull-right'>
        <CurrencyDisplay amount={budgetTotal(categories, allBills)}/>
      </span>
    </h1>
  }>
    <ListGroup fill>
      {budget.doc.categories.length === 0 &&
        <ListGroupItem>
          <small><em>no categories</em></small>
        </ListGroupItem>
      }
      {categories.map((category, index) =>
        <CategoryDisplay key={category.doc._id} category={category} showBillDialog={showBillDialog}/>
      )}
    </ListGroup>
  </Panel>
})

const CategoryDisplay = connect(
  (state: AppState, props: { category: Category.View, showBillDialog: showBillDialogType }) => ({
    bills: selectBillsForCategory(state, props.category.doc._id),
    category: props.category,
    showBillDialog: props.showBillDialog
  })
)(props => {
  const { bills, category, showBillDialog } = props
  return <ListGroupItem>
    <Grid fluid>
      <Row>
        <Col xs={10}>{category.doc.name}</Col>
        <Col xs={2}><CurrencyDisplay amount={categoryTotal(category, bills)}/></Col>
      </Row>

      {category.doc.amount > 0 && bills.length > 0 &&
        <Row>
          <Col xs={2}></Col>
          <Col xs={4}><FormattedMessage {...messages.categoryAmount}/></Col>
          <Col xs={2}>
            <CurrencyDisplay amount={category.doc.amount}/>
          </Col>
        </Row>
      }

      {bills.map(bill =>
        <Row key={bill.doc._id}>
          <Col xs={4} xsOffset={2}>
            {/*<Link to={Bill.to.edit(bill.doc)}>*/}
            <Link to={''} onClick={(e) => {
              e.preventDefault()
              showBillDialog({edit: bill})
            }}>
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
})
