import * as React from 'react'
import { connect } from 'react-redux'

type ComponentType<P> = React.ComponentClass<P> | React.StatelessComponent<P>;

type FuncOrSelf<T> = T | (() => T);

interface MapStateToProps<TStateProps, TOwnProps> {
    (state: any, ownProps?: TOwnProps): TStateProps
}

type Dispatch<S> = Redux.Dispatch<S>;
type ActionCreator<A> = Redux.ActionCreator<A>;

interface MapDispatchToPropsFunction<TDispatchProps, TOwnProps> {
    (dispatch: Dispatch<any>, ownProps?: TOwnProps): TDispatchProps
}

interface MapDispatchToPropsObject {
    [name: string]: ActionCreator<any>
}

type ComponentClass<P> = React.ComponentClass<P>;
type StatelessComponent<P> = React.StatelessComponent<P>;
interface ComponentDecorator<TOriginalProps, TOwnProps> {
    (component: ComponentClass<TOriginalProps> | StatelessComponent<TOriginalProps>): ComponentClass<TOwnProps>
}

const isPromise = (obj: any): boolean => {
  return obj && typeof(obj) === 'object' && typeof(obj.then) === 'function'
}

export type Promised<T> = {
    [P in keyof T]: Promise<T[P]> | T[P]
}

export function promisedConnect<TStateProps, TDispatchProps, TOwnProps>(
    mapStateToProps: FuncOrSelf<MapStateToProps<TStateProps, Promised<TOwnProps>>>,
    mapDispatchToProps?: FuncOrSelf<MapDispatchToPropsFunction<TDispatchProps, TOwnProps> | MapDispatchToPropsObject>
): ComponentDecorator<TStateProps & TDispatchProps, TOwnProps> {

  return function(Wrapped: ComponentType<any>) {
    const c = class Resolver extends React.Component<any, any> {
      constructor(props: any) {
        super(props)

        this.state = {}
        for (let key in this.props) {
          if (isPromise(this.props[key])) {
            this.state[key] = undefined
          }
        }
      }

      componentDidMount() {
        for (let key in this.props) {
          if (isPromise(this.props[key])) {
            this.props[key].then(
              (value: any) => this.setState({ [key]: value }),
              (error: Error) => this.setState({ value: error })
            )
          }
        }
      }

      componentWillReceiveProps(nextProps: any) {
        for (let key in nextProps) {
          if (this.props[key] !== nextProps[key] && isPromise(nextProps[key])) {
            nextProps[key].then(
              (value: any) => this.setState({ [key]: value }),
              (error: Error) => this.setState({ value: error })
            )
          }
        }
      }

      render() {
        return <Wrapped {...this.props} {...this.state}/>
      }
    }

    return connect<TStateProps, TDispatchProps, TOwnProps>(mapStateToProps, mapDispatchToProps)(c)
  }
}
