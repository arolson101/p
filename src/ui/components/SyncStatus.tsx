import * as React from 'react'
import { SyncConnection } from '../../docs/index'
import { syncProviders } from '../../sync/index'

interface Props {
  sync: SyncConnection
}

export const SyncStatus = ({sync}: Props) => {
  const provider = syncProviders.find(p => p.id === sync.provider)
  if (!provider) {
    return <div>no provider</div>
  }

  const config = provider.drawConfig(sync)

  switch (sync.state) {
    case 'ERR_PASSWORD':
      return <div>{config}<br/>needs password</div>
    case 'ERROR':
      return <div>{config}<br/>error: {sync.message}</div>
    case 'OK':
      return <div>{config}<br/>ok</div>
    default:
      return <div>{config}</div>
  }
}
