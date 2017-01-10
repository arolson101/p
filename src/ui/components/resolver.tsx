import * as React from 'react'

type Component<T> = React.ComponentClass<T> | React.StatelessComponent<T>
export type Errors<T> = { [Key in keyof T]?: Error }

export interface ResolveProps<Values> {
  resolved: Partial<Values>
  errors: Errors<Values>
  resolve<Key extends keyof Values>(prop: Key, promise: Promise<Values[Key]>, clear?: boolean): any
}

interface State<Values> {
  resolved: Partial<Values>
  errors: Errors<Values>
}

export const resolver = <Props, Values>(Component: Component<Props & ResolveProps<Values>>): Component<Props> =>
  class extends React.Component<Props, State<Values>> {

    private token: CancellationToken

    constructor(props?: Props) {
      super(props)
      this.state = {
        resolved: {} as Partial<Values>,
        errors: {} as Errors<Values>
      }
      this.token = new CancellationToken()
      this.resolve = this.resolve.bind(this)
    }

    componentWillUnmount() {
      this.token.cancel()
    }

    render() {
      return <Component {...this.props} {...this.state} resolve={this.resolve}/>
    }

    resolve<Key extends keyof Values>(prop: Key, promise: Promise<Values[Key]>, clear: boolean = true) {
      const token = this.token
      if (clear) {
        this.setValue(prop, undefined)
      }
      promise.then(
        (value) => {
          if (!token.cancelled) {
            this.setValue(prop, value, undefined)
          }
        },
        (err) => {
          if (!token.cancelled) {
            this.setValue(prop, undefined, err)
          }
        }
      )
    }

    setValue<Key extends keyof Values>(prop: Key, value?: Values[Key], err?: Error) {
      this.setState(
        (prevState, props) => {
          const nextState = ({
            resolved: {
              ...(prevState.resolved as any),
              [prop as string]: value
            },
            errors: {
              ...(prevState.errors as any),
              [prop as string]: err
            }
          } as any)
          return nextState
        }
      )
    }
  }

class CancellationToken {
  cancelled: boolean

  constructor() {
    this.cancelled = false
  }

  cancel() {
    this.cancelled = true
  }
}
