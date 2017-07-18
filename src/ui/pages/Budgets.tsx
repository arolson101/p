import * as numeral from 'numeral'
import * as R from 'ramda'
import * as React from 'react'
import { Row, Grid, Col, Alert, Panel, InputGroup, ButtonToolbar, Button, PageHeader, ListGroup, ListGroupItem } from 'react-bootstrap'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { SortableContainer, SortableElement } from 'react-sortable-hoc'
import { compose, withHandlers, withState, shallowEqual } from 'recompose'
import { FormProps, FieldArray, FieldsProps, reduxForm, Fields } from 'redux-form'
import { deleteBudget } from '../../actions/index'
import { Bill, Budget, Category } from '../../docs/index'
import { selectBudgetViews } from '../../selectors'
import { AppState, mapDispatchToProps, pushChanges } from '../../state/index'
import { Validator } from '../../util/index'
import { showBillDialog } from '../dialogs/index'
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

type EnhancedProps = Handlers & FormProps<Values, {}, {}> & ConnectedProps & DispatchProps & IntlProps & StateProps

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

const { Form, TextField } = typedFields<any>()

const enhance = compose<EnhancedProps, undefined>(
  injectIntl,
  connect<ConnectedProps, DispatchProps, IntlProps>(
    (state: AppState): ConnectedProps => ({
      budgets: selectBudgetViews(state)
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
    onSubmit: async (values, dispatch, props) => {
      const { budgets, pushChanges, setEditing, intl: { formatMessage } } = props
      const v = new Validator(values, formatMessage)
      const changes: AnyDocument[] = []

      // TODO: delete removed category/budget docs

      for (let i = 0; values.budgets && i < values.budgets.length; i++) {
        const bv = v.arraySubvalidator<BudgetValues>('budgets', i)
        bv.required('name')
        const bvalues = values.budgets[i]
        if (bvalues) {
          const lastBudget = budgets.find(budget => budget.doc._id === bvalues._id)
          let nextBudget = lastBudget
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
              const existingCategory = lastBudget.categories.find(cat => cat.doc._id === bc._id)
              if (!existingCategory) {
                throw new Error('existing category id ' + bc._id + ' not found')
              }
              const nextCategory = {
                ...existingCategory.doc,
                ...bc,
                amount
              }
              if (!shallowEqual(existingCategory, nextCategory)) {
                changes.push(nextCategory)
              }
              return existingCategory.doc._id
            } else {
              const newCategory = Category.doc(nextBudget, {name: bc.name, amount})
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
  withHandlers<Handlers, FormProps<Values, {}, {}> & StateProps & ConnectedProps & DispatchProps & IntlProps>({
    toggleEdit: ({budgets, initialize, setEditing, editing}) => () => {
      editing = !editing
      if (editing) {
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
        initialize!(values)
      }
      setEditing(editing)
    }
  })
)

export const Budgets = enhance(props => {
  const { budgets, handleSubmit, editing, toggleEdit, showBillDialog } = props

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
          <FieldArray name='budgets' component={editBudgetList} intl={props.intl}>
            <Button onClick={toggleEdit}>
              <FormattedMessage {...forms.cancel}/>
            </Button>
            <Button type='submit' bsStyle='primary'>
              <FormattedMessage {...forms.save}/>
            </Button>
          </FieldArray>
        }

        {!editing && budgets.map(budget =>
          <BudgetDisplay key={budget.doc._id} budget={budget} showBillDialog={showBillDialog}/>
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
    intl={intl}
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

const budgetTotal = (budget: Budget.View): number => {
  return budget.categories.reduce((val, category) => val + categoryTotal(category), 0)
}

const categoryTotal = (category: Category.View): number => {
  return category.bills.reduce((val, bill) => val + bill.doc.amount, category.doc.amount)
}

const BudgetDisplay = ({budget, showBillDialog}: { budget: Budget.View, showBillDialog: showBillDialogType }) => (
  <Panel header={
    <h1>
      {budget.doc.name}
      <span className='pull-right'>
        <CurrencyDisplay amount={budgetTotal(budget)}/>
      </span>
    </h1>
  }>
    <ListGroup fill>
      {budget.categories.length === 0 &&
        <ListGroupItem>
          <small><em>no categories</em></small>
        </ListGroupItem>
      }
      {budget.categories.map((category, index) =>
        <CategoryDisplay key={category.doc._id} category={category} showBillDialog={showBillDialog}/>
      )}
    </ListGroup>
  </Panel>
)

const CategoryDisplay = ({category, showBillDialog}: { category: Category.View, showBillDialog: showBillDialogType }) => (
  <ListGroupItem>
    <Grid fluid>
      <Row>
        <Col xs={10}>{category.doc.name}</Col>
        <Col xs={2}><CurrencyDisplay amount={categoryTotal(category)}/></Col>
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
)