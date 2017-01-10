import * as React from 'react'
import { connect } from 'react-redux'
import { getFormValues, change } from 'redux-form'
import { AppState } from '../../state'
import { RouteProps, DispatchProps } from './props'

interface Config<Values> {
  formName?: string
  formFields?: Array<keyof Values>
  initial?: Values
}

export interface QueryStateProps<Values> {
  pageState: Values
  setPageState(values: Partial<Values>): any
}

export const queryState = <Values extends any>(config: Config<Values>) => {
  return function<Props, ComponentState>(
    Comp: new() => React.Component<Props & QueryStateProps<Values>, ComponentState>) {

    interface ConnectedProps {
      pageState: {
        formValues: any
      }
    }

    type AllProps = ConnectedProps & RouteProps<any> & DispatchProps

    const hoc = class HOCBase extends React.Component<AllProps, Values> {
      private setPageState: (values: Values) => any

      constructor(props?: AllProps) {
        super(props)
        this.state = config.initial || ({} as Values)
        this.setPageState = this.setState.bind(this)
      }

      componentWillMount() {
        const { location: { query }, dispatch } = this.props

        for (let key in query) {
          let val = (query as any)[key]
          if (!isNaN(val)) {
            (query as any)[key] = +val
          } else if (val === 'true' || val === 'false') {
            (query as any)[key] = Boolean(val)
          }
        }

        if (config.formName) {
          for (let field in query) {
            let val = (query as any)[field]
            dispatch(change(config.formName, field, val))
          }
        }

        this.setState(query as any)
      }

      update(props: AllProps, state: Values) {
        const { pageState: { formValues }, location: { query }, location, router } = props
        const values = { ...(state as any), ...formValues }
        if (!equivelant(values, query)) {
          const nextLocation = { ...location }
          nextLocation.query = { ...query, ...values }
          router.replace(nextLocation)
        }
      }

      componentWillReceiveProps(nextProps: AllProps, nextState: Values) {
        this.update(nextProps, nextState)
      }

      componentDidUpdate(prevProps: AllProps, prevState: Values) {
        this.update(this.props, this.state)
      }

      render() {
        return <Comp {...this.props} pageState={this.state} setPageState={this.setPageState}/>
      }
    }

    return connect(
      (state: AppState, ownProps: any): ConnectedProps => ({
        pageState: {
          formValues: cleanValues(config.formFields, config.formName && getFormValues<Values>(config.formName)(state))
        }
      })
    )(hoc) as React.ComponentClass<{}>
  }
}

const equivelant = (values1: any, values2: any): boolean =>
  // tslint:disable-next-line:triple-equals
  Object.keys(values1).every(key => values1[key] == values2[key])

const cleanValues = (fields?: string[], values: Object = {}) =>
  (fields || Object.keys(values)).reduce(
    (x, key) => {
      x[key] = ((values as any)[key] || '').toString()
      return x
    },
    {} as any
  )
