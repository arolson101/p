import * as PropTypes from 'prop-types'
import * as React from 'react'
import { Button } from 'react-bootstrap'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes, withProps } from 'recompose'
import { ReduxFormProps, SubmitFunction, reduxForm } from 'redux-form'
import { SyncConnection } from '../../docs/index'
import { AppState, mapDispatchToProps, pushChanges } from '../../state/index'
import { runSync } from '../../state/db/sync'
import { syncProviders } from '../../sync/index'
import { Validator } from '../../util/index'
import { typedFields, forms } from './forms/index'
import { IntlProps } from './props'

const messages = defineMessages({
  needsPassword: {
    id: 'SyncStatus.needsPassword',
    defaultMessage: 'Please enter password'
  },
  badPassword: {
    id: 'SyncStatus.badPassword',
    defaultMessage: 'Incorrect password.  Please enter password'
  },
})

interface Props {
  sync: SyncConnection.Doc
}

interface ConnectedProps {
  lang: string
}

interface DispatchProps {
  pushChanges: pushChanges.Fcn
  runSync: runSync.Fcn
}

interface EnhancedProps {
  onSubmit: SubmitFunction<Values>
}

type AllProps = ReduxFormProps<Values> & EnhancedProps & ConnectedProps & DispatchProps & IntlProps & Props

interface Values {
  password: string
}

const { TextField } = typedFields<any>()

const enhance = compose<AllProps, Props>(
  setDisplayName('AccountForm'),
  onlyUpdateForPropTypes,
  setPropTypes({
    sync: PropTypes.object,
  } as PropTypes<Props>),
  injectIntl,
  connect<ConnectedProps, DispatchProps, Props & IntlProps>(
    (state: AppState): ConnectedProps => ({
      lang: state.i18n.lang,
    }),
    mapDispatchToProps<DispatchProps>({ pushChanges, runSync })
  ),
  withProps<EnhancedProps, ConnectedProps & DispatchProps & Props & IntlProps>(
    ({ sync, pushChanges, runSync, intl: { formatMessage } }) => ({
      onSubmit: async (values: Values) => {
        const v = new Validator(values)
        v.required(['password'], formatMessage(forms.required))
        v.maybeThrowSubmissionError()
        const nextSync = SyncConnection.inputPassword(sync, values.password)
        await pushChanges({docs: [nextSync]})
        await runSync({config: nextSync})
      }
    })
  ),
  reduxForm<EnhancedProps & ConnectedProps & DispatchProps & Props & IntlProps, Values>({
    form: 'SyncStatus',
    // validate: (values: Values, props) => {
    //   const v = new Validator(values)
    //   const { intl: { formatMessage } } = props
    //   v.required(['password'], formatMessage(forms.required))
    //   return v.errors
    // }
  })
)

export const SyncStatus = enhance(({ onSubmit, sync, handleSubmit }) => {
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
          <form onSubmit={handleSubmit!(onSubmit)}>
            <TextField name='password' label='password' />
            <Button type='submit'>submit</Button>
          </form>
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
