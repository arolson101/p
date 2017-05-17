import * as PropTypes from 'prop-types'
import * as React from 'react'
import { PageHeader, InputGroup, ButtonToolbar, Button } from 'react-bootstrap'
import { defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName, withProps, onlyUpdateForPropTypes, setPropTypes } from 'recompose'
import { reduxForm, formValueSelector } from 'redux-form'
import { getFavicon } from '../../actions/index'
import { Bank } from '../../docs/index'
import { Validator } from '../../util/index'
import { AppState, FI, emptyfi, mapDispatchToProps } from '../../state/index'
import { withPropChangeCallback } from '../enhancers/index'
import { formatAddress } from '../../util/index'
import { typedFields, forms } from './forms/index'
import { formMaker, SubmitHandler, ChangeCallback } from './forms/createForm'
import { IconPicker } from './forms/IconPicker'

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
  onSubmit: SubmitHandler<Values>
  onCancel: () => void
}

interface ConnectedProps {
  filist: FI[]
  lang: string
}

interface DispatchProps {
  change: typeof actions.change
  initialize: typeof actions.initialize
}

interface EnhancedProps {
  onChangeFI: (event: any, index: number) => void
}

type AllProps = EnhancedProps & ConnectedProps & Props

export type SubmitFunction<V> = SubmitHandler<V>

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

const { Form, Text, Password, Url, Select, Checkbox, Collapse, actions } = formMaker<Values>('BankForm')

const enhance = compose<AllProps, Props>(
  setDisplayName('BankForm'),
  onlyUpdateForPropTypes,
  setPropTypes<Props>({
    edit: PropTypes.object,
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired
  }),
  connect<ConnectedProps, DispatchProps, Props>(
    (state: AppState): ConnectedProps => ({
      filist: state.fi.list,
      lang: state.i18n.locale,
    }),
    mapDispatchToProps<DispatchProps>({
      change: actions.change,
      initialize: actions.initialize
    })
  ),
  withProps<EnhancedProps, DispatchProps & ConnectedProps & Props>(props => ({
    onChangeFI: (event: any, index: number) => {
      const { filist, change } = props
      const value = index ? filist[index - 1] : emptyfi
      change('name', value.name)
      change('web', value.profile.siteURL)
      change('favicon', '')
      change('address', formatAddress(value))
      change('fid', value.fid)
      change('org', value.org)
      change('ofx', value.ofx)
    },
  }))
)

export const BankForm = enhance((props) => {
  const { edit, onSubmit, onCancel, onChangeFI, filist } = props
  const title = edit ? messages.editTitle : messages.createTitle

  const fi = edit ? filist.findIndex(fiEntry => fiEntry.name === edit.fi) + 1 : -1
  const initialValues = edit ? { ...edit, ...edit.login, fi } : {}

  return (
    <Form
      initialValues={initialValues}
      horizontal
      onSubmit={onSubmit}
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
