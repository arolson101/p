import * as React from 'react'

type Component<P> = React.ComponentClass<P> | React.StatelessComponent<P>

interface ComponentEnhancer<TInner, TOutter> {
  (component: Component<TInner>): React.ComponentClass<TOutter>
}

type Updater<T> = { [K in keyof T]: string }

export const withState2 = <TInner, TOutter>(
  initialState: Partial<TInner>,
  stateUpdaters: Updater<Partial<TInner>>,
): ComponentEnhancer<TInner & TOutter, TOutter> => {
  return <State, ComponentState>(
    Comp: new() => React.Component<TOutter & State, ComponentState>) => {
    return class extends React.Component<TOutter, Partial<TInner>> {
      constructor(props: TOutter) {
        super(props)
        this.state = initialState
        Object.keys(stateUpdaters).forEach(fcnName => {
          const key = (stateUpdaters as any)[fcnName]
          const fcn = (value: any) => this.setState({[key]: value} as any)
          this.state[fcnName as any] = fcn.bind(this)
        })
      }
      render() {
        return <Comp {...this.props} {...this.state}/>
      }
    }
  }
}
