import { Button, ButtonToolbar } from 'react-bootstrap'
import * as React from 'react'
import { injectIntl, defineMessages } from 'react-intl'
import Loading from 'react-loading-bar'
import { connect } from 'react-redux'
import { Dispatch, compose } from 'redux'
import { reduxForm, ReduxFormProps } from 'redux-form'
import { DbInfo, Institution, Account } from '../../docs'
import { AppState, CurrentDb } from '../../state'
import { Validator } from '../../util'
import { Breadcrumbs } from './breadcrumbs'
import { forms, typedFields } from './forms'
import { IntlProps, RouteProps } from './props'
import { selectDbInfo, selectInstitution } from './selectors'

const messages = defineMessages({
  page: {
    id: 'acCreate.page',
    defaultMessage: 'Add Account'
  },
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
  dbInfo?: DbInfo.Doc
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
        <div>
          <Breadcrumbs {...props} page={formatMessage(messages.page)}/>
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
        </div>
      }
    </div>
  )
}

const validate = (values: Values, props: IntlProps) => {
  // const { formatMessage } = props.intl
  const v = new Validator(values)
  // TODO: ensure uniqueness
  return v.errors
}

const submit = async (values: Values, dispatch: Dispatch<AppState>, props: AllProps) => {
  const { current, router, lang } = props
  const institution = props.institution!

  const account: Account = {
    institution: institution._id,
    name: values.name,
    type: Account.Type.CHECKING,
    number: values.number,
    visible: true
  }

  const doc = Account.doc(account, lang)
  institution.accounts.push(doc._id)
  await current!.db.bulkDocs([doc, institution])

  router.replace(Account.to.read(doc))
}

export const AcCreate = compose(
  injectIntl,
  connect(
    (state: AppState, props: RouteProps<Account.Params>): ConnectedProps => ({
      current: state.db.current,
      lang: state.i18n.lang,
      dbInfo: selectDbInfo(state),
      institution: selectInstitution(state, props)
    })
  ),
  reduxForm<AllProps, Values>({
    form: 'AcCreate',
    validate
  })
)(AcCreateComponent) as React.ComponentClass<Props>
