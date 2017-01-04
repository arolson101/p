import * as React from 'react'
import './flex.css'

interface ContainerProps {
  column?: boolean
}

export const Container = (props: ContainerProps & React.Props<any> & React.HTMLProps<HTMLDivElement>) => {
  const { children, style, column, ...divProps } = props
  return (
    <div style={{display: 'flex', flex: 1, flexDirection: column ? 'column' : 'row', ...style}} {...divProps}>
      {children}
    </div>
  )
}

interface ItemProps {
  flex?: number | string
}

export const Item = (props: ItemProps & React.Props<any> & React.HTMLProps<HTMLDivElement>) => {
  const { children, style, flex, ...divProps } = props
  return (
    <div style={{flex: flex || '0', ...style}} {...divProps}>
      {children}
    </div>
  )
}
