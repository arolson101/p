import * as React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { compose, setDisplayName, withProps, onlyUpdateForPropTypes, setPropTypes } from 'recompose'
import { Bank } from '../../docs/index'
import { AppState, FI, mapDispatchToProps, pushChanges } from '../../state/index'
import { Values, BankForm, SubmitFunction } from './BankForm'
import { RouteProps } from './props'

interface ConnectedProps {
  filist: FI[]
  lang: string
}

interface DispatchProps {
  pushChanges: pushChanges.Fcn
}

interface EnhancedProps {
  onCancel: () => void
  onSubmit: SubmitFunction<Values>
}

type AllProps = EnhancedProps & ConnectedProps & DispatchProps & RouteProps<Bank.Params>

const enhance = compose<AllProps, void>(
  setDisplayName('BankCreate'),
  onlyUpdateForPropTypes,
  setPropTypes({}),
  withRouter,
  connect<ConnectedProps, DispatchProps, RouteProps<Bank.Params>>(
    (state: AppState): ConnectedProps => ({
      filist: state.fi.list,
      lang: state.i18n.locale,
    }),
    mapDispatchToProps<DispatchProps>({ pushChanges })
  ),
  withProps<EnhancedProps, ConnectedProps & DispatchProps & RouteProps<Bank.Params>>(({history, pushChanges, filist, lang}) => ({
    onCancel: () => {
      history.goBack()
    },
    onSubmit: async (values: Values) => {
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
      await pushChanges({docs: [doc]})

      history.replace(Bank.to.view(doc))
    }
  }))
)

export const BankCreate = enhance((props) => {
  const { onSubmit, onCancel } = props
  return (
    <BankForm onSubmit={onSubmit} onCancel={onCancel} />
  )
})
