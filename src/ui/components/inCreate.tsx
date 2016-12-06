import RaisedButton from 'material-ui/RaisedButton'
import * as React from 'react'
import { injectIntl, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch, compose } from 'redux'
import { reduxForm, ReduxFormProps } from 'redux-form'
import { Institution } from '../../docs'
import { AppState, AppDispatch, historyAPI } from '../../state'
import { Validator } from '../../util'
import { formFields, forms } from './forms'
import { IntlProps } from './props'

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

const { AutoComplete } = formFields<Values>()

export const InCreateComponent = (props: AllProps) => {
  const { formatMessage } = props.intl
  const { handleSubmit } = props
  return (
    <div>
      <form onSubmit={handleSubmit(submit)}>
        <div>
          <AutoComplete
            name='name'
            autoFocus
            dataSource={['uwcu', 'chase']}
            hintText={formatMessage(messages.name)}
            floatingLabelText={formatMessage(messages.name)}
          />
        </div>
        <div>
          <RaisedButton
            type='button'
            label={formatMessage(forms.cancel)}
            style={style.button}
            onTouchTap={() => historyAPI.go(-1)}
          />
          <RaisedButton
            type='submit'
            label={formatMessage(forms.create)}
            style={style.button}
            primary
          />
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
