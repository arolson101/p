import * as React from 'react'
import { Row, Col, Collapse, ButtonToolbar, Button } from 'react-bootstrap'
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName, withProps, onlyUpdateForPropTypes, setPropTypes } from 'recompose'
import { reduxForm, formValueSelector, ReduxFormProps, SubmitFunction } from 'redux-form'
import { Bank } from '../../docs'
import { Validator } from '../../util'
import { AppState, FI, emptyfi, CurrentDb } from '../../state'
import { withPropChangeCallback } from '../enhancers'
import { formatAddress } from '../../util'
import { typedFields, forms } from './forms'
import { IntlProps } from './props'

export { SubmitFunction }

const messages = defineMessages({
  fi: {
    id: 'bankForm.fi',
    defaultMessage: 'Institution'
  },
  fiHelp: {
    id: 'bankForm.fiHelp',
    defaultMessage: 'Choose a financial institution from the list or fill in the details below'
  },
  fiPlaceholder: {
    id: 'bankForm.fiPlaceholder',
    defaultMessage: 'Select financial institution...'
  },
  name: {
    id: 'bankForm.name',
    defaultMessage: 'Name'
  },
  web: {
    id: 'bankForm.web',
    defaultMessage: 'Website'
  },
  address: {
    id: 'bankForm.address',
    defaultMessage: 'Address'
  },
  notes: {
    id: 'bankForm.notes',
    defaultMessage: 'Notes'
  },
  online: {
    id: 'bankForm.online',
    defaultMessage: 'Online'
  },
  fid: {
    id: 'bankForm.fid',
    defaultMessage: 'Fid'
  },
  org: {
    id: 'bankForm.org',
    defaultMessage: 'Org'
  },
  ofx: {
    id: 'bankForm.ofx',
    defaultMessage: 'OFX Server'
  },
  username: {
    id: 'bankForm.username',
    defaultMessage: 'Username'
  },
  password: {
    id: 'bankForm.password',
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
  current: CurrentDb
  lang: string
  online: boolean
}

interface EnhancedProps {
  onChangeFI: (index: number) => void
}

type AllProps = IntlProps & EnhancedProps & ConnectedProps & Props & ReduxFormProps<Values>

export interface Values {
  fi: number

  name: string
  web: string
  address: string
  notes: string
  bankid: string

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
  setDisplayName('AccountForm'),
  onlyUpdateForPropTypes,
  setPropTypes({
    edit: React.PropTypes.object,
    onSubmit: React.PropTypes.func.isRequired,
    onCancel: React.PropTypes.func.isRequired
  } as PropTypes<Props>),
  injectIntl,
  connect(
    (state: AppState): ConnectedProps => ({
      filist: state.fi.list,
      current: state.db.current!,
      lang: state.i18n.locale,
      online: formSelector(state, 'online')
    })
  ),
  withProps(({onSubmit}) => ({
    onSubmit: async (values: Values, dispatch: any, props: AllProps) => {
      const { intl: { formatMessage } } = props
      const v = new Validator(values)
      v.required(['name'], formatMessage(forms.required))
      v.maybeThrowSubmissionError()
      return onSubmit(values, dispatch, props)
    }
  })),
  reduxForm<AllProps, Values>({
    form: formName,
    initialValues: {
      online: true
    }
  }),
  withPropChangeCallback('edit', (props: AllProps) => {
    const { edit, filist, initialize, reset } = props
    if (edit) {
      const fi = filist.findIndex(fi => fi.name === edit.fi) + 1
      const values = { ...edit, ...edit.login, fi }
      initialize(values, false)
      reset()
    }
  }),
  withProps((props: AllProps) => ({
    onChangeFI: (index: number) => {
      const { filist, change } = props
      const value = index ? filist[index - 1] : emptyfi

      change('name', value.name)
      change('web', value.profile.siteURL)
      change('address', formatAddress(value))
      change('fid', value.fid)
      change('org', value.org)
      change('ofx', value.ofx)
    }
  }))
)

export const BankForm = enhance((props) => {
const { handleSubmit, edit, onSubmit, onCancel, onChangeFI, intl: { formatMessage }, filist, online } = props
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Row>
        <Col sm={12}>
          <SelectField
            autofocus
            name='fi'
            label={formatMessage(messages.fi)}
            options={filist}
            labelKey='name'
            valueKey='id'
            onChange={onChangeFI}
            help={formatMessage(messages.fiHelp)}
            placeholder={formatMessage(messages.fiPlaceholder)}
          />
        </Col>
      </Row>
      <Row>
        <Col sm={6}>
          <TextField
            name='name'
            label={formatMessage(messages.name)}
          />
        </Col>
        <Col sm={6}>
          <TextField
            name='web'
            label={formatMessage(messages.web)}
          />
        </Col>
      </Row>
      <Row>
        <Col sm={6}>
          <MultilineTextField
            name='address'
            rows={4}
            label={formatMessage(messages.address)}
          />
        </Col>
        <Col sm={6}>
          <MultilineTextField
            name='notes'
            rows={4}
            label={formatMessage(messages.notes)}
          />
        </Col>
      </Row>
      <Row>
        <Col sm={12}>
          <CheckboxField
            name='online'
            label={formatMessage(messages.online)}
          />
        </Col>
      </Row>
      <Collapse in={online}>
        <div>
          <Row>
            <Col sm={6} xs={6}>
              <TextField
                name='username'
                label={formatMessage(messages.username)}
              />
            </Col>
            <Col sm={6} xs={6}>
              <TextField
                name='password'
                type='password'
                label={formatMessage(messages.password)}
              />
            </Col>
          </Row>
          <Row>
            <Col sm={3} xs={6}>
              <TextField
                name='fid'
                label={formatMessage(messages.fid)}
              />
            </Col>
            <Col sm={3} xs={6}>
              <TextField
                name='org'
                label={formatMessage(messages.org)}
              />
            </Col>
            <Col sm={6} xs={12}>
              <TextField
                name='ofx'
                label={formatMessage(messages.ofx)}
              />
            </Col>
          </Row>
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
    </form>
  )
})