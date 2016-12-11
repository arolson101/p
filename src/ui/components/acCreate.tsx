import { Button, ButtonToolbar } from 'react-bootstrap'
import * as React from 'react'
import { injectIntl, defineMessages } from 'react-intl'
import Loading from 'react-loading-bar'
import { connect } from 'react-redux'
import { Dispatch, compose } from 'redux'
import { reduxForm, ReduxFormProps } from 'redux-form'
import { Institution, Account } from '../../docs'
import { AppState, CurrentDb } from '../../state'
import { Validator } from '../../util'
import { forms, typedFields } from './forms'
import { IntlProps, RouteProps } from './props'

const messages = defineMessages({
  name: {
    id: 'acCreate.name',
    defaultMessage: 'Account Name'
  },
  number: {
    id: 'acCreate.number',
    defaultMessage: 'Account Number'
  }
})

interface ConnectedProps {
  current?: CurrentDb
  institution?: Institution.Doc
  lang: string
}

interface Props {
}

type AllProps = Props & IntlProps & ConnectedProps & ReduxFormProps<Values> & RouteProps<Account.Params>

interface Values {
  name: string
  number: string
}

const { TextField } = typedFields<Values>()

export const AcCreateComponent = (props: AllProps) => {
  const { institution, handleSubmit, router } = props
  const { formatMessage } = props.intl
  return (
    <div>
      <Loading color='red' show={!institution}/>
      {institution &&
        <form onSubmit={handleSubmit(submit)}>
          <div>
            <TextField
              name='name'
              autoFocus
              label={formatMessage(messages.name)}
            />
          </div>
          <div>
            <ButtonToolbar>
              <Button
                type='button'
                bsSize='large'
                onClick={() => router.goBack()}
              >
                {formatMessage(forms.cancel)}
              </Button>
              <Button
                type='submit'
                bsStyle='primary'
                bsSize='large'
              >
                {formatMessage(forms.create)}
              </Button>
            </ButtonToolbar>
          </div>
        </form>
      }
    </div>
  )
}

const selectInstitution = (state: AppState, props: RouteProps<Institution.Params>) => {
  const id = Institution.docId(props.params)
  return state.db.current && state.db.current.cache.institutions.get(id)
}

const validate = (values: Values, props: IntlProps) => {
  const { formatMessage } = props.intl
  const v = new Validator(values)
  // TODO: ensure uniqueness
  return v.errors
}

const submit = async (values: Values, dispatch: Dispatch<AppState>, props: AllProps) => {
  const { current, router, lang } = props

  const account: Account = {
    institution: props.institution!._id,
    name: values.name,
    type: Account.Type.CHECKING,
    number: values.number,
    visible: true
  }

  const doc = Account.doc(account, lang)
  await current!.db.put(doc)

  router.replace(Account.path(doc))
}

export const AcCreate = compose(
  injectIntl,
  connect(
    (state: AppState, props: RouteProps<Account.Params>): ConnectedProps => ({
      current: state.db.current,
      lang: state.i18n.lang,
      institution: selectInstitution(state, props)
    })
  ),
  reduxForm<AllProps, Values>({
    form: 'AcCreate',
    validate
  })
)(AcCreateComponent) as React.ComponentClass<Props>
