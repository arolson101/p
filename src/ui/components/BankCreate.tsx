import * as React from 'react'
import { Grid } from 'react-bootstrap'
import { defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName, withProps, onlyUpdateForPropTypes, setPropTypes } from 'recompose'
import { Dispatch } from 'redux'
import { Bank } from '../../docs'
import { AppState, FI, CurrentDb } from '../../state'
import { Breadcrumbs } from './Breadcrumbs'
import { Values, BankForm, SubmitFunction } from './BankForm'
import { RouteProps } from './props'

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
}

interface EnhancedProps {
  onCancel: () => void
  onSubmit: SubmitFunction<Values>
}

type AllProps = EnhancedProps & ConnectedProps & RouteProps<Bank.Params>

const enhance = compose<AllProps, {}>(
  setDisplayName('BankCreate'),
  onlyUpdateForPropTypes,
  setPropTypes({}),
  connect(
    (state: AppState): ConnectedProps => ({
      filist: state.fi.list,
      current: state.db.current!,
      lang: state.i18n.locale,
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

      router.replace(Bank.to.view(doc))
    }
  }))
)

export const BankCreate = enhance((props) => {
  const { onSubmit, onCancel } = props
  return (
    <Grid>
      <Breadcrumbs {...props} page={messages.page}/>
      <BankForm onSubmit={onSubmit} onCancel={onCancel} />
    </Grid>
  )
})