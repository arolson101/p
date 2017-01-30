import * as React from 'react'
import { Grid } from 'react-bootstrap'
import { defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName, withProps, onlyUpdateForPropTypes, setPropTypes } from 'recompose'
import { Bank } from '../../docs'
import { AppState, FI, mapDispatchToProps, pushChanges } from '../../state'
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

const enhance = compose<AllProps, {}>(
  setDisplayName('BankCreate'),
  onlyUpdateForPropTypes,
  setPropTypes({}),
  connect<ConnectedProps, DispatchProps, RouteProps<Bank.Params>>(
    (state: AppState): ConnectedProps => ({
      filist: state.fi.list,
      lang: state.i18n.locale,
    }),
    mapDispatchToProps<DispatchProps>({ pushChanges })
  ),
  withProps<EnhancedProps, ConnectedProps & DispatchProps & RouteProps<Bank.Params>>(({router, pushChanges, filist, lang}) => ({
    onCancel: () => {
      router.goBack()
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
