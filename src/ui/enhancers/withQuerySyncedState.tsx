import * as React from 'react'
import { RouteComponentProps } from 'react-router'
const debounce = require('lodash.debounce')

export const withQuerySyncedState = <T extends {}>(name: string, setter: string, dflt: T, convert: (val: string) => T) =>
  (Component: any) =>
    class extends React.PureComponent<RouteComponentProps<any>, any> {
      private setValue: ((value: T) => void) & _.Cancelable
      constructor (props?: any) {
        super(props)
        const query = new URLSearchParams(this.props.location.search)
        const queryValue = query.has(name) ? convert(query.get(name)!) : dflt
        this.state = {
          [name]: queryValue
        }
        query.set(name, queryValue as any)
        this.setValue = debounce(
          (value: T) => {
            this.setState({ [name]: value }, () => {
              const { location, history } = this.props
              const nextLocation = { ...location, search: query.toString() }
              history.replace(nextLocation)
            })
          },
          200,
          { leading: true }
        )
      }
      componentWillUnmount () {
        this.setValue.cancel()
      }
      render () {
        return <Component {...this.props} {...this.state} {...{ [setter]: this.setValue }} />
      }
    }
