import * as React from 'react'
import { Breadcrumb } from 'react-bootstrap'
import { DbInfo, Bank, Account, Transaction } from '../../docs'
import { RouteProps } from './props'

interface Props {
  bank?: Bank.Doc
  account?: Account.Doc
  transaction?: Transaction.Doc
  page?: string
}

type AllProps = Props & RouteProps<any>

export const Breadcrumbs = (props: AllProps) => {
  const { router, bank, account, transaction, page } = props

  return (
    <Breadcrumb>
      <Breadcrumb.Item
        active={!bank && !account && !page && !transaction}
        href={router.createHref(DbInfo.to.home())}
      >
        home
      </Breadcrumb.Item>
      {bank &&
        <Breadcrumb.Item
          active={!account && !page && !transaction}
          href={router.createHref(Bank.to.view(bank))}
        >
          {bank.name}
        </Breadcrumb.Item>
      }
      {account &&
        <Breadcrumb.Item
          active={!page && !transaction}
          href={router.createHref(Account.to.view(account))}
        >
          {account.name}
        </Breadcrumb.Item>
      }
      {transaction &&
        <Breadcrumb.Item
          active={!page}
          href={router.createHref(Transaction.to.view(transaction))}
        >
          {transaction.name}
        </Breadcrumb.Item>
      }
      {page &&
        <Breadcrumb.Item active>
          {page}
        </Breadcrumb.Item>
      }
    </Breadcrumb>
  )
}
