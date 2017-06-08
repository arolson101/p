import { Button, ButtonToolbar, Row } from 'react-bootstrap'
import * as React from 'react'
import { injectIntl, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes } from 'recompose'
import { reduxForm, FormProps } from 'redux-form'
import { DbInfo } from '../../docs/index'
import { AppState, createDb, mapDispatchToProps } from '../../state/index'
import { Validator } from '../../util/index'
import { forms, typedFields } from './forms/index'
import { IntlProps } from './props'

const messages = defineMessages({
  welcome: {
    id: 'dbCreate.welcome',
    defaultMessage: 'Welcome!  Please give your database a name and set the password'
  },
  name: {
    id: 'dbCreate.name',
    defaultMessage: 'Database Name'
  },
  uniqueName: {
    id: 'dbCreate.uniqueName',
    defaultMessage: 'This name is already used'
  },
})

interface Props {
  onCreate: (dbInfo: DbInfo) => void
  onCancel: () => void
}

interface ConnectedProps {
  files: DbInfo[]
}

interface DispatchProps {
  createDb: createDb.Fcn
}

type EnhancedProps = IntlProps & Props & ConnectedProps & DispatchProps & FormProps<Values, {}, {}>

interface Values {
  name: string
  password: string
  confirmPassword: string
}

const enhance = compose<EnhancedProps, Props>(
  setDisplayName('CreateForm'),
  onlyUpdateForPropTypes,
  setPropTypes({}),
  injectIntl,
  connect<ConnectedProps, DispatchProps, Props & IntlProps>(
    (state: AppState) => ({
      files: state.db.files
    }),
    mapDispatchToProps<DispatchProps>({ createDb })
  ),
  reduxForm<Values, ConnectedProps & DispatchProps & Props & IntlProps>({
    form: 'CreateForm',
    validate: ((values, props) => {
      const { files, intl: { formatMessage } } = props
      const v = new Validator(values, formatMessage)
      const names = files.map(info => info.name)
      v.unique('name', names, messages.uniqueName)
      v.equal('confirmPassword', 'password', forms.passwordsMatch)
      return v.errors
    }),
    onSubmit: async (values, dispatch, props) => {
      const { createDb, onCreate, intl: { formatMessage } } = props
      const v = new Validator(values, formatMessage)
      v.required('name', 'password', 'confirmPassword')
      v.maybeThrowSubmissionError()

      const { name, password } = values
      const dbInfo = await createDb({name, password})
      onCreate(dbInfo)
    }
  })
)

const { Form, TextField, PasswordField } = typedFields<Values>()

export const CreateForm = enhance((props) => {
  const { handleSubmit, onCancel, intl: { formatMessage } } = props
  return (
    <Form onSubmit={handleSubmit}>
      <Row>
        <TextField
          name='name'
          autoFocus
          label={messages.name}
        />
      </Row>
      <Row>
        <PasswordField
          name='password'
          label={forms.password}
        />
      </Row>
      <Row>
        <PasswordField
          name='confirmPassword'
          label={forms.confirmPassword}
        />
      </Row>
      <ButtonToolbar>
        <Button
          type='button'
          onClick={onCancel}
        >
          {formatMessage(forms.cancel)}
        </Button>
        <Button
          type='submit'
          bsStyle='primary'
        >
          {formatMessage(forms.create)}
        </Button>
      </ButtonToolbar>
    </Form>
  )
})
