import * as React from 'react'
import { Grid } from 'react-bootstrap'
import { injectIntl, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName, withProps, onlyUpdateForPropTypes, setPropTypes } from 'recompose'
import { Dispatch } from 'redux'
import { DbInfo, Bill } from '../../docs'
import { AppState, FI, CurrentDb } from '../../state'
import { Breadcrumbs } from './breadcrumbs'
import { Values, BillForm, SubmitFunction } from './BillForm'
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

type AllProps = IntlProps & EnhancedProps & ConnectedProps & RouteProps<Bill.Params>

const enhance = compose<AllProps, {}>(
  setDisplayName('BillCreate'),
  onlyUpdateForPropTypes,
  setPropTypes({}),
  injectIntl,
  connect(
    (state: AppState): ConnectedProps => ({
      filist: state.fi.list,
      current: state.db.current!,
      lang: state.i18n.locale,
      dbInfo: selectDbInfo(state)
    })
  ),
  withProps(({router, current, lang}: AllProps): EnhancedProps => ({
    onCancel: () => {
      router.goBack()
    },
    onSubmit: async (values: Values, dispatch: Dispatch<AppState>) => {
      const bill: Bill = {
        ...values
      }
      const doc = Bill.doc(bill, lang)
      await current.db.put(doc)

      router.replace(Bill.to.all())
    }
  }))
)

export const BillCreate = enhance((props) => {
  const { onSubmit, onCancel } = props
  const { bills } = props.current.cache
  const { formatMessage } = props.intl
  return (
    <Grid>
      <Breadcrumbs {...props} page={formatMessage(messages.page)}/>
      <BillForm bills={bills} onSubmit={onSubmit} onCancel={onCancel} />
    </Grid>
  )
})
