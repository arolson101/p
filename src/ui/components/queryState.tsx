import * as React from 'react'
import { RouteProps } from './props'
import debounce = require('lodash.debounce')

export const withQuerySyncedState = <T extends {}>(name: string, setter: string, dflt: T, convert: (val: string) => T) =>
  (Component: any) =>
    class extends React.PureComponent<RouteProps<any>, any> {
      private setValue: ((value: T) => void) & _.Cancelable
      constructor(props?: any) {
        super(props)
        const query = this.props.location.query as any
        const value = (name in query) ? convert(query[name]) : dflt
        this.state = {
          [name]: value
        }
        this.setValue = debounce(
          (value: T) => {
            this.setState({[name]: value}, () => {
              const { location, router } = this.props
              const nextLocation = { ...location, query: { ...location.query, ...this.state }}
              router.replace(nextLocation)
            })
          },
          200,
          { leading: true }
        )
      }
      componentWillUnmount() {
        this.setValue.cancel()
      }
      render() {
        return <Component {...this.props} {...this.state} {...{[setter]: this.setValue}} />
      }
    }
