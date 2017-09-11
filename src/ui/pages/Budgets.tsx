import * as numeral from 'numeral'
import * as R from 'ramda'
import * as React from 'react'
import { Row, Grid, Col, Alert, Panel, InputGroup, ButtonToolbar, Button, PageHeader, ListGroup, ListGroupItem } from 'react-bootstrap'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { SortableContainer, SortableElement } from 'react-sortable-hoc'
import { compose, withHandlers, withState, shallowEqual } from 'recompose'
import { InjectedFormProps, FieldArray, FieldsProps, reduxForm, Fields } from 'redux-form'
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

interface Handlers {
  toggleEdit: () => void
}

type EnhancedProps = Handlers & InjectedFormProps<Values, {}> & ConnectedProps & DispatchProps & IntlProps & StateProps

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

const { Form, TextField } = typedFields<any>()

const enhance = compose<EnhancedProps, undefined>(
  injectIntl,
  connect<ConnectedProps, DispatchProps, IntlProps>(
    (state: AppState): ConnectedProps => ({
      budgets: selectBudgets(state),
      categoryCache: state.views.categories
    }),
    mapDispatchToProps<DispatchProps>({ pushChanges, deleteBudget, showBillDialog })
  ),
  withState('editing', 'setEditing', false),
  reduxForm<Values, StateProps & ConnectedProps & DispatchProps & IntlProps>({
    form: 'BudgetForm',
    validate: (values, props: any) => {
      const { intl: { formatMessage } } = props
      const v = new Validator(values, formatMessage)
      v.arrayUnique('budgets', 'name', messages.uniqueBudget)
      for (let i = 0; values.budgets && i < values.budgets.length; i++) {
        const vi = v.arraySubvalidator<BudgetValues>('budgets', i)
        vi.arrayUnique('categories', 'name', formatMessage(messages.uniqueCategory))
        const budget = values.budgets[i]
        for (let j = 0; budget && budget.categories && j < budget.categories.length; j++) {
          const ci = vi.arraySubvalidator<Category>('categories', j)
          ci.numeral('amount')
        }
      }
      return v.errors
    },
    onSubmit: async (values: Values, dispatch, props) => {
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
    }
  }),
  withHandlers<InjectedFormProps<Values, {}> & StateProps & ConnectedProps & DispatchProps & IntlProps, Handlers>({
    toggleEdit: ({budgets, categoryCache, initialize, setEditing, editing}) => () => {
      editing = !editing
      if (editing) {
        const values: Values = {
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
        initialize!(values)
      }
      setEditing(editing)
    }
  })
)

export const Budgets = enhance(props => {
  const { budgets, categoryCache, handleSubmit, editing, toggleEdit, showBillDialog } = props

  return (
    <Form onSubmit={handleSubmit}>
      <div className='form-horizontal container-fluid' style={{paddingBottom: 10}}>

        <PageHeader>
          <SettingsMenu
            items={[
              {
                message: messages.editBudget,
                onClick: toggleEdit
              },
            ]}
          />
          <FormattedMessage {...messages.page}/>
        </PageHeader>

        {editing &&
          <FieldArray name='budgets' component={editBudgetList} {...{intl: props.intl}}>
            <Button onClick={toggleEdit}>
              <FormattedMessage {...forms.cancel}/>
            </Button>
            <Button type='submit' bsStyle='primary'>
              <FormattedMessage {...forms.save}/>
            </Button>
          </FieldArray>
        }

        {!editing && budgets.map(budget =>
          <BudgetDisplay
            key={budget.doc._id}
            budget={budget}
            showBillDialog={showBillDialog}
          />
        )}
      </div>
    </Form>
  )
})

const editBudgetList = (props: any) => {
  const { children, fields, meta: { error }, intl } = props
  return (
    <div>
      {error &&
        <Alert bsStyle='danger'>{error}</Alert>
      }
      <SortableBudgetList
        lockAxis='y'
        helperClass='sortableHelper'
        fields={fields}
        intl={intl}
        onSortEnd={(sort) => {
          fields.move(sort.oldIndex, sort.newIndex)
        }}
      />
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

const SortableBudgetList = SortableContainer(({fields, intl}: {fields: FieldsProps<any>} & IntlProps) =>
  <div>
    {fields.map((budget: string, index: number) =>
      <SortableCategoryList
        key={`${budget}.categories`}
        index={index}
        budget={budget}
        onRemove={() => fields.remove(index)}
        intl={intl}
      />
    )}
  </div>
)

interface SortableCategoryListProps {
  budget: string
  onRemove: () => void
}
const SortableCategoryList = SortableElement(({budget, onRemove, intl}: SortableCategoryListProps & IntlProps) =>
  <FieldArray
    name={`${budget}.categories`}
    component={editCategories}
    {...{intl}}
  >
    <TextField
      name={`${budget}.name`}
      label={messages.budget}
      addonAfter={
        <InputGroup.Button>
          <Button bsStyle='danger' onClick={onRemove}>
            <i className='fa fa-trash-o fa-lg'/>
          </Button>
        </InputGroup.Button>
      }
    />
  </FieldArray>
)

const editCategories = (props: any & IntlProps) => {
  const { fields, children, meta: { error }, intl } = props
  return (
    <Panel header={children}>
      <SortableCategoriesList
        helperClass='sortableHelper'
        lockToContainerEdges
        lockAxis='y'
        error={error}
        fields={fields}
        intl={intl}
        onSortEnd={(sort) => {
          fields.move(sort.oldIndex, sort.newIndex)
        }}
      />
      <ButtonToolbar>
        <Button onClick={() => fields.push()}><i className='fa fa-plus'/> add category</Button>
      </ButtonToolbar>
    </Panel>
  )
}

const SortableCategoriesList = SortableContainer(({error, fields, intl}: {error?: string, fields: FieldsProps<any>} & IntlProps) =>
  <ListGroup fill>
    {fields.map((category: string, index: number) =>
      <SortableCategory
        key={category}
        index={index}
        category={category}
        intl={intl}
        onRemove={() => fields.remove(index)}
      />
    )}
    {error &&
      <ListGroupItem>
        <Alert bsStyle='danger'>{error}</Alert>
      </ListGroupItem>
    }
  </ListGroup>
)

type SortableCategoryProps = IntlProps & {
  category: string
  onRemove (): void
}
const SortableCategory = SortableElement(({category, onRemove, intl: { formatMessage }}: SortableCategoryProps) =>
  <ListGroupItem key={category}>
    <TextField
      name={`${category}.name`}
      label={messages.category}
      addonAfter={
        <InputGroup.Button>
          <Button bsStyle='danger' onClick={onRemove}>
            <i className='fa fa-minus'/>
          </Button>
        </InputGroup.Button>
      }
    />
    <TextField
      name={`${category}.amount`}
      label={messages.targetAmount}
    />
  </ListGroupItem>
)

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
)(props => {
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
