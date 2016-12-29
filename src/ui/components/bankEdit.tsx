import * as React from 'react'
import { Grid, Col, Button, ButtonToolbar } from 'react-bootstrap'
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { Dispatch, compose } from 'redux'
import { reduxForm, ReduxFormProps } from 'redux-form'
import { DbInfo, Bank } from '../../docs'
import { AppState, FI, CurrentDb } from '../../state'
import { Validator } from '../../util'
import { Breadcrumbs } from './breadcrumbs'
import { forms } from './forms'
import { Values, BankForm } from './bankForm'
import { IntlProps, RouteProps } from './props'
import { selectDbInfo, selectBank } from './selectors'

const messages = defineMessages({
  page: {
    id: 'inUpdate.page',
    defaultMessage: 'Edit'
  }
})

interface ConnectedProps {
  filist: FI[]
  current: CurrentDb
  lang: string
  dbInfo?: DbInfo.Doc
  bank?: Bank.Doc
}

type AllProps = IntlProps & ConnectedProps & RouteProps<Bank.Params> & ReduxFormProps<Values>

export class BankEditComponent extends React.Component<AllProps, any> {
  render() {
    const { handleSubmit, router, bank } = this.props
    const { formatMessage } = this.props.intl
    return (
      <div>
        {bank &&
          <Grid>
            <Breadcrumbs {...this.props} page={formatMessage(messages.page)}/>
            <form onSubmit={handleSubmit(submit)}>
              <BankForm {...this.props} />
              <Col>
                <ButtonToolbar className='pull-right'>
                  <Button
                    type='button'
                    onClick={() => router.goBack()}
                  >
                    <FormattedMessage {...forms.cancel}/>
                  </Button>
                  <Button
                    type='submit'
                    bsStyle='primary'
                    id='open-dropdown'
                  >
                  <FormattedMessage {...forms.save}/>
                  </Button>
                </ButtonToolbar>
              </Col>
            </form>
          </Grid>
        }
      </div>
    )
  }
}

const submit = async (values: Values, dispatch: Dispatch<AppState>, props: AllProps) => {
  const { formatMessage } = props.intl
  const v = new Validator(values)
  v.required(['name'], formatMessage(forms.required))
  v.maybeThrowSubmissionError()

  const { bank, current, filist, router } = props
  const doc: Bank.Doc = {
    ...bank,

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
    }
  }
  await current.db.put(doc)

  router.replace(Bank.to.view(doc))
}

export const BankEdit = compose(
  injectIntl,
  connect(
    (state: AppState, props: RouteProps<Bank.Params>): ConnectedProps => ({
      filist: state.fi.list,
      current: state.db.current!,
      lang: state.i18n.locale,
      dbInfo: selectDbInfo(state),
      bank: selectBank(state, props)
    })
  ),
  reduxForm<AllProps, Values>({
    form: 'BankEdit'
  })
)(BankEditComponent) as React.ComponentClass<{}>
