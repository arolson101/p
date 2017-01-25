import * as React from 'react'
import { Breadcrumb } from 'react-bootstrap'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName } from 'recompose'
import { DbInfo, Bank, Account, Transaction } from '../../docs'
import { AppState } from '../../state'
import { RouteProps } from './props'
import { selectDbInfo, selectBank, selectAccount } from './selectors'

const messages = defineMessages({
  home: {
    id: 'Breadcrumbs.home',
    defaultMessage: 'Home'
  },
  accounts: {
    id: 'Breadcrumbs.accounts',
    defaultMessage: 'Accounts'
  }
})

interface Props {
  transaction?: Transaction.Doc
  page?: FormattedMessage.MessageDescriptor
}

interface ConnectedProps {
  dbInfo?: DbInfo.Doc
  bank?: Bank.Doc
  account?: Account.Doc
}

type AllProps = Props & RouteProps<any> & ConnectedProps

const enhance = compose<AllProps, Props>(
  setDisplayName('Breadcrumbs'),
  connect(
    (state: AppState, props: AllProps): ConnectedProps => ({
      dbInfo: selectDbInfo(state),
      bank: selectBank(state, props),
      account: selectAccount(state, props)
  })),
  injectIntl
)

export const Breadcrumbs = enhance((props) => {
  const { router, bank, account, transaction, page } = props

  return (
    <Breadcrumb>
      <Breadcrumb.Item
        active={!bank && !account && !page && !transaction}
        href={router.createHref(DbInfo.to.home())}
      >
        <FormattedMessage {...messages.home}/>
      </Breadcrumb.Item>
      {bank &&
        <Breadcrumb.Item
          href={router.createHref(Bank.to.all())}
        >
          <FormattedMessage {...messages.accounts}/>
        </Breadcrumb.Item>
      }
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
          <FormattedMessage {...page}/>
        </Breadcrumb.Item>
      }
    </Breadcrumb>
  )
})
