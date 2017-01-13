import * as Rx from 'rxjs'
import { compose, branch, ComponentEnhancer, mapPropsStream, setDisplayName } from 'recompose'

type Renderer<T> = ComponentEnhancer<T, T>

export const withResolveProp = (key: string, loadingRender: Renderer<{}>, errorRender: Renderer<{error: Error}>) => compose(
  setDisplayName('resolveProp'),
  mapPropsStream((props$: Rx.Observable<any>) => {
    const value$ = props$
      .distinctUntilKeyChanged(key)
      .flatMap(props => {
        const value = props[key] as Promise<any>
        const currentValue = Rx.Observable.of(undefined)
        const futureValue = Rx.Observable.fromPromise(value.then(
          x => x,
          // tslint:disable-next-line:handle-callback-err
          err => err
        ))
        return Rx.Observable.of(currentValue, futureValue)
      })
      .switch()

    return props$
      .combineLatest(value$, (props, value) => ({...props, [key]: value}))
  }),
  branch(
    ({[key]: error}) => error instanceof Error,
    errorRender
  ),
  branch(
    ({[key]: value}) => !value,
    loadingRender
  )
)
