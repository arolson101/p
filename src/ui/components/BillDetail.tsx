import * as React from 'react'
import { Button } from 'react-bootstrap'
import { FormattedDate } from 'react-intl'
import { connect } from 'react-redux'
import { compose, setDisplayName, withState, withHandlers, mapProps } from 'recompose'
import { AppState, CurrentDb } from '../../state'
import { Bill } from '../../docs'
import { withPropChangeCallback } from '../enhancers'
import { BillForm, SubmitFunction } from './BillForm'

interface Props {
  item: Bill.View
}

interface ConnectedProps {
  current: CurrentDb
}

interface EnhancedProps {
  date: Date
  editing: boolean
  setEditing: (editing: boolean) => void
  startEdit: () => void
  cancelEdit: () => void
  deleteMe: () => void
  saveEdit: SubmitFunction<Bill.Doc>
}

type AllProps = Props & ConnectedProps & EnhancedProps

const enhance = compose<AllProps, Props>(
  setDisplayName('BillDetail'),
  connect(
    (state: AppState): ConnectedProps => ({
      current: state.db.current!
    })
  ),
  mapProps((props: AllProps) => ({
    ...props,
    date: Bill.getDate(props.item)
  })),
  withState('editing', 'setEditing', false),
  withHandlers<AllProps, AllProps>({
    startEdit: ({setEditing}) => () => {
      setEditing(true)
    },
    cancelEdit: ({setEditing}) => () => {
      setEditing(false)
    },
    saveEdit: ({setEditing, current}) => async (doc: Bill.Doc) => {
      await current.db.put(doc)
      setEditing(false)
    },
    deleteMe: ({item, current}) => () => {
      current.db.remove(item)
    }
  }),
  withPropChangeCallback('item', ({setEditing}: AllProps) => {
    setEditing(false)
  })
)

export const BillDetail = enhance(({editing, item, date, startEdit, saveEdit, cancelEdit, deleteMe}) => {
  if (editing) {
    return <BillForm edit={item} onSubmit={saveEdit} onCancel={cancelEdit} />
  }
  return <div>
    name: {item.doc.name}<br/>
    group: {item.doc.group}<br/>
    date: <FormattedDate value={date}/><br/>
    <Button onClick={startEdit}>edit</Button>
    <Button onClick={deleteMe}>delete</Button>
  </div>
})
