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

interface CancelablePromise {
  promise: Promise<any>
  cancel(): void
}

const makeCancelable = (promise: Promise<any>): CancelablePromise => {
  let hasCanceled = false

  const wrappedPromise = new Promise((resolve, reject) => {
    promise.then((val) =>
      hasCanceled ? reject({isCanceled: true}) : resolve(val)
    )
    promise.catch((error) =>
      hasCanceled ? reject({isCanceled: true}) : reject(error)
    )
  })

  return {
    promise: wrappedPromise,
    cancel() {
      hasCanceled = true
    }
  }
}

export function promisedConnect<TStateProps, TDispatchProps, TOwnProps>(
    mapStateToProps: FuncOrSelf<MapStateToProps<TStateProps, Promised<TOwnProps>>>,
    mapDispatchToProps?: FuncOrSelf<MapDispatchToPropsFunction<TDispatchProps, TOwnProps> | MapDispatchToPropsObject>
): ComponentDecorator<TStateProps & TDispatchProps, TOwnProps> {

  return function(Wrapped: ComponentType<any>) {
    const c = class Resolver extends React.Component<any, any> {
      private promises: { [key: string]: CancelablePromise }

      constructor(props: any) {
        super(props)
        this.state = {}
        this.promises = {}
        for (let key in this.props) {
          if (isPromise(this.props[key])) {
            this.state[key] = undefined
          }
        }
      }

      componentDidMount() {
        for (let key in this.props) {
          if (isPromise(this.props[key])) {
            const p = makeCancelable(this.props[key])
            this.promises[key] = p
            p.promise.then(
              (value: any) => this.setState({ [key]: value }),
              (error: any) => { if (!error.isCanceled) { throw error } }
            )
          }
        }
      }

      componentWillReceiveProps(nextProps: any) {
        for (let key in nextProps) {
          if (this.props[key] !== nextProps[key] && isPromise(nextProps[key])) {
            if (this.promises[key]) {
              this.promises[key].cancel()
            }
            const p = makeCancelable(nextProps[key])
            this.promises[key] = p
            p.promise.then(
              (value: any) => this.setState({ [key]: value }),
              (error: any) => { if (!error.isCanceled) { throw error } }
            )
          }
        }
      }

      componentWillUnmount() {
        for (let key in this.promises) {
          this.promises[key].cancel()
        }
      }

      render() {
        return <Wrapped {...this.props} {...this.state}/>
      }
    }

    return connect<TStateProps, TDispatchProps, TOwnProps>(mapStateToProps, mapDispatchToProps)(c)
  }
}
