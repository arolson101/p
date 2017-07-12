import * as React from 'react'
import { Link } from 'react-router-dom'
import 'react-virtualized/styles.css'
import { Transaction } from '../../docs/index'

interface Props {
  item: Transaction.Doc
}

export const TransactionDetail = (props: Props) => {
  const { item } = props
  return (
    <div>
      serverid: {item.serverid}<br/>
      name: {item.name}<br/>
      memo: {item.memo}<br/>
      amount: {item.amount}<br/>
      <div><Link to={Transaction.to.edit(item)}>edit</Link></div>
    </div>
  )
}
