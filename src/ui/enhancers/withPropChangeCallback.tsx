import * as React from 'react'

export const withPropChangeCallback = <Props extends {}>(prop: keyof Props, callback: (props: Props, prevValue?: any) => any) =>
  (Component: any) =>
    class extends React.Component<Props, any> {
      componentDidMount() {
        callback(this.props)
      }
      componentWillReceiveProps(nextProps: any) {
        if (nextProps[prop] !== this.props[prop]) {
          callback(nextProps, this.props[prop])
        }
      }
      render() {
        return <Component {...this.props}/>
      }
    }
