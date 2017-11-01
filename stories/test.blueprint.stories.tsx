import * as React from 'react'
import { DateInput } from '@blueprintjs/datetime'
import { Helmet } from 'react-helmet'

import { storiesOfIntl } from './storybook'

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

stories.add('Blueprint', () => {
  return <App/>
})
