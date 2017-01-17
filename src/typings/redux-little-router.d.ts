declare module 'redux-little-router' {
  import * as History from 'history'

  interface FragmentProps {
    forRoute: string
    withConditions?: (location: History.Location) => boolean
  }

  export class RelativeFragment extends React.Component<FragmentProps, any> {}
  export class AbsoluteFragment extends React.Component<FragmentProps, any> {}

  type LinkProps = HTMLAnchorElement & {
    href: string | History.LocationDescriptor
  }
  export class Link extends React.Component<LinkProps, any> {}

  interface ProvideRouterProps {
    store: Redux.Store<any>
  }
  type Enhancer<T> = (component: React.ComponentClass<T>) => React.ComponentClass<T>
  export function provideRouter<T>(props: ProvideRouterProps): Enhancer<T>;
  export class RouterProvider extends React.Component<ProvideRouterProps, any> {}

  export function initializeCurrentLocation(initialLocation: string): Redux.Action;

  export const LOCATION_CHANGED: string
  export interface RouterSlice {
    router: RouterState
  }
  export interface RouterState {
    pathname: string
    route: string
    params: ObjectT<string>
    query: ObjectT<string>
    result: ObjectT<any>
    previous?: RouterState
  }
  interface ObjectT<T> { [key: string]: T }

  interface Route {
    [route: string]: any
  }

  interface RouterProps {
    routes: Route
    basename?: string
  }
  interface Router {
    routerEnhancer: Redux.GenericStoreEnhancer
    routerMiddleware: Redux.Middleware
  }
  export function routerForBrowser(props: RouterProps): Router;
}
