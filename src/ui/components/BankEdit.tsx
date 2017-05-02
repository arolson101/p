import * as React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { compose, setDisplayName, withProps, onlyUpdateForPropTypes, setPropTypes } from 'recompose'
import { Bank } from '../../docs/index'
import { AppState, FI, pushChanges, mapDispatchToProps } from '../../state/index'
import { Values, BankForm, SubmitFunction } from './BankForm'
import { RouteProps } from './props'
import { selectBank } from './selectors'

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

const enhance = compose<AllProps, void>(
  setDisplayName('BankEdit'),
  onlyUpdateForPropTypes,
  setPropTypes({}),
  withRouter,
  connect<ConnectedProps, DispatchProps, RouteProps<Bank.Params>>(
    (state: AppState, props) => ({
      filist: state.fi.list,
      bank: selectBank(state, props)
    }),
    mapDispatchToProps<DispatchProps>({ pushChanges })
  ),
  withProps<EnhancedProps, ConnectedProps & DispatchProps & RouteProps<Bank.Params>>(
    ({history, bank, pushChanges, filist}) => ({
      onCancel: () => {
        history.goBack()
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

        history.replace(Bank.to.view(doc))
      }
    })
  )
)

export const BankEdit = enhance((props) => {
  const { onSubmit, onCancel, bank } = props
  return (
    <BankForm edit={bank.doc} onSubmit={onSubmit} onCancel={onCancel}/>
  )
})
