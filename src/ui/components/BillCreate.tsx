import * as React from 'react'
import { Grid } from 'react-bootstrap'
import { defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName, withProps, onlyUpdateForPropTypes, setPropTypes } from 'recompose'
import { Dispatch } from 'redux'
import { DbInfo, Bill } from '../../docs'
import { AppState, FI, CurrentDb } from '../../state'
import { Breadcrumbs } from './Breadcrumbs'
import { BillForm, SubmitFunction } from './BillForm'
import { RouteProps } from './props'
import { selectDbInfo } from './selectors'

const messages = defineMessages({
  page: {
    id: 'BillCreate.page',
    defaultMessage: 'Add Bill'
  }
})

interface ConnectedProps {
  filist: FI[]
  current: CurrentDb
  dbInfo?: DbInfo
}

interface EnhancedProps {
  onCancel: () => void
  onSubmit: SubmitFunction<Bill.Doc>
}

type AllProps = EnhancedProps & ConnectedProps & RouteProps<Bill.Params>

const enhance = compose<AllProps, {}>(
  setDisplayName('BillCreate'),
  onlyUpdateForPropTypes,
  setPropTypes({}),
  connect(
    (state: AppState): ConnectedProps => ({
      filist: state.fi.list,
      current: state.db.current!,
      dbInfo: selectDbInfo(state)
    })
  ),
  withProps(({router, current}: AllProps): EnhancedProps => ({
    onCancel: () => {
      router.goBack()
    },
    onSubmit: async (doc: Bill.Doc, dispatch: Dispatch<AppState>) => {
      await current.db.put(doc)
      router.replace(Bill.to.all())
    }
  }))
)

export const BillCreate = enhance((props) => {
  const { onSubmit, onCancel } = props
  return (
    <Grid>
      <Breadcrumbs {...props} page={messages.page}/>
      <BillForm onSubmit={onSubmit} onCancel={onCancel} />
    </Grid>
  )
})
