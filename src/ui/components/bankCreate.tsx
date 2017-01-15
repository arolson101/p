import * as React from 'react'
import { Grid } from 'react-bootstrap'
import { injectIntl, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName, withProps } from 'recompose'
import { Dispatch } from 'redux'
import { DbInfo, Bank } from '../../docs'
import { AppState, FI, CurrentDb } from '../../state'
import { Breadcrumbs } from './breadcrumbs'
import { Values, BankForm, SubmitFunction } from './bankForm'
import { IntlProps, RouteProps } from './props'
import { selectDbInfo } from './selectors'

const messages = defineMessages({
  page: {
    id: 'inCreate.page',
    defaultMessage: 'Add Institution'
  }
})

interface ConnectedProps {
  filist: FI[]
  current: CurrentDb
  lang: string
  dbInfo?: DbInfo.Doc
}

interface EnhancedProps {
  onCancel: () => void
  onSubmit: SubmitFunction<Values>
}

type AllProps = IntlProps & EnhancedProps & ConnectedProps & RouteProps<Bank.Params>

const enhance = compose<AllProps, {}>(
  setDisplayName('BankCreate'),
  injectIntl,
  connect(
    (state: AppState): ConnectedProps => ({
      filist: state.fi.list,
      current: state.db.current!,
      lang: state.i18n.locale,
      dbInfo: selectDbInfo(state)
    })
  ),
  withProps(({router}: AllProps): EnhancedProps => ({
    onCancel: () => {
      router.goBack()
    },
    onSubmit: async (values: Values, dispatch: Dispatch<AppState>, props: AllProps) => {
      const { current, filist, lang } = props
      const { fi, username, password, ...newValues } = values
      const bank: Bank = {
        ...newValues,

        fi: fi ? filist[fi - 1].name : undefined,
        login: {
          username: username,
          password: password
        },
        accounts: []
      }
      const doc = Bank.doc(bank, lang)
      await current.db.put(doc)

      props.router.replace(Bank.to.view(doc))
    }
  }))
)

export const BankCreate = enhance((props) => {
  const { onSubmit, onCancel } = props
  const { formatMessage } = props.intl
  return (
    <Grid>
      <Breadcrumbs {...props} page={formatMessage(messages.page)}/>
      <BankForm onSubmit={onSubmit} onCancel={onCancel} />
    </Grid>
  )
})
