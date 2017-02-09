import * as React from 'react'
import { Button } from 'react-bootstrap'
import { defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName, withHandlers, onlyUpdateForPropTypes, setPropTypes } from 'recompose'
import ui, { ReduxUIProps } from 'redux-ui'
import { AppState, pushChanges, mapDispatchToProps, deleteDoc } from '../../state'
import { Budget } from '../../docs'
import { withPropChangeCallback } from '../enhancers'
import { BudgetForm, SubmitFunction } from './BudgetForm'

const messages = defineMessages({
  page: {
    id: 'BudgetDetail.page',
    defaultMessage: 'Edit Budget'
  }
})

interface Props {
  item: Budget.View
}

interface DispatchProps {
  pushChanges: pushChanges.Fcn
}

interface MappedProps {
  date: Date
}

interface UIState {
  editing: boolean
}

interface EnhancedProps {
  startEdit: () => void
  cancelEdit: () => void
  deleteMe: () => void
  saveEdit: SubmitFunction<Budget.Doc>
}

type AllProps = Props & ReduxUIProps<UIState> & DispatchProps & EnhancedProps

const enhance = compose<AllProps, Props>(
  setDisplayName('BudgetDetail'),
  onlyUpdateForPropTypes,
  setPropTypes({
    item: React.PropTypes.object.isRequired
  }),
  connect<{}, DispatchProps, Props>(
    (state: AppState) => ({}),
    mapDispatchToProps<DispatchProps>({ pushChanges })
  ),
  ui<UIState, Props, {}>({
    key: 'BudgetDetail',
    persist: true,
    state: {
      editing: false
    } as UIState
  }),
  withHandlers<EnhancedProps, ReduxUIProps<UIState> & MappedProps & DispatchProps & Props>({
    startEdit: ({updateUI}) => () => {
      updateUI({editing: true})
    },
    cancelEdit: ({updateUI}) => () => {
      updateUI({editing: false})
    },
    saveEdit: ({updateUI, pushChanges}) => async (doc: Budget.Doc) => {
      await pushChanges({ docs: [doc] })
      updateUI({editing: false})
    },
    deleteMe: ({item, pushChanges}) => () => {
      pushChanges({docs: [deleteDoc(item.doc)]})
    }
  }),
  withPropChangeCallback<EnhancedProps & ReduxUIProps<UIState> & MappedProps & DispatchProps & Props>(
    'item',
    ({updateUI}) => {
      updateUI({editing: false})
    }
  )
)

export const BudgetDetail = enhance(({ui: { editing }, item, startEdit, saveEdit, cancelEdit, deleteMe}) => {

  return <div>
    name: {item.doc.name}<br/>
    group: {item.doc.group}<br/>
    <Button onClick={startEdit}>edit</Button>
    <Button onClick={deleteMe}>delete</Button>

    <BudgetForm show={editing} title={messages.page} edit={item} onSubmit={saveEdit} onCancel={cancelEdit} />
  </div>
})
