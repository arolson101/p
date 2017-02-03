import * as React from 'react'
import { PageHeader } from 'react-bootstrap'
import { FormattedMessage, defineMessages } from 'react-intl'
import { Link } from 'react-router'
import { Bank, Bill } from '../../docs'
import { RouteProps } from './props'

const messages = defineMessages({
  page: {
    id: 'Home.page',
    defaultMessage: 'Home'
  }
})

type AllProps = RouteProps<any>

export const Home = (props: AllProps) => {
  return (
    <div>
      <PageHeader>
        <FormattedMessage {...messages.page}/>
      </PageHeader>
      <div><Link to={Bank.to.all()}>accounts</Link></div>
      <div><Link to={Bill.to.all()}>bills</Link></div>
    </div>
  )
}
