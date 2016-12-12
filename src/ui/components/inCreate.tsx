import * as React from 'react'
import { Button, ButtonToolbar } from 'react-bootstrap'
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch, compose } from 'redux'
import { reduxForm, ReduxFormProps } from 'redux-form'
import { Institution } from '../../docs'
import { AppState, AppDispatch, FI, CurrentDb } from '../../state'
import { Validator } from '../../util'
import { forms } from './forms'
import { IntlProps, RouteProps } from './props'
import { Values, InForm } from './inForm'

const messages = defineMessages({
  fi: {
    id: 'inCreate.fi',
    defaultMessage: 'Institution'
  },
  name: {
    id: 'inCreate.name',
    defaultMessage: 'Name'
  },
  web: {
    id: 'inCreate.web',
    defaultMessage: 'Website'
  },
  address: {
    id: 'inCreate.address',
    defaultMessage: 'Address'
  }
})

interface ConnectedProps {
  filist: FI[]
  current: CurrentDb
  lang: string
}

interface Props {
}

type AllProps = Props & IntlProps & ConnectedProps & RouteProps<Institution.Params> & ReduxFormProps<Values>

export const InCreateComponent = (props: AllProps) => {
  const { handleSubmit } = props
  return (
    <div>
      <form onSubmit={handleSubmit(submit)}>
        <InForm {...props} />
        <div>
          <ButtonToolbar>
            <Button
              type='button'
              onClick={() => props.router.goBack()}
            >
              <FormattedMessage {...forms.cancel}/>
            </Button>
            <Button
              type='submit'
              bsStyle='primary'
            >
              <FormattedMessage {...forms.create}/>
            </Button>
          </ButtonToolbar>
        </div>
      </form>
    </div>
  )
}

const submit = async (values: Values, dispatch: Dispatch<AppState>, props: AllProps) => {
  const { formatMessage } = props.intl
  const v = new Validator(values)
  v.required(['name'], formatMessage(forms.required))
  v.maybeThrowSubmissionError()

  const { current, lang } = props
  const institution: Institution = {
    name: values.name,
    web: values.web,
    address: values.address,
    online: values.online,
    fid: values.fid,
    org: values.org,
    ofx: values.ofx,
    login: {
      username: values.username,
      password: values.password
    },
    accounts: []
  }
  const doc = Institution.doc(institution, lang)
  await current.db.put(doc)

  props.router.replace(Institution.to.read(doc))
}

export const InCreate = compose(
  injectIntl,
  connect(
    (state: AppState): ConnectedProps => ({
      filist: state.fi.list,
      current: state.db.current!,
      lang: state.i18n.locale
    }),
    (dispatch: AppDispatch) => bindActionCreators( {}, dispatch ),
  ),
  reduxForm<AllProps, Values>({
    form: 'InCreate'
  })
)(InCreateComponent) as React.ComponentClass<Props>
