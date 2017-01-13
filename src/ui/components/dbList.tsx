import * as React from 'react'
import { Grid, ListGroup, ListGroupItem } from 'react-bootstrap'
import { FormattedMessage, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { DbInfo } from '../../docs'
import { AppState } from '../../state'
import { Lookup } from '../../util'
import { RouteProps } from './props'

const icons = {
  newDb: {
    className: 'fa fa-user-plus'
  },
  openDb: {
    className: 'fa fa-sign-in'
  }
}

const messages = defineMessages({
  newDb: {
    id: 'login.newDb',
    defaultMessage: 'New'
  },
  newDbDescription: {
    id: 'login.newDbDescription',
    defaultMessage: 'Create a new data store'
  }
})

interface ConnectedProps {
  dbInfos: DbInfo.Cache
}

type AllProps = RouteProps<any> & ConnectedProps

export const DbListComponent = ({ dbInfos, router }: AllProps) => (
  <Grid>
  <Test/>
    {dbInfos &&
      <div>
        <ListGroup>
          {Lookup.map(dbInfos, dbInfo =>
            <ListGroupItem
              href={router.createHref(DbInfo.to.view(dbInfo))}
              key={dbInfo._id}
            >
              <h4><i {...icons.openDb}/> {dbInfo.title}</h4>
            </ListGroupItem>
          )}
          {/*Lookup.hasAny(props.dbInfos) &&
            <Divider/>
          */}
          <ListGroupItem
            href={router.createHref(DbInfo.to.create())}
          >
            <h4><i {...icons.openDb}/> <FormattedMessage {...messages.newDb}/></h4>
            <p><FormattedMessage {...messages.newDbDescription}/></p>
          </ListGroupItem>
        </ListGroup>
      </div>
    }
  </Grid>
)

export const DbList = connect(
  (state: AppState): ConnectedProps => ({
    dbInfos: state.db.meta.infos
  })
)(DbListComponent) as React.ComponentClass<{}>

import * as Rx from 'rxjs'
import { compose, setObservableConfig, setDisplayName, withState, withHandlers, withProps, branch, renderComponent, mapPropsStream } from 'recompose'

type TestProps = {
  toggleVisibility: React.EventHandler<React.MouseEvent<HTMLButtonElement>>
  isVisible: boolean
  title: string
  message: string
}

// const TestComponent = ({ title, message, toggleVisibility, isVisible }: TestProps) =>
//   <div>
//     <h1>{title}</h1>
//     {isVisible ? <p>I'm visible</p> : <p> Not Visible </p>}
//     <p>{message}</p>
//     <button onClick={toggleVisibility}> Click me! </button>
//   </div>

// const Test = compose(
//   withState('isVisible', 'toggleVis', false),
//   withHandlers({
//     toggleVisibility: ({ toggleVis, isVisible }) => {
//      return () => {
//        return toggleVis(!isVisible)
//      }
//     }
//   }),
//   withProps(({ isVisible }) => {
//     return {
//       title: isVisible ? 'This is the visible title' : 'This is the default title',
//       message: isVisible ? 'Hello I am Visible' : 'I am not visible yet, click the button!'
//     }
//   })
// )(TestComponent)

// `hasLoaded()` is a function that returns whether or not the component
// has all the props it needs
const Spinner = () => <div>loading</div>

const spinnerWhileLoading = <Props extends {}>(hasLoaded: (props: Props) => boolean) =>
  branch<Props>(
    props => !hasLoaded(props),
    renderComponent(() => <div>spinner</div>)
  )

import { wait } from '../../util'

const titleEventually = async(i: number) => {
  await wait(2000)
  if (i % 2 == 1) {
    throw new Error('error message')
  }
  return `title finally returned (${i})!`
}

const TestComponent = ({ request, onClick }: any) =>
  <article>
    <Test2 request={request} foo='bar'/>
    <button onClick={onClick}>click</button>
  </article>
const Test = compose(
  setDisplayName('Test'),
  withState('request', 'setRequest', () => titleEventually(i++)),
  withProps(({setRequest}) => ({
    onClick: () => setRequest(titleEventually(i++))
  }))
)(TestComponent)


let i = 0

import { InferableComponentEnhancer } from 'recompose'

const ResolvePromise = (key: string, loadingRender: InferableComponentEnhancer, errorRender: InferableComponentEnhancer) => compose(
  setDisplayName('ResolvePromise'),
  mapPropsStream((props$: Rx.Observable<any>) => {
    const promise$ = props$
      .pluck(key)
      .map((promise: any) => promise.then((value: any) => value, (err: any) => err))
      .switch<Rx.Observable<any>>()
      .map(value => ({[key]: value}))

    return props$
      .map(props => ({ ...props, [key]: undefined}))
      .merge(promise$)
      .scan((x, y) => Object.assign({}, x, y))
  }),
  branch(
    ({[key]: err}) => err instanceof Error,
    errorRender!
  ),
  branch(
    ({[key]: value}) => !value,
    loadingRender!
  )
)

const Test2Component = ({ request }: any) =>
  <article>
    <div>request: {request}</div>
  </article>

const Test2 = compose(
  setDisplayName('Test2'),
  ResolvePromise(
    'request',
    renderComponent(() => <div>spinner</div>),
    renderComponent(({request}) => <div>error: {request.message}</div>)
  )
)(Test2Component) as React.ComponentClass<{request: Promise<string>, foo: string}>

import rxjsconfig from 'recompose/rxjsObservableConfig'
setObservableConfig(rxjsconfig)
