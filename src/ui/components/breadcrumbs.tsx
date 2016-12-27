import * as React from 'react'
import { Breadcrumb } from 'react-bootstrap'
import { DbInfo, Bank, Account } from '../../docs'
import { RouteProps } from './props'

interface Props {
  dbInfo?: DbInfo.Doc
  bank?: Bank.Doc
  account?: Account.Doc
  page?: string
}

type AllProps = Props & RouteProps<any>

export const Breadcrumbs = (props: AllProps) => {
  const { router, dbInfo, bank, account, page } = props

  return (
    <Breadcrumb>
      {dbInfo &&
        <Breadcrumb.Item
          active={!bank && !account && !page}
          href={router.createHref(DbInfo.to.read(dbInfo))}
        >
          {dbInfo.title}
        </Breadcrumb.Item>
      }
      {bank &&
        <Breadcrumb.Item
          active={!account && !page}
          href={router.createHref(Bank.to.read(bank))}
        >
          {bank.name}
        </Breadcrumb.Item>
      }
      {account &&
        <Breadcrumb.Item
          active={!page}
          href={router.createHref(Account.to.read(account))}
        >
          {account.name}
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
