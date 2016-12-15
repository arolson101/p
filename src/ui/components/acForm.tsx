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
}

const { TextField, SelectField } = typedFields<Values>()

export class AcForm extends React.Component<AllProps, any> {

  static validate( v: Validator<Values>, props: IntlProps,otherNames: string[], otherNumbers: string[]) {
    const { formatMessage } = props.intl
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
    <i className={Account.icons[option.value]}/>
    {' '}
    <FormattedMessage {...(Account.messages as any)[Account.Type[option.value]]}/>
  </span>
