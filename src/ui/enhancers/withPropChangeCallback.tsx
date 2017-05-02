import * as React from 'react'

export const withPropChangeCallback = <Props extends {}>(prop: keyof Props, callback: (props: Props, prevValue?: any) => any) =>
  (Component: any) =>
    class extends React.Component<Props, any> {
      componentDidMount () {
        callback(this.props)
      }
      componentWillReceiveProps (nextProps: any) {
        if (nextProps[prop] !== (this.props as any)[prop]) {
          callback(nextProps, (this.props as any)[prop])
        }
      }
      render () {
        return <Component {...this.props as any}/>
      }
    }

type Callback<T> = (value: T, prev: T | undefined) => void

export const checkPropChange = <T, K extends keyof T>(lastProps: T | undefined, nextProps: T, prop: K, callback: Callback<T[K]>) => {
  const lastValue = lastProps && lastProps[prop]
  const nextValue = nextProps[prop]
  if (!lastProps || lastValue !== nextValue) {
    callback(nextValue, lastValue)
  }
}
