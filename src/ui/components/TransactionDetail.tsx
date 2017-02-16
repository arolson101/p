import * as React from 'react'
import { Link } from 'react-router'
import 'react-virtualized/styles.css'
import { Transaction } from '../../docs/index'

interface ConnectedProps {
  item: Transaction.View
}

type AllProps = ConnectedProps

export class TransactionDetail extends React.Component<AllProps, any> {
  render () {
    const { item } = this.props
    return (
      <div>
        serverid: {item.doc.serverid}<br/>
        name: {item.doc.name}<br/>
        memo: {item.doc.memo}<br/>
        amount: {item.doc.amount}<br/>
        <div><Link to={Transaction.to.edit(item.doc)}>edit</Link></div>
      </div>
    )
  }
}
