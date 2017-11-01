import * as PropTypes from 'prop-types'
import * as React from 'react'
import { compose, setDisplayName, withState, withContext } from 'recompose'

interface StateProps {
  dialogContainer: any
  setDialogContainer: (dialogContainer: any) => void
}

type EnhancedProps = StateProps

export namespace DialogContainer {
  export interface Context {
    dialogContainer: any
  }

  export const ContextTypes: PropTypes.ValidationMap<Context> = {
    dialogContainer: PropTypes.object
  }

  const enhance = compose<EnhancedProps, {}>(
    setDisplayName('DialogContainer'),
    withState('dialogContainer', 'setDialogContainer', undefined),
    withContext<Context, StateProps>(
      ContextTypes,
      ({ dialogContainer }) => ({ dialogContainer })
    ),
  )

  export const Component = enhance(props => {
    const { children, setDialogContainer } = props

    return (
      <div
        className='modal-container'
        ref={setDialogContainer}
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          width: '100%'
        }}
      >
      {children}
    </div>
    )
  })
}
