import * as React from 'react'
import { FormattedNumber } from 'react-intl'
import { Account } from 'core/docs'

interface Props {
  amount: number
  account?: Account.Doc
}

export const CurrencyDisplay = (props: Props) =>
  <span className='pull-right'>
    <FormattedNumber value={props.amount} style='currency' currency='USD'/>
  </span>
