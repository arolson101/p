import { normalize, arrayOf, Schema } from 'normalizr'
import * as React from 'react'
import { Button, ButtonToolbar } from 'react-bootstrap'
import * as R from 'ramda'
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch, compose } from 'redux'
import { reduxForm, ReduxFormProps } from 'redux-form'
import { Institution } from '../../docs'
import { AppState, AppDispatch, historyAPI } from '../../state'
import { Validator } from '../../util'
import { formFields, forms } from './forms'
import { IntlProps } from './props'
import { FinancialInstitution } from 'filist'

const fi = new Schema('fi', { idAttribute: 'name' })

// TODO: put this somewhere it can be updated
const filist: FinancialInstitution[] = require('json-loader!filist/filist.json')
// const filist: { [name: string]: FinancialInstitution } = normalize(
//   require('json-loader!filist/filist.json'),
//   arrayOf(fi)
// ).entities.fi

const messages = defineMessages({
  name: {
    id: 'inCreate.name',
    defaultMessage: 'Institution'
  }
})

interface ConnectedProps {
}

interface Props {
}

type AllProps = Props & IntlProps & ConnectedProps & ReduxFormProps<Values>

const style = {
  button: {
    margin: '16px 32px 16px 0'
  }
}

type Values = Institution

const { TextField } = formFields<Values>()

const fiMenuItem = (fi: FinancialInstitution) =>
  <option key={fi.name}>{fi.name}</option>

export const InCreateComponent = (props: AllProps) => {
  const { handleSubmit } = props
  return (
    <div>
      <form onSubmit={handleSubmit(submit)}>
        <div>
          <select
            name='name'
            autoFocus
            // hintText={formatMessage(messages.name)}
            // floatingLabelText={formatMessage(messages.name)}
          >
            {//R.map(FiMenuItem, R.values(filist))
              filist.map(fiMenuItem)
            }
          </select>
        </div>
        <div>
          <ButtonToolbar>
            <Button
              type='button'
              onClick={() => historyAPI.go(-1)}
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

const validate = (values: Values, props: IntlProps) => {
  const { formatMessage } = props.intl
  const v = new Validator(values)
  return v.errors
}

const submit = async (values: Values, dispatch: Dispatch<AppState>, props: AllProps) => {
  const { formatMessage } = props.intl
  const v = new Validator(values)
  v.required(['name'], formatMessage(forms.required))
  v.maybeThrowSubmissionError()
}

export const InCreate = compose(
  injectIntl,
  connect(
    (state: AppState): ConnectedProps => ({}),
    (dispatch: AppDispatch) => bindActionCreators( {}, dispatch ),
  ),
  reduxForm<AllProps, Values>({
    form: 'InCreate',
    validate
  })
)(InCreateComponent) as React.ComponentClass<Props>
