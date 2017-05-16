import * as PropTypes from 'prop-types'
import * as React from 'react'
import { PageHeader, InputGroup, ButtonToolbar, Button } from 'react-bootstrap'
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
import { formMaker, SaveCallback, ChangeCallback } from './forms/createForm'
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
  // online: boolean
  // fi: string
  // web: string
  // favicon: string
}

interface EnhancedProps {
  onChangeFI: (event: any, index: number) => void
  // changeIcon: (favicon?: string) => void
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

const { Form, Text, Password, Url, Select, Checkbox, Collapse } = formMaker<Values>('BankForm')

// const { Text, SelectField, Text, CheckboxField } = typedFields<Values>()
// const formName = 'bankForm'
// const formSelector = formValueSelector<AppState>(formName)

const enhance = compose<AllProps, Props>(
  setDisplayName('BankForm'),
  onlyUpdateForPropTypes,
  setPropTypes({
    edit: PropTypes.object,
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired
  } as PropTypes<Props>),
  injectIntl,
  connect<ConnectedProps, {}, Props & IntlProps>(
    (state: AppState): ConnectedProps => ({
      filist: state.fi.list,
      lang: state.i18n.locale,
      // online: formSelector(state, 'online'),
      // fi: formSelector(state, 'fi'),
      // web: formSelector(state, 'web'),
      // favicon: formSelector(state, 'favicon'),
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
  // reduxForm<ConnectedProps & Props & IntlProps, Values>({
  //   form: formName,
  //   initialValues: {
  //     online: true
  //   }
  // }),
  withPropChangeCallback<ReduxFormProps<Values> & ConnectedProps & Props & IntlProps>('edit', props => {
    const { edit, filist, initialize } = props
    if (edit) {
      const fi = filist.findIndex(fiEntry => fiEntry.name === edit.fi) + 1
      const values = { ...edit, ...edit.login, fi }
      initialize!(values as any)
    }
  }),
  // withPropChangeCallback<EnhancedProps & ReduxFormProps<Values> & ConnectedProps & Props & IntlProps>('web', async (props, prev) => {
  //   const { web, favicon, change } = props
  //   if (web && (favicon === undefined || prev)) { // avoid re-fetching icon
  //     try {
  //       console.log('getting favicon')
  //       change!('favicon', '')
  //       const response = await getFavicon(web)
  //       change!('favicon', response!)
  //     } catch (err) {
  //       console.log('error getting favicon: ', err.message)
  //     }
  //   }
  // }),
  withProps<EnhancedProps, ReduxFormProps<Values> & ConnectedProps & Props & IntlProps>(props => ({
    onChangeFI: (event: any, index: number) => {
      const { filist, change } = props
      const value = index ? filist[index - 1] : emptyfi
      change!('name', value.name)
      change!('web', value.profile.siteURL)
      change!('address', formatAddress(value))
      change!('fid', value.fid)
      change!('org', value.org)
      change!('ofx', value.ofx)
    },
    // changeIcon: async (favicon?: string) => {
    //   if (favicon === undefined) {
    //     // re-download
    //     props.change!('favicon', '')
    //     const response = await getFavicon(props.web)
    //     props.change!('favicon', response!)
    //   } else {
    //     props.change!('favicon', favicon)
    //   }
    // }
  }))
)

export const BankForm = enhance((props) => {
  const { handleSubmit, edit, onSubmit, onCancel, onChangeFI, intl: { formatMessage }, filist } = props
  const title = edit ? messages.editTitle : messages.createTitle
  return (
    <Form
      horizontal
      save={
        onSubmit as any
      }
    >
      <PageHeader>
        <FormattedMessage {...title}/>
      </PageHeader>

      <div className='form-horizontal container-fluid' style={{paddingBottom: 10}}>
        <Select
          autofocus
          name='fi'
          label={messages.fi}
          options={filist}
          labelKey='name'
          valueKey='id'
          onChange={onChangeFI as any}
          help={messages.fiHelp}
          placeholderMessage={messages.fiPlaceholder}
        />
        <Text
          name='name'
          label={messages.name}
        />
        <Url
          name='web'
          favicoName='favicon'
          label={messages.web}
        />
        <Text
          name='address'
          rows={4}
          label={messages.address}
        />
        <Text
          name='notes'
          rows={4}
          label={messages.notes}
        />
        <Checkbox
          name='online'
          label={messages.online}
          message={messages.online}
        />
        <Collapse name='online'>
          <div>
            <Text
              name='username'
              label={messages.username}
            />
            <Password
              name='password'
              label={messages.password}
            />
            <Text
              name='fid'
              label={messages.fid}
            />
            <Text
              name='org'
              label={messages.org}
            />
            <Text
              name='ofx'
              label={messages.ofx}
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
    </Form>
  )
})
