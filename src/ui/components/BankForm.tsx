import * as React from 'react'
import { Collapse, PageHeader, InputGroup, ButtonToolbar, Button } from 'react-bootstrap'
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName, withProps, onlyUpdateForPropTypes, setPropTypes } from 'recompose'
import { reduxForm, formValueSelector, ReduxFormProps, SubmitFunction } from 'redux-form'
import { getFavicon } from '../../actions/index'
import { Bank } from '../../docs/index'
import { Validator } from '../../util/index'
import { AppState, FI, emptyfi } from '../../state/index'
import { withPropChangeCallback } from '../enhancers/index'
import { formatAddress } from '../../util/index'
import { typedFields, forms } from './forms/index'
import { IconPicker } from './forms/IconPicker'
import { IntlProps } from './props'

export { SubmitFunction }

const messages = defineMessages({
  createTitle: {
    id: 'BankForm.createTitle',
    defaultMessage: 'Add Institution'
  },
  editTitle: {
    id: 'BankForm.editTitle',
    defaultMessage: 'Edit Institution'
  },
  fi: {
    id: 'BankForm.fi',
    defaultMessage: 'Institution'
  },
  fiHelp: {
    id: 'BankForm.fiHelp',
    defaultMessage: 'Choose a financial institution from the list or fill in the details below'
  },
  fiPlaceholder: {
    id: 'BankForm.fiPlaceholder',
    defaultMessage: 'Select financial institution...'
  },
  name: {
    id: 'BankForm.name',
    defaultMessage: 'Name'
  },
  web: {
    id: 'BankForm.web',
    defaultMessage: 'Website'
  },
  address: {
    id: 'BankForm.address',
    defaultMessage: 'Address'
  },
  notes: {
    id: 'BankForm.notes',
    defaultMessage: 'Notes'
  },
  online: {
    id: 'BankForm.online',
    defaultMessage: 'Online'
  },
  fid: {
    id: 'BankForm.fid',
    defaultMessage: 'Fid'
  },
  org: {
    id: 'BankForm.org',
    defaultMessage: 'Org'
  },
  ofx: {
    id: 'BankForm.ofx',
    defaultMessage: 'OFX Server'
  },
  username: {
    id: 'BankForm.username',
    defaultMessage: 'Username'
  },
  password: {
    id: 'BankForm.password',
    defaultMessage: 'Password'
  }
})

interface Props {
  edit?: Bank.Doc
  onSubmit: SubmitFunction<Values>
  onCancel: () => void
}

interface ConnectedProps {
  filist: FI[]
  lang: string
  online: boolean
  fi: string
  web: string
  favicon: string
}

interface EnhancedProps {
  onChangeFI: (event: any, index: number) => void
  changeIcon: (favicon?: string) => void
}

type AllProps = IntlProps & EnhancedProps & ConnectedProps & Props & ReduxFormProps<Values>

export interface Values {
  fi: number

  name: string
  web: string
  address: string
  notes: string
  favicon: string

  online: boolean

  fid: string
  org: string
  ofx: string

  username: string
  password: string
}

const { TextField, SelectField, MultilineTextField, CheckboxField } = typedFields<Values>()
const formName = 'bankForm'
const formSelector = formValueSelector<Values>(formName)

const enhance = compose<AllProps, Props>(
  setDisplayName('BankForm'),
  onlyUpdateForPropTypes,
  setPropTypes({
    edit: React.PropTypes.object,
    onSubmit: React.PropTypes.func.isRequired,
    onCancel: React.PropTypes.func.isRequired
  } as PropTypes<Props>),
  injectIntl,
  connect<ConnectedProps, {}, Props & IntlProps>(
    (state: AppState): ConnectedProps => ({
      filist: state.fi.list,
      lang: state.i18n.locale,
      online: formSelector(state, 'online'),
      fi: formSelector(state, 'fi'),
      web: formSelector(state, 'web'),
      favicon: formSelector(state, 'favicon'),
    })
  ),
  withProps<{}, ConnectedProps & Props & IntlProps>(({onSubmit, intl: { formatMessage }}) => ({
    onSubmit: async (values: Values, dispatch: any, props: any) => {
      const v = new Validator(values)
      v.required(['name'], formatMessage(forms.required))
      v.maybeThrowSubmissionError()
      return onSubmit(values, dispatch, props)
    }
  })),
  reduxForm<ConnectedProps & Props & IntlProps, Values>({
    form: formName,
    initialValues: {
      online: true
    }
  }),
  withPropChangeCallback<ReduxFormProps<Values> & ConnectedProps & Props & IntlProps>('edit', props => {
    const { edit, filist, initialize } = props
    if (edit) {
      const fi = filist.findIndex(fiEntry => fiEntry.name === edit.fi) + 1
      const values = { ...edit, ...edit.login, fi }
      initialize(values, false)
    }
  }),
  withPropChangeCallback<EnhancedProps & ReduxFormProps<Values> & ConnectedProps & Props & IntlProps>('web', async (props, prev) => {
    const { web, favicon, change } = props
    if (web && (favicon === undefined || prev)) { // avoid re-fetching icon
      try {
        console.log('getting favicon')
        change('favicon', '')
        const response = await getFavicon(web)
        change('favicon', response!)
      } catch (err) {
        console.log('error getting favicon: ', err.message)
      }
    }
  }),
  withProps<EnhancedProps, ReduxFormProps<Values> & ConnectedProps & Props & IntlProps>(props => ({
    onChangeFI: (event: any, index: number) => {
      const { filist, change } = props
      const value = index ? filist[index - 1] : emptyfi
      change('name', value.name)
      change('web', value.profile.siteURL)
      change('address', formatAddress(value))
      change('fid', value.fid)
      change('org', value.org)
      change('ofx', value.ofx)
    },
    changeIcon: async (favicon?: string) => {
      if (favicon === undefined) {
        // re-download
        props.change('favicon', '')
        const response = await getFavicon(props.web)
        props.change('favicon', response!)
      } else {
        props.change('favicon', favicon)
      }
    }
  }))
)

export const BankForm = enhance((props) => {
  const { handleSubmit, edit, onSubmit, onCancel, onChangeFI, intl: { formatMessage }, filist, online } = props
  const title = edit ? messages.editTitle : messages.createTitle
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <PageHeader>
        <FormattedMessage {...title}/>
      </PageHeader>

      <div className='form-horizontal container-fluid' style={{paddingBottom: 10}}>
        <SelectField
          autofocus
          name='fi'
          label={formatMessage(messages.fi)}
          options={filist}
          labelKey='name'
          valueKey='id'
          onChange={onChangeFI as any}
          help={formatMessage(messages.fiHelp)}
          placeholder={formatMessage(messages.fiPlaceholder)}
        />
        <TextField
          name='name'
          label={formatMessage(messages.name)}
        />
        <TextField
          name='web'
          label={formatMessage(messages.web)}
          addonBefore={
            <InputGroup.Button>
              <IconPicker value={props.favicon} onChange={props.changeIcon}/>
            </InputGroup.Button>
          }
        />
        <MultilineTextField
          name='address'
          rows={4}
          label={formatMessage(messages.address)}
        />
        <MultilineTextField
          name='notes'
          rows={4}
          label={formatMessage(messages.notes)}
        />
        <CheckboxField
          name='online'
          label={formatMessage(messages.online)}
        />
        <Collapse in={online}>
          <div>
            <TextField
              name='username'
              label={formatMessage(messages.username)}
            />
            <TextField
              name='password'
              type='password'
              label={formatMessage(messages.password)}
            />
            <TextField
              name='fid'
              label={formatMessage(messages.fid)}
            />
            <TextField
              name='org'
              label={formatMessage(messages.org)}
            />
            <TextField
              name='ofx'
              label={formatMessage(messages.ofx)}
            />
          </div>
        </Collapse>

        <ButtonToolbar className='pull-right'>
          <Button
            type='button'
            onClick={onCancel}
          >
            <FormattedMessage {...forms.cancel}/>
          </Button>
          <Button
            type='submit'
            bsStyle='primary'
            id='open-dropdown'
          >
            {edit ? (
              <FormattedMessage {...forms.save}/>
            ) : (
              <FormattedMessage {...forms.create}/>
            )}
          </Button>
        </ButtonToolbar>
      </div>
    </form>
  )
})
