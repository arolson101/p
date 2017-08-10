import * as PropTypes from 'prop-types'
import * as React from 'react'
import { Button } from 'react-bootstrap'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes } from 'recompose'
import { InjectedFormProps, SubmitHandler, reduxForm } from 'redux-form'
import { SyncConnection } from 'core/docs'
import { AppState, mapDispatchToProps, pushChanges } from 'core/state'
import { runSync } from 'core/actions'
import { syncProviders } from 'core/sync'
import { Validator } from 'util/index'
import { typedFields, forms } from './forms'

const messages = defineMessages({
  password: {
    id: 'SyncStatus.password',
    defaultMessage: 'Password'
  },
  needsPassword: {
    id: 'SyncStatus.needsPassword',
    defaultMessage: 'Please enter password'
  },
  badPassword: {
    id: 'SyncStatus.badPassword',
    defaultMessage: 'Incorrect password.  Please re-enter password'
  },
})

interface Props {
  sync: SyncConnection.Doc
}

interface ConnectedProps {
}

interface DispatchProps {
  pushChanges: pushChanges.Fcn
  runSync: runSync.Fcn
}

type EnhancedProps = InjectedFormProps<Values, {}> & ConnectedProps & DispatchProps & IntlProps & Props

interface Values {
  password: string
}

const { Form, TextField } = typedFields<any>()

const enhance = compose<EnhancedProps, Props>(
  setDisplayName('AccountForm'),
  onlyUpdateForPropTypes,
  setPropTypes({
    sync: PropTypes.object,
  } as PropTypes<Props>),
  injectIntl,
  connect<ConnectedProps, DispatchProps, Props & IntlProps>(
    (state: AppState): ConnectedProps => ({
    }),
    mapDispatchToProps<DispatchProps>({ pushChanges, runSync })
  ),
  reduxForm<Values, ConnectedProps & DispatchProps & Props & IntlProps>({
    form: 'SyncStatus',
    // validate: (values: Values, props) => {
    //   const v = new Validator(values)
    //   const { intl: { formatMessage } } = props
    //   v.required(['password'], formatMessage(forms.required))
    //   return v.errors
    // }
    onSubmit: async (values: Values, dispatch, props) => {
      const { sync, pushChanges, runSync, intl: { formatMessage } } = props
      const v = new Validator(values, formatMessage)
      v.required('password')
      v.maybeThrowSubmissionError()
      const nextSync = SyncConnection.inputPassword(sync, values.password)
      await pushChanges({docs: [nextSync]})
      await runSync({config: nextSync})
    }
  })
)

export const SyncStatus = enhance(({ sync, handleSubmit }) => {
  const provider = syncProviders.find(p => p.id === sync.provider)
  if (!provider) {
    return <div>no provider</div>
  }

  const config = provider.drawConfig(sync)

  switch (sync.state) {
    case 'ERR_PASSWORD':
      return (
        <div>
          {config}<br/>
          <FormattedMessage {... (sync.password ? messages.badPassword : messages.needsPassword)}/>
          <Form onSubmit={handleSubmit}>
            <TextField name='password' label={messages.password} />
            <Button type='submit'>submit</Button>
          </Form>
        </div>
      )
    case 'ERROR':
      return <div>{config}<br/>error: {sync.message}</div>
    case 'OK':
      return <div>{config}<br/>ok</div>
    default:
      return <div>{config}</div>
  }
})
