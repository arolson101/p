import { withRouter } from 'react-router'
import { compose, withHandlers, withState } from 'recompose'
import { RouteProps } from './props'

export const withQuerySyncedState = <T extends {}>(name: string, setter: string, dflt: T, convert: (val: string) => T) => {
  return compose(
    withRouter,
    withState(name, '_' + setter, (props: RouteProps<any>) => {
      const query = props.location.query as any
      if (name in query) {
        return convert(query[name])
      } else {
        return dflt
      }
    }),
    withHandlers({
      [setter]: (props: RouteProps<any>) => (value: T) => {
        const { ['_' + setter]: stateSetter, [name]: existingValue, location, router } = props
        if (value !== existingValue) {
          const nextLocation = { ...location, query: { ...location.query, [name]: value }}
          router.replace(nextLocation)
          stateSetter(value)
        }
      }
    })
    // mapPropsStream((props$: Rx.Observable<AllProps>) => {
    //   const update$ = props$
    //     .debounceTime(500)
    //     .distinctUntilKeyChanged(name)
    //     .do(({ router, location, [name]: value }) => {
    //       const nextLocation = { ...location, query: { ...location.query, [name]: value }}
    //       router.replace(nextLocation)
    //     })
    //   return props$.combineLatest(update$, props => props)
    // })
  )
}
