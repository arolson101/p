import * as React from 'react'
import { Link } from 'react-router-dom'
import 'react-virtualized/styles.css'
import { Transaction } from '../../docs/index'

interface Props {
  item: Transaction.View
}

export class TransactionDetail extends React.Component<Props, any> {
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
