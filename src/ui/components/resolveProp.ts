import * as Rx from 'rxjs'
import { compose, branch, ComponentEnhancer, mapPropsStream, setDisplayName } from 'recompose'

type Renderer<T> = ComponentEnhancer<T, T>

export const resolveProp = (key: string, loadingRender: Renderer<{}>, errorRender: Renderer<{error: Error}>) => compose(
  setDisplayName('resolveProp'),
  mapPropsStream((props$: Rx.Observable<any>) => {
    const promise$ = props$
      .pluck(key)
      // .distinct()
      .map((promise: any) => promise.then((value: any) => value, (err: any) => err))
      .switch<Rx.Observable<any>>()
      .map(value => ({[key]: value}))
      .distinct()
      .do((x: any) => console.log('final: ', x))

    return props$
      .map(props => ({ ...props, [key]: undefined}))
      .merge(promise$)
      .scan((x, y) => Object.assign({}, x, y))
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
