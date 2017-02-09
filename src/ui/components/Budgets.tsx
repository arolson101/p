import * as React from 'react'
import { Alert, Panel, FormControl, ButtonToolbar, HelpBlock, Button, PageHeader, ListGroup, ListGroupItem } from 'react-bootstrap'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes, withHandlers, withState } from 'recompose'
import { ReduxFormProps, InjectedFieldProps, Field, FieldArray, FieldArrayErrors, reduxForm } from 'redux-form'
import { deleteBudget } from '../../actions'
import { Budget } from '../../docs'
import { AppState, mapDispatchToProps, pushChanges } from '../../state'
import { Validator } from '../../util'
import { withPropChangeCallback } from '../enhancers'
import { SettingsMenu } from './SettingsMenu'
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
})

interface ConnectedProps {
  budgets: Budget.View[]
}

interface DispatchProps {
  pushChanges: pushChanges.Fcn
  deleteBudget: deleteBudget.Fcn
}

interface EnhancedProps {
  editing: boolean
  setEditing: (editing: boolean) => void
  onSubmit: (values: Values) => void
}

type AllProps = ReduxFormProps<Values> & EnhancedProps & ConnectedProps

interface CategoryValues {
  name: string
  id: string
}

interface BudgetValues {
  name: string
  id: string
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
  connect<ConnectedProps, {}, {}>(
    (state: AppState): ConnectedProps => ({
      budgets: state.db.current!.view.budgets
    }),
    mapDispatchToProps<DispatchProps>({ pushChanges, deleteBudget })
  ),
  reduxForm<EnhancedProps & DispatchProps & RouteProps<Budget.Params> & IntlProps, Values>({
    form: 'BudgetForm',
    destroyOnUnmount: false,
    validate: (values, props) => {
      const v = new Validator(values)
      const { intl: { formatMessage } } = props
      // v.unique('name', otherNames, formatMessage(messages.uniqueName))
      v.errors.budgets = {} as FieldArrayErrors
      (v.errors.budgets as any)[0] = {name: 'asdf'}
      // v.errors.budgets[0].name = 'asdf'
      return v.errors
    }
  }),
  withState('editing', 'setEditing', false),
  withHandlers<EnhancedProps, ReduxFormProps<Values> & EnhancedProps & ConnectedProps & IntlProps>({
    onSubmit: (props) => (values: Values) => {
      console.log(values)
    }
  }),
  withPropChangeCallback<ReduxFormProps<Values> & EnhancedProps & ConnectedProps & IntlProps>(
    'budgets',
    (props) => {
      const { budgets, initialize } = props
      const values: Values = {
        budgets: budgets.map((budget): BudgetValues => ({
          name: budget.doc.name,
          id: budget.doc._id,
          categories: budget.categories.map((category): CategoryValues => ({
            name: category.doc.name,
            id: category.doc._id
          }))
        }))
      }
      console.log('init', values)
      initialize(values, false)
    }
  ),
)

export const Budgets = enhance((props: AllProps) => {
  const { editing, budgets } = props

  return (
    <form onSubmit={props.handleSubmit(props.onSubmit)}>
      <div className='form-horizontal container-fluid' style={{paddingBottom: 10}}>

        <PageHeader>
          <SettingsMenu
            items={[
              {
                message: messages.editBudget,
                onClick: () => props.setEditing(true)
              },
            ]}
          />
          <FormattedMessage {...messages.page}/>
        </PageHeader>

        {editing &&
          <FieldArray name='budgets' component={renderBudgets}>
            <Button onClick={() => props.setEditing(false)}>cancel</Button>
            <Button type='submit' bsStyle='primary'>save</Button>
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
                  {category.doc.name}
                </ListGroupItem>
              )}
            </ListGroup>
          </Panel>
        )}
      </div>
    </form>
  )
})

type FieldProps = InjectedFieldProps<string> & { label: string, type: string } & React.Props<any>

const renderBudgets = (props: any) => {
  const { children, fields, meta: { error }} = props
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
          <Field
            name={`${budget}.name`}
            component={renderField}
            label='budget name'
          >
            <Button bsStyle='danger' onClick={() => fields.remove(index)}>
              <i className='fa fa-trash-o'/>
            </Button>
          </Field>
        </FieldArray>
      )}
      <Button onClick={() => fields.push()}>Add Budget</Button>
      <ButtonToolbar className='pull-right'>
        {children}
      </ButtonToolbar>
    </div>
  )
}

const renderCategories = (props: any) => {
  const { name, fields, children, meta: { error }} = props
  return (
    <Panel key={name} header={children}>
      <ListGroup fill>
        {fields.map((category: string, index: number) =>
          <ListGroupItem key={category}>
            <Field
              name={`${category}.name`}
              component={renderField}
              label={'category name'}
            >
              <Button bsStyle='danger' onClick={() => fields.remove(index)}>
                <i className='fa fa-minus'/>
              </Button>
            </Field>
          </ListGroupItem>
        )}
        {error &&
          <ListGroupItem>
            <Alert bsStyle='danger'>{error}</Alert>
          </ListGroupItem>
        }
      </ListGroup>
      <ButtonToolbar className='pull-right'>
        <Button onClick={() => fields.push()}><i className='fa fa-plus'/></Button>
      </ButtonToolbar>
    </Panel>
  )
}

const renderField = (props: FieldProps) => {
  const { children, input, label, type, meta: { error, warning } } = props
  return <div style={{display: 'flex'}}>
    <FormControl.Feedback/>
    <FormControl {...input} type={type} placeholder={label} style={{flex: 1}}/>
    {(error || warning) &&
      <HelpBlock>{error || warning}</HelpBlock>
    }
    {children}
  </div>
}
