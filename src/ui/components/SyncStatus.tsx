const autobind = require('autobind-decorator')
import * as React from 'react'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { ReduxFormProps, FieldArray, FieldArrayParams, reduxForm, Fields } from 'redux-form'
import { SyncConnection } from '../../docs/index'
import { AppState, mapDispatchToProps, pushChanges } from '../../state/index'
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
}

type AllProps = ReduxFormProps<Values> & ConnectedProps & DispatchProps & IntlProps & Props

interface Values {
  password: string
}

const { TextField } = typedFields<any>()

@injectIntl
@(connect<ConnectedProps, DispatchProps, IntlProps>(
  (state: AppState): ConnectedProps => ({
    lang: state.i18n.lang,
  }),
  mapDispatchToProps<DispatchProps>({ pushChanges })
) as any)
@(reduxForm<AllProps, Values>({
  form: 'BudgetForm',
  validate: (values, props) => {
    const v = new Validator(values)
    const { intl: { formatMessage } } = props
    v.required(['password'], formatMessage(forms.required))
    return v.errors
  }
}) as any)
export class SyncStatus extends React.Component<Props, {}> {
  render () {
    const { sync, handleSubmit } = this.props as AllProps

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
            <form onSubmit={handleSubmit(this.onSubmit)}>
              <TextField name='password' />
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
  }

  @autobind
  async onSubmit ({ password }: Values) {
    const { sync, pushChanges } = this.props as AllProps
    const nextSync = { ...sync, password }
    pushChanges({docs: [nextSync]})
  }
}
