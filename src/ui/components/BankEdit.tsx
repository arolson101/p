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
import { selectBank } from './selectors'

const messages = defineMessages({
  page: {
    id: 'inUpdate.page',
    defaultMessage: 'Edit'
  }
})

interface ConnectedProps {
  filist: FI[]
  current: CurrentDb
  bank?: Bank.Doc
}

interface EnhancedProps {
  onCancel: () => void
  onSubmit: SubmitFunction<Values>
}

type AllProps = ConnectedProps & EnhancedProps & RouteProps<Bank.Params>

const enhance = compose<AllProps, {}>(
  setDisplayName('BankEdit'),
  onlyUpdateForPropTypes,
  setPropTypes({}),
  connect(
    (state: AppState, props: RouteProps<Bank.Params>): ConnectedProps => ({
      filist: state.fi.list,
      current: state.db.current!,
      bank: selectBank(state, props)
    })
  ),
  withProps(({router}: AllProps): EnhancedProps => ({
    onCancel: () => {
      router.goBack()
    },
    onSubmit: async (values: Values, dispatch: Dispatch<AppState>, props: AllProps) => {
      const { bank, current, filist } = props
      const { fi, username, password, ...newValues } = values
      const doc: Bank.Doc = {
        ...bank,
        ...newValues,

        fi: fi ? filist[fi - 1].name : undefined,
        login: {
          username: username,
          password: password
        }
      }
      await current.db.put(doc)

      router.replace(Bank.to.view(doc))
    }
  }))
)

export const BankEdit = enhance((props) => {
  const { onSubmit, onCancel, bank } = props
  return (
    <div>
      {bank &&
        <Grid>
          <Breadcrumbs {...props} page={messages.page}/>
          <BankForm edit={bank} onSubmit={onSubmit} onCancel={onCancel}/>
        </Grid>
      }
    </div>
  )
})
