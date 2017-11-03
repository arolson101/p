import * as React from 'react'
import * as RB from 'react-bootstrap'
import { DateInput } from '@blueprintjs/datetime'
import { Helmet } from 'react-helmet'
import { FormattedMessage } from 'react-intl'

import { storiesOfIntl } from './storybook'

import { UI } from 'ui2'

export const BootstrapUI: UI = {
  Root: ({ children, ...props }) =>
    <div>
      <Helmet>
        <link rel='stylesheet' type='text/css' href='bootstrap/dist/css/bootstrap.css'/>
      </Helmet>
      {children}
    </div>,

  Page: ({ children, id, title }) =>
    <div>
      <h1>
        <FormattedMessage {...title}/>
        <br/>
      </h1>
      {children}
    </div>,

  Button: ({ children, primary, danger, ...props }) =>
    <RB.Button bsStyle={primary ? 'primary' : danger ? 'danger' : undefined} {...props}>
      {children}
    </RB.Button>
}

const stories = storiesOfIntl(`Toolkits`, module)

const App = () => (
  <div>
    <Helmet>
      <link rel='stylesheet' type='text/css' href='@blueprintjs/core/dist/blueprint.css'/>
      <link rel='stylesheet' type='text/css' href='@blueprintjs/datetime/dist/blueprint-datetime.css'/>
    </Helmet>
    <div className='pt-button-group .modifier'>
      <a className='pt-button pt-icon-database' role='button'>Queries</a>
      <a className='pt-button pt-icon-function' role='button'>Functions</a>
      <a className='pt-button' role='button'>
        Options <span className='pt-icon-standard pt-icon-caret-down pt-align-right'></span>
      </a>
      </div>
      <br /><br />
      <div className='pt-button-group .modifier'>
      <a className='pt-button pt-icon-chart' role='button'></a>
      <a className='pt-button pt-icon-control' role='button'></a>
      <a className='pt-button pt-icon-graph' role='button'></a>
      <a className='pt-button pt-icon-camera' role='button'></a>
      <a className='pt-button pt-icon-map' role='button'></a>
      <a className='pt-button pt-icon-code' role='button'></a>
      <a className='pt-button pt-icon-th' role='button'></a>
      <a className='pt-button pt-icon-time' role='button'></a>
      <a className='pt-button pt-icon-compressed' role='button'></a>
    </div>
    <br /><br />
    <div className='pt-button-group .modifier'>
      <button type='button' className='pt-button pt-intent-success'>Save</button>
      <button type='button' className='pt-button pt-intent-success pt-icon-caret-down'></button>
    </div>
    <br/><br/>
    <DateInput/>
  </div>
)

stories.add('Bootstrap', () => {
  return <App/>
})
