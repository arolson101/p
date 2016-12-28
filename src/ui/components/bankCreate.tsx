import * as React from 'react'
import { Grid, Button, ButtonToolbar } from 'react-bootstrap'
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { Dispatch, compose } from 'redux'
import { reduxForm, ReduxFormProps } from 'redux-form'
import { DbInfo, Bank } from '../../docs'
import { AppState, FI, CurrentDb } from '../../state'
import { Validator } from '../../util'
import { Breadcrumbs } from './breadcrumbs'
import { forms } from './forms'
import { IntlProps, RouteProps } from './props'
import { Values, BankForm } from './bankForm'
import { selectDbInfo } from './selectors'

const messages = defineMessages({
  page: {
    id: 'inCreate.page',
    defaultMessage: 'Add Institution'
  }
})

interface ConnectedProps {
  filist: FI[]
  current: CurrentDb
  lang: string
  dbInfo?: DbInfo.Doc
}

type AllProps = IntlProps & ConnectedProps & RouteProps<Bank.Params> & ReduxFormProps<Values>

export const BankCreateComponent = (props: AllProps) => {
  const { handleSubmit } = props
  const { formatMessage } = props.intl
  return (
    <Grid>
      <Breadcrumbs {...props} page={formatMessage(messages.page)}/>
      <form onSubmit={handleSubmit(submit)}>
        <BankForm {...props} />
        <div>
          <ButtonToolbar className='pull-right'>
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
    </Grid>
  )
}

const submit = async (values: Values, dispatch: Dispatch<AppState>, props: AllProps) => {
  const { formatMessage } = props.intl
  const v = new Validator(values)
  v.required(['name'], formatMessage(forms.required))
  v.maybeThrowSubmissionError()

  const { current, filist, lang } = props
  const bank: Bank = {
    fi: values.fi ? filist[values.fi - 1].name : undefined,
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
  const doc = Bank.doc(bank, lang)
  await current.db.put(doc)

  props.router.replace(Bank.to.read(doc))
}

export const BankCreate = compose(
  injectIntl,
  connect(
    (state: AppState): ConnectedProps => ({
      filist: state.fi.list,
      current: state.db.current!,
      lang: state.i18n.locale,
      dbInfo: selectDbInfo(state)
    })
  ),
  reduxForm<AllProps, Values>({
    form: 'InCreate'
  })
)(BankCreateComponent) as React.ComponentClass<{}>
