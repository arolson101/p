import * as React from 'react'
import { Breadcrumb } from 'react-bootstrap'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName } from 'recompose'
import { DbInfo, Bank, Account, Transaction } from '../../docs'
import { AppState } from '../../state'
import { RouteProps } from './props'
import { selectBank, selectAccount } from './selectors'

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
  bank?: Bank.View
  account?: Account.View
}

type AllProps = Props & RouteProps<Account.Params> & ConnectedProps

const enhance = compose<AllProps, Props>(
  setDisplayName('Breadcrumbs'),
  connect(
    (state: AppState, props: AllProps): ConnectedProps => ({
      bank: props.params.bankId && selectBank(state, props),
      account: props.params.accountId && selectAccount(state, props)
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
          href={router.createHref(Bank.to.view(bank.doc))}
        >
          {bank.doc.name}
        </Breadcrumb.Item>
      }
      {account &&
        <Breadcrumb.Item
          active={!page && !transaction}
          href={router.createHref(Account.to.view(account.doc))}
        >
          {account.doc.name}
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
