import autobind = require('autobind-decorator')
import * as React from 'react'
import { Row, Col } from 'react-bootstrap'
import { defineMessages } from 'react-intl'
import { ReduxFormProps } from 'redux-form'
import { Bank } from '../../docs'
import { FI, emptyfi, CurrentDb } from '../../state'
import { formatAddress } from '../../util'
import { typedFields } from './forms'
import { IntlProps } from './props'

const messages = defineMessages({
  fi: {
    id: 'inForm.fi',
    defaultMessage: 'Institution'
  },
  name: {
    id: 'inForm.name',
    defaultMessage: 'Name'
  },
  web: {
    id: 'inForm.web',
    defaultMessage: 'Website'
  },
  address: {
    id: 'inForm.address',
    defaultMessage: 'Address'
  },
  notes: {
    id: 'inForm.notes',
    defaultMessage: 'Notes'
  },
  online: {
    id: 'inForm.online',
    defaultMessage: 'Online'
  },
  fid: {
    id: 'inForm.fid',
    defaultMessage: 'Fid'
  },
  org: {
    id: 'inForm.org',
    defaultMessage: 'Org'
  },
  ofx: {
    id: 'inForm.ofx',
    defaultMessage: 'OFX Server'
  },
  bankid: {
    id: 'inForm.bankid',
    defaultMessage: 'Routing Number',
    description: `Bank identifier, A-9
      Use of this field by country:
      COUNTRY     Interpretation
      BEL         Bank code
      CAN         Routing and transit number
      CHE         Clearing number
      DEU         Bankleitzahl
      ESP         Entidad
      FRA         Banque
      GBR         Sort code
      ITA         ABI
      NLD         Not used (field contents ignored)
      USA         Routing and transit number`
  },
  username: {
    id: 'inForm.username',
    defaultMessage: 'Username'
  },
  password: {
    id: 'inForm.password',
    defaultMessage: 'Password'
  }
})

interface Props {
  filist: FI[]
  current: CurrentDb
  lang: string
  bank?: Bank
}

type AllProps = IntlProps & Props & ReduxFormProps<Values>

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

export class BankForm extends React.Component<AllProps, any> {
  componentWillMount() {
    this.initializeValues(this.props)
  }

  compontWillReceiveProps(nextProps: AllProps) {
    if (this.props.bank !== nextProps.bank) {
      this.initializeValues(nextProps)
    }
  }

  initializeValues(props: AllProps) {
    const { bank, initialize, filist } = props
    if (bank) {
      const fi = filist.findIndex(fi => fi.name === bank.fi) + 1
      const values = bank ? { ...bank, ...bank.login, fi } : {}
      initialize(values)
    } else {
      initialize({online: true})
    }
  }

  render() {
    const { intl: { formatMessage }, filist } = this.props
    return (
      <div>
        <Row>
          <Col sm={12}>
            <SelectField
              autofocus
              name='fi'
              label={formatMessage(messages.fi)}
              options={filist}
              labelKey='name'
              valueKey='id'
              onChange={this.onChangeFI}
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
        </Row>
        <Row>
          <Col sm={6}>
            <TextField
              name='ofx'
              label={formatMessage(messages.ofx)}
            />
          </Col>
          <Col sm={6}>
            <TextField
              name='bankid'
              label={formatMessage(messages.bankid)}
            />
          </Col>
        </Row>
      </div>
    )
  }

  @autobind
  onChangeFI(index: number) {
    const { filist, change } = this.props
    const value = index ? filist[index - 1] : emptyfi

    change('name', value.name)
    change('web', value.profile.siteURL)
    change('address', formatAddress(value))
    change('fid', value.fid)
    change('org', value.org)
    change('ofx', value.ofx)
  }
}
