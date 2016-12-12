import autobind = require('autobind-decorator')
import { FinancialInstitution } from 'filist'
import * as React from 'react'
import { Button, ButtonToolbar } from 'react-bootstrap'
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch, compose } from 'redux'
import { reduxForm, ReduxFormProps } from 'redux-form'
import { createSelector } from 'reselect'
import { Institution } from '../../docs'
import { AppState, AppDispatch, emptyfi, CurrentDb } from '../../state'
import { Validator, formatAddress } from '../../util'
import { typedFields, forms } from './forms'
import { IntlProps, RouteProps } from './props'

const messages = defineMessages({
  fi: {
    id: 'inUpdate.fi',
    defaultMessage: 'Institution'
  },
  name: {
    id: 'inUpdate.name',
    defaultMessage: 'Name'
  },
  web: {
    id: 'inUpdate.web',
    defaultMessage: 'Website'
  },
  address: {
    id: 'inUpdate.address',
    defaultMessage: 'Address'
  }
})

interface Option {
  value: number
  label: string
}

interface ConnectedProps {
  options: Option[]
  filist: FinancialInstitution[]
  current: CurrentDb
  lang: string
}

interface Props {
}

type AllProps = Props & IntlProps & ConnectedProps & RouteProps<Institution.Params> & ReduxFormProps<Values>

interface Values {
  fi: string

  name: string
  web: string
  address: string
  notes: string

  online: boolean

  fid: string
  org: string
  ofx: string

  username: string
  password: string
}

const { TextField, SelectField, MultilineTextField } = typedFields<Values>()

export class InUpdateComponent extends React.Component<AllProps, any> {
  render() {
    const { handleSubmit, intl: { formatMessage }, options } = this.props
    return (
      <div>
        <form onSubmit={handleSubmit(submit)}>
          <div>
            <SelectField
              autofocus
              name='fi'
              label={formatMessage(messages.fi)}
              options={options}
              onChange={this.onChangeFI}
            />
          </div>
          <div>
            <TextField
              name='name'
              label={formatMessage(messages.name)}
            />
          </div>
          <div>
            <TextField
              name='web'
              label={formatMessage(messages.web)}
            />
          </div>
          <div>
            <MultilineTextField
              name='address'
              rows={4}
              label={formatMessage(messages.address)}
            />
          </div>
          <div>
            <ButtonToolbar>
              <Button
                type='button'
                onClick={() => this.props.router.goBack()}
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

  @autobind
  onChangeFI(index: number) {
    const { filist } = this.props
    const value = index ? filist[index - 1] : emptyfi

    this.props.change('name', value.name)
    this.props.change('web', value.profile.siteURL)
    this.props.change('address', formatAddress(value))
  }
}

const optionsSelector = createSelector(
  (state: AppState) => state.fi.list,
  (filist): Option[] => filist.map((fi, index) => ({ value: index + 1, label: fi.name }))
)

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

export const InUpdate = compose(
  injectIntl,
  connect(
    (state: AppState): ConnectedProps => ({
      options: optionsSelector(state),
      filist: state.fi.list,
      current: state.db.current!,
      lang: state.i18n.locale
    }),
    (dispatch: AppDispatch) => bindActionCreators( {}, dispatch ),
  ),
  reduxForm<AllProps, Values>({
    form: 'InUpdate'
  })
)(InUpdateComponent) as React.ComponentClass<Props>
