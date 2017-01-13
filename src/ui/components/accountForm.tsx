import { Col } from 'react-bootstrap'
import * as React from 'react'
import { defineMessages, FormattedMessage } from 'react-intl'
import { ReduxFormProps } from 'redux-form'
import { Account } from '../../docs'
import { Validator } from '../../util'
import { typedFields } from './forms'
import { IntlProps } from './props'

const messages = defineMessages({
  name: {
    id: 'acForm.name',
    defaultMessage: 'Account Name'
  },
  number: {
    id: 'acForm.number',
    defaultMessage: 'Account Number'
  },
  type: {
    id: 'acForm.type',
    defaultMessage: 'Account Type'
  },
  uniqueName: {
    id: 'acForm.uniqueName',
    defaultMessage: 'This account name is already used'
  },
  uniqueNumber: {
    id: 'acForm.uniqueNumber',
    defaultMessage: 'This account number is already used'
  },
  bankid: {
    id: 'bankForm.bankid',
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
  }
})

interface Props {
  account?: Account
}

type AllProps = Props & IntlProps & ReduxFormProps<Values>

export interface Values {
  name: string
  number: string
  type: Account.Type
  bankid: string
}

const { TextField, SelectField } = typedFields<Values>()

export class AccountForm extends React.Component<AllProps, any> {

  static validate(v: Validator<Values>, props: IntlProps, otherAccounts: Account.Doc[]) {
    const { formatMessage } = props.intl
    const otherNames = otherAccounts.map(acct => acct.name)
    const otherNumbers = otherAccounts.filter(acct => acct.type === v.values.type).map(acct => acct.number)
    v.unique('name', otherNames, formatMessage(messages.uniqueName))
    v.unique('number', otherNumbers, formatMessage(messages.uniqueNumber))
  }

  componentWillMount() {
    this.initializeValues(this.props)
  }

  compontWillReceiveProps(nextProps: AllProps) {
    if (this.props.account !== nextProps.account) {
      this.initializeValues(nextProps)
    }
  }

  initializeValues(props: AllProps) {
    const { account, initialize } = props
    if (account) {
      const values = account
      initialize(values)
    } else {
      initialize({})
    }
  }

  render() {
    const { formatMessage } = this.props.intl
    return (
      <div>
        <Col>
          <TextField
            name='name'
            autoFocus
            label={formatMessage(messages.name)}
          />
        </Col>
        <Col>
          <TextField
            name='number'
            label={formatMessage(messages.number)}
          />
        </Col>
        <Col>
          <SelectField
            name='type'
            options={typeOptions}
            clearable={false}
            optionRenderer={accountTypeRenderer}
            valueRenderer={accountTypeRenderer}
            label={formatMessage(messages.type)}
          />
        </Col>
        <Col>
          <TextField
            name='bankid'
            label={formatMessage(messages.bankid)}
          />
        </Col>
      </div>
    )
  }
}

const typeOptions = Object
  .keys(Account.Type)
  .map(type => ({
    value: type,
    label: type
  }))

const accountTypeRenderer = (option: {value: Account.Type, label: string}) =>
  <span>
    <FormattedMessage {...(Account.messages as any)[Account.Type[option.value]]}/>
  </span>
