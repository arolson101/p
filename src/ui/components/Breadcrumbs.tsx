import * as React from 'react'
import { Breadcrumb } from 'react-bootstrap'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { compose, setDisplayName, onlyUpdateForPropTypes, setPropTypes } from 'recompose'
import { DbInfo, Bank, Account, Transaction } from '../../docs'
import { AppState } from '../../state'
import { RouteProps } from './props'
import { selectBank, selectAccount, selectTransaction } from './selectors'

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
  page?: FormattedMessage.MessageDescriptor
}

interface ConnectedProps {
  bank?: Bank.View
  account?: Account.View
  transaction?: Transaction.View
}

type AllProps = Props & RouteProps<Transaction.Params> & ConnectedProps

const enhance = compose<AllProps, Props>(
  setDisplayName('Breadcrumbs'),
  withRouter,
  onlyUpdateForPropTypes,
  setPropTypes({
    page: React.PropTypes.object
  } as PropTypes<Props>),
  connect<ConnectedProps, {}, RouteProps<Transaction.Params> & Props>(
    (state: AppState, props) => ({
      bank: props && props.params.bankId ? selectBank(state, props) : undefined,
      account: props && props.params.accountId ? selectAccount(state, props) : undefined,
      transaction: props && props.params.txId ? selectTransaction(state, props) : undefined
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
          href={router.createHref(Transaction.to.view(transaction.doc))}
        >
          {transaction.doc.name}
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
