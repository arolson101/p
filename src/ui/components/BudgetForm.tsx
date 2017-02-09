import * as R from 'ramda'
import * as React from 'react'
import { PageHeader, ButtonToolbar, Button } from 'react-bootstrap'
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes, withProps } from 'recompose'
import { Dispatch } from 'redux'
import { reduxForm, ReduxFormProps, SubmitFunction } from 'redux-form'
import ui, { ReduxUIProps } from 'redux-ui'
import { Budget } from '../../docs'
import { AppState } from '../../state'
import { Validator } from '../../util'
import { withPropChangeCallback } from '../enhancers'
import { typedFields, forms, SelectOption } from './forms'
import { IntlProps } from './props'

export { SubmitFunction }

const messages = defineMessages({
  createTitle: {
    id: 'BudgetForm.createTitle',
    defaultMessage: 'Add Budget'
  },
  editTitle: {
    id: 'BudgetForm.editTitle',
    defaultMessage: 'Edit Budget'
  },
  group: {
    id: 'BudgetForm.group',
    defaultMessage: 'Group'
  },
  name: {
    id: 'BudgetForm.name',
    defaultMessage: 'Name'
  },
  uniqueName: {
    id: 'BudgetForm.uniqueName',
    defaultMessage: 'This name is already used'
  },
})

interface Props {
  edit?: Budget.View
  onSubmit: SubmitFunction<Budget.Doc>
  onCancel: () => void
}

interface ConnectedProps {
  lang: string
  budgets: Budget.View[]
}

interface UIState {
  groups: SelectOption[]
}

interface EnhancedProps {
  onSubmit: (values: Values, dispatch: Dispatch<AppState>, props: AllProps) => void
}

type AllProps = EnhancedProps & ReduxUIProps<UIState> & ReduxFormProps<Values> & ConnectedProps & IntlProps & Props

interface Values {
  name: string
  group: string
}

const formName = 'BudgetForm'

const enhance = compose<AllProps, Props>(
  setDisplayName(formName),
  onlyUpdateForPropTypes,
  setPropTypes({
    edit: React.PropTypes.object,
    onSubmit: React.PropTypes.func.isRequired,
    onCancel: React.PropTypes.func.isRequired
  } as PropTypes<Props>),
  injectIntl,
  connect<ConnectedProps, {}, IntlProps & Props>(
    (state: AppState): ConnectedProps => ({
      lang: state.i18n.lang,
      budgets: state.db.current!.view.budgets,
    })
  ),
  reduxForm<ConnectedProps & IntlProps & Props, Values>({
    form: formName,
    validate: (values: Values, props: AllProps) => {
      const v = new Validator(values)
      const { edit, budgets, intl: { formatMessage } } = props
      const otherAccounts = budgets.filter(otherBudget => !edit || otherBudget.doc._id !== edit.doc._id)
      const otherNames = otherAccounts.map(acct => acct.doc.name)
      v.unique('name', otherNames, formatMessage(messages.uniqueName))
      return v.errors
    }
  }),
  ui<UIState, ReduxFormProps<Values> & ConnectedProps & IntlProps & Props, {}>({
    state: {
      groups: (props: ConnectedProps): SelectOption[] => getGroupNames(props.budgets)
    }
  }),
  withProps<EnhancedProps, ReduxUIProps<UIState> & ReduxFormProps<Values> & ConnectedProps & IntlProps & Props>(
    ({onSubmit, lang, edit}) => ({
      onSubmit: async (values: Values, dispatch: any, props: AllProps) => {
        const { intl: { formatMessage } } = props
        const v = new Validator(values)
        v.required(['group', 'name'], formatMessage(forms.required))
        v.maybeThrowSubmissionError()

        const budget: Budget = {
          ...(edit ? edit!.doc : {}),
          ...values
        }
        const doc = Budget.doc(budget, lang)
        return onSubmit(doc, dispatch, props)
      }
    })
  ),
  withPropChangeCallback<EnhancedProps & ReduxUIProps<UIState> & ReduxFormProps<Values> & ConnectedProps & IntlProps & Props>(
    'edit',
    (props) => {
      const { edit, initialize } = props
      if (edit) {
        const values: Values = edit.doc
        initialize(values, false)
      }
    }
  ),
)

const { TextField, SelectCreateableField } = typedFields<Values>()

export const BudgetForm = enhance((props) => {
  const { edit, onSubmit, onCancel, ui: { groups }, handleSubmit } = props
  const { formatMessage } = props.intl
  const title = edit ? messages.editTitle : messages.createTitle

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <PageHeader>
        <FormattedMessage {...title}/>
      </PageHeader>

      <div className='form-horizontal container-fluid' style={{paddingBottom: 10}}>
        <TextField
          name='name'
          autoFocus
          label={formatMessage(messages.name)}
        />
        <SelectCreateableField
          name='group'
          options={groups}
          label={formatMessage(messages.group)}
          promptTextCreator={(label) => 'create group ' + label}
        />

        <ButtonToolbar className='pull-right'>
          <Button
            type='button'
            onClick={onCancel}
          >
            <FormattedMessage {...forms.cancel}/>
          </Button>
          <Button
            type='submit'
            bsStyle='primary'
          >
            {edit ? (
              <FormattedMessage {...forms.save}/>
            ) : (
              <FormattedMessage {...forms.create}/>
            )}
          </Button>
        </ButtonToolbar>
      </div>
    </form>
  )
})

const getGroupNames = R.pipe(
  R.map((bill: Budget.View): string => bill.doc.group),
  R.sortBy(R.toLower),
  R.uniq,
  R.map((name: string): SelectOption => ({ label: name, value: name }))
)
