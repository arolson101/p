import * as React from 'react'
import { Link } from 'react-router'
import 'react-virtualized/styles.css'
import { Transaction } from '../../docs'

interface ConnectedProps {
  item: Transaction.Doc
}

type AllProps = ConnectedProps

export class TransactionDetail extends React.Component<AllProps, any> {
  render() {
    const { item } = this.props
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
}
