import { Col } from 'react-bootstrap'
import * as React from 'react'
import { defineMessages } from 'react-intl'
import { ReduxFormProps } from 'redux-form'
import { Account } from '../../docs'
import { Validator } from '../../util'
import { forms, typedFields } from './forms'
import { IntlProps } from './props'

const messages = defineMessages({
  name: {
    id: 'acUpdate.name',
    defaultMessage: 'Account Name'
  },
  number: {
    id: 'acUpdate.number',
    defaultMessage: 'Account Number'
  },
  uniqueName: {
    id: 'acCreate.uniqueName',
    defaultMessage: 'This account name is already used'
  },
  uniqueNumber: {
    id: 'acCreate.uniqueNumber',
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
}

const { TextField } = typedFields<Values>()

export class AcForm extends React.Component<AllProps, any> {

  static validate( v: Validator<Values>, props: IntlProps,otherNames: string[], otherNumbers: string[]) {
    const { formatMessage } = props.intl
    v.required(['name', 'number'], formatMessage(forms.required))
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
      </div>
    )
  }
}
