import * as React from 'react'
import { defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName, withProps, onlyUpdateForPropTypes, setPropTypes } from 'recompose'
import { Bank } from '../../docs'
import { AppState, FI, pushChanges, mapDispatchToProps } from '../../state'
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
  bank: Bank.View
}

interface DispatchProps {
  pushChanges: pushChanges.Fcn
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
  connect<ConnectedProps, DispatchProps, RouteProps<Bank.Params>>(
    (state: AppState, props) => ({
      filist: state.fi.list,
      bank: selectBank(state, props)
    }),
    mapDispatchToProps<DispatchProps>({ pushChanges })
  ),
  withProps<EnhancedProps, ConnectedProps & DispatchProps & RouteProps<Bank.Params>>(
    ({router, bank, pushChanges, filist}) => ({
      onCancel: () => {
        router.goBack()
      },
      onSubmit: async (values: Values) => {
        const { fi, username, password, ...newValues } = values
        const doc: Bank.Doc = {
          ...bank.doc,
          ...newValues,

          fi: fi ? filist[fi - 1].name : undefined,
          login: {
            username: username,
            password: password
          }
        }
        await pushChanges({docs: [doc]})

        router.replace(Bank.to.view(doc))
      }
    })
  )
)

export const BankEdit = enhance((props) => {
  const { onSubmit, onCancel, bank } = props
  return (
    <BankForm show={true} title={messages.page} edit={bank.doc} onSubmit={onSubmit} onCancel={onCancel}/>
  )
})
