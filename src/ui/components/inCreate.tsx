import * as React from 'react'
import * as R from 'ramda'
import { Button, ButtonToolbar } from 'react-bootstrap'
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch, compose } from 'redux'
import { reduxForm, ReduxFormProps } from 'redux-form'
import { Institution } from '../../docs'
import { AppState, AppDispatch, historyAPI } from '../../state'
import { Validator } from '../../util'
import { typedFields, forms, SelectControl } from './forms'
import { IntlProps } from './props'
import { FinancialInstitution } from 'filist'

// TODO: put this somewhere it can be updated
const filist: FinancialInstitution[] = require('json-loader!filist/filist.json')

const messages = defineMessages({
  fi: {
    id: 'inCreate.fi',
    defaultMessage: 'Institution'
  },
  name: {
    id: 'inCreate.name',
    defaultMessage: 'Name'
  }
})

interface ConnectedProps {
}

interface Props {
}

type AllProps = Props & IntlProps & ConnectedProps & ReduxFormProps<Values>

interface Values extends Institution {
  fi: string
}

const { TextField, SelectField } = typedFields<Values>()

const options = filist.map((fi, index) => ({ value: index, label: fi.name }))

export const InCreateComponent = (props: AllProps) => {
  const { handleSubmit, intl: { formatMessage } } = props
  return (
    <div>
      <form onSubmit={handleSubmit(submit)}>
        <div>
          <SelectField
            name='fi'
            label={formatMessage(messages.fi)}
            options={options}
            // onChange={onChangeFI}
          />
        </div>
        <div>
          <TextField
            name='name'
            label={formatMessage(messages.name)}
          />
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

const onChangeFI = function() {
  console.log(arguments)
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
