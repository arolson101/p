import * as React from 'react'
import { Button } from 'react-bootstrap'
import { FormattedDate } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName, withState, withHandlers, mapProps, onlyUpdateForPropTypes, setPropTypes } from 'recompose'
import { AppState, pushChanges, mapDispatchToProps, deleteDoc } from '../../state'
import { Bill } from '../../docs'
import { withPropChangeCallback } from '../enhancers'
import { BillForm, SubmitFunction } from './BillForm'

interface Props {
  item: Bill.View
}

interface DispatchProps {
  pushChanges: pushChanges.Fcn
}

interface MappedProps {
  date: Date
}

interface State {
  editing: boolean
  setEditing: (editing: boolean) => void
}

interface EnhancedProps {
  startEdit: () => void
  cancelEdit: () => void
  deleteMe: () => void
  saveEdit: SubmitFunction<Bill.Doc>
}

type AllProps = Props & State & DispatchProps & EnhancedProps

const enhance = compose<AllProps, Props>(
  setDisplayName('BillDetail'),
  onlyUpdateForPropTypes,
  setPropTypes({}),
  connect<{}, DispatchProps, Props>(
    (state: AppState) => ({}),
    mapDispatchToProps<DispatchProps>({ pushChanges })
  ),
  mapProps<MappedProps, DispatchProps & Props>(props => ({
    ...props,
    date: Bill.getDate(props.item)
  })),
  withState('editing', 'setEditing', false),
  withHandlers<EnhancedProps, State & MappedProps & DispatchProps & Props>({
    startEdit: ({setEditing}) => () => {
      setEditing(true)
    },
    cancelEdit: ({setEditing}) => () => {
      setEditing(false)
    },
    saveEdit: ({setEditing, pushChanges}) => async (doc: Bill.Doc) => {
      await pushChanges({ docs: [doc] })
      setEditing(false)
    },
    deleteMe: ({item, pushChanges}) => () => {
      pushChanges({docs: [deleteDoc(item.doc)]})
    }
  }),
  withPropChangeCallback<EnhancedProps & State & MappedProps & DispatchProps & Props>(
    'item',
    ({setEditing}) => {
      setEditing(false)
    }
  )
)

export const BillDetail = enhance(({editing, item, startEdit, saveEdit, cancelEdit, deleteMe}) => {
  if (editing) {
    return <BillForm edit={item} onSubmit={saveEdit} onCancel={cancelEdit} />
  }
  const date = Bill.getDate(item)
  return <div>
    name: {item.doc.name}<br/>
    group: {item.doc.group}<br/>
    date: <FormattedDate value={date}/><br/>
    <Button onClick={startEdit}>edit</Button>
    <Button onClick={deleteMe}>delete</Button>
  </div>
})
