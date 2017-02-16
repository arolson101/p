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
        return <Component {...this.props}/>
      }
    }

export const checkPropChange = <T, K extends keyof T>(lastProps: T | undefined, nextProps: T, prop: K, callback: (value: T[K]) => void) => {
  const nextValue = nextProps[prop]
  if (!lastProps || lastProps[prop] !== nextValue) {
    callback(nextValue)
  }
}
