import { Button, ButtonToolbar } from 'react-bootstrap'
import * as React from 'react'
import { injectIntl, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName, withProps, onlyUpdateForPropTypes, setPropTypes } from 'recompose'
import { reduxForm, ReduxFormProps } from 'redux-form'
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

interface EnhancedProps {
  onSubmit: (values: Values, dispatch: any, props: AllProps) => Promise<any>
}

type AllProps = IntlProps & Props & EnhancedProps & ConnectedProps & DispatchProps & ReduxFormProps<Values>

interface Values {
  name: string
  password: string
  confirmPassword: string
}

const enhance = compose<AllProps, Props>(
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
  withProps<EnhancedProps, ConnectedProps & DispatchProps & Props & IntlProps>({
    onSubmit: async (values, dispatch, props) => {
      const { createDb, onCreate, intl: { formatMessage } } = props
      const v = new Validator(values)
      v.required(['name', 'password', 'confirmPassword'], formatMessage(forms.required))
      v.maybeThrowSubmissionError()

      const { name, password } = values
      const dbInfo = await createDb({name, password})
      onCreate(dbInfo)
    }
  }),
  reduxForm<EnhancedProps & ConnectedProps & DispatchProps & Props & IntlProps, Values>({
    form: 'CreateForm',
    validate: (values: Values, props: AllProps) => {
      const { files, intl: { formatMessage } } = props
      const v = new Validator(values)
      const names = files.map(info => info.name)
      v.unique('name', names, formatMessage(messages.uniqueName))
      v.equal('confirmPassword', 'password', formatMessage(forms.passwordsMatch))
      return v.errors
    }
  })
)

const { TextField, PasswordField } = typedFields<Values>()

export const CreateForm = enhance((props) => {
  const { handleSubmit, onCancel, intl: { formatMessage } } = props
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <TextField
          name='name'
          autoFocus
          label={formatMessage(messages.name)}
        />
      </div>
      <div>
        <PasswordField
          name='password'
          label={formatMessage(forms.password)}
        />
      </div>
      <div>
        <PasswordField
          name='confirmPassword'
          label={formatMessage(forms.confirmPassword)}
        />
      </div>
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
    </form>
  )
})
