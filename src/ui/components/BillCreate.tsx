import * as React from 'react'
import { Grid } from 'react-bootstrap'
import { defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName, withProps, onlyUpdateForPropTypes, setPropTypes } from 'recompose'
import { Bill } from '../../docs'
import { pushChanges, mapDispatchToProps } from '../../state'
import { Breadcrumbs } from './Breadcrumbs'
import { BillForm, SubmitFunction } from './BillForm'
import { RouteProps } from './props'

const messages = defineMessages({
  page: {
    id: 'BillCreate.page',
    defaultMessage: 'Add Bill'
  }
})

interface DispatchProps {
  pushChanges: pushChanges.Fcn
}

interface EnhancedProps {
  onCancel: () => void
  onSubmit: SubmitFunction<Bill.Doc>
}

type AllProps = EnhancedProps & RouteProps<Bill.Params>

const enhance = compose<AllProps, {}>(
  setDisplayName('BillCreate'),
  onlyUpdateForPropTypes,
  setPropTypes({}),
  connect<{}, DispatchProps, RouteProps<Bill.Params>>(
    () => ({}),
    mapDispatchToProps<DispatchProps>({ pushChanges })
  ),
  withProps<EnhancedProps, DispatchProps & RouteProps<Bill.Params>>(
    ({router, pushChanges}) => ({
      onCancel: () => {
        router.goBack()
      },
      onSubmit: async (doc: Bill.Doc) => {
        await pushChanges({docs: [doc]})
        router.replace(Bill.to.all())
      }
    })
  )
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
