import * as React from 'react'
import { FormattedNumber } from 'react-intl'
import { Account } from '../../docs/index'

interface Props {
  amount: number
  account?: Account.View
}

export const CurrencyDisplay = (props: Props) =>
  <span className='pull-right'>
    <FormattedNumber value={props.amount} style='currency' currency='USD'/>
  </span>
