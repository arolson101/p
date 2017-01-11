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
import { compose, setObservableConfig, withState, withHandlers, withProps, branch, renderComponent, mapPropsStream } from 'recompose'

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

const titleEventually = async() => {
  await wait(2000)
  return 'title finally returned!'
}

// Now use the `spinnerWhileLoading()` helper to add a loading spinner to any
// base component
const enhance = compose(
  withProps(() => ({
    title: titleEventually(),
    author: 'author',
    content: 'content'
  })),
  mapPropsStream((props$: Rx.Observable<any>) => {
    const promise$ = props$
      .pluck('title')
      .switchMap((promise: Promise<string>) => promise)
      .map(value => ({title: value}))

    const rest$ = props$
      .map(props => ({ ...props, title: undefined}))

    return rest$
      .merge(promise$)
      .scan((acc, value) => ({...acc, ...value}), {})
  }),
  spinnerWhileLoading(
    (props: any) => props.title && props.author && props.content
  )
)
const TestComponent = ({ title, author, content }: any) =>
  <article>
    <h1>{title}</h1>
    <h2>By {author.name}</h2>
    <div>{content}</div>
  </article>

const Test = enhance(TestComponent)


import rxjsconfig from 'recompose/rxjsObservableConfig'
setObservableConfig(rxjsconfig)
