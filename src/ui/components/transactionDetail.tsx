import * as React from 'react'
import { Link } from 'react-router'
import 'react-virtualized/styles.css'
import { Transaction } from '../../docs'

interface ConnectedProps {
  transaction: Transaction.Doc
}

type AllProps = ConnectedProps

export class TransactionDetail extends React.Component<AllProps, any> {
  render() {
    const { transaction } = this.props
    return (
      <div>
        serverid: {transaction.serverid}<br/>
        name: {transaction.name}<br/>
        memo: {transaction.memo}<br/>
        amount: {transaction.amount}<br/>
        <div><Link to={Transaction.to.edit(transaction)}>edit</Link></div>
      </div>
    )
  }
}
