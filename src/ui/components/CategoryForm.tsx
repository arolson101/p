import * as React from 'react'
import { ButtonToolbar, Button } from 'react-bootstrap'
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes, withProps } from 'recompose'
import { Dispatch } from 'redux'
import { reduxForm, ReduxFormProps, SubmitFunction } from 'redux-form'
import { Budget, Category } from '../../docs'
import { AppState } from '../../state'
import { Validator } from '../../util'
import { withPropChangeCallback } from '../enhancers'
import { typedFields, forms } from './forms'
import { IntlProps } from './props'

interface SubmitParams {
  budget: Budget.Doc
  category: Category.Doc
}

export type CategorySubmitFunction = SubmitFunction<SubmitParams>

const messages = defineMessages({
  name: {
    id: 'CategoryForm.name',
    defaultMessage: 'Name'
  },
  uniqueName: {
    id: 'CategoryForm.uniqueName',
    defaultMessage: 'This name is already used'
  },
})

interface Props {
  edit?: Category.View
  onSubmit: CategorySubmitFunction
  onCancel: () => void
  budget: Budget.View
}

interface ConnectedProps {
  lang: string
}

interface EnhancedProps {
  onSubmit: (values: Values, dispatch: Dispatch<AppState>, props: AllProps) => void
}

type AllProps = EnhancedProps & ReduxFormProps<Values> & ConnectedProps & IntlProps & Props

interface Values {
  name: string
}

const formName = 'CategoryForm'

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
      lang: state.i18n.lang
    })
  ),
  reduxForm<ConnectedProps & IntlProps & Props, Values>({
    form: formName,
    validate: (values: Values, props: AllProps) => {
      const v = new Validator(values)
      const { edit, budget, intl: { formatMessage } } = props
      const otherAccounts = budget.categories.filter(otherCategory => !edit || otherCategory.doc._id !== edit.doc._id)
      const otherNames = otherAccounts.map(acct => acct.doc.name)
      v.unique('name', otherNames, formatMessage(messages.uniqueName))
      return v.errors
    }
  }),
  withProps<EnhancedProps, ReduxFormProps<Values> & ConnectedProps & IntlProps & Props>(
    ({budget, onSubmit, lang, edit, intl: { formatMessage }}) => ({
      onSubmit: async (values: Values, dispatch: any, props: AllProps) => {
        const v = new Validator(values)
        v.required(['name'], formatMessage(forms.required))
        v.maybeThrowSubmissionError()

        const category: Category = {
          ...(edit ? edit!.doc : {}),
          ...values
        }
        const doc = Category.doc(budget.doc, category, lang)
        return onSubmit({category: doc, budget: budget.doc}, dispatch, props)
      }
    })
  ),
  withPropChangeCallback<EnhancedProps & ReduxFormProps<Values> & ConnectedProps & IntlProps & Props>(
    'edit',
    (props) => {
      const { edit, initialize } = props
      if (edit) {
        const values = edit.doc
        initialize(values, false)
      }
    }
  ),
)

const { TextField } = typedFields<Values>()

export const CategoryForm = enhance((props) => {
  const { edit, onSubmit, onCancel, handleSubmit } = props
  const { formatMessage } = props.intl

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className='form-horizontal container-fluid' style={{paddingBottom: 10}}>
        <TextField
          name='name'
          autoFocus
          label={formatMessage(messages.name)}
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
