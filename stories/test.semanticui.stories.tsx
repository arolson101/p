import * as React from 'react'
import { Helmet } from 'react-helmet'
import { Button } from 'semantic-ui-react'

import { mountIntl, expect, stub, action, storiesOfIntl,
  dummyStore, dummyBankDocs, dummyBudgetDocs, Provider } from './storybook'

const stories = storiesOfIntl(`Toolkits`, module)

const App = () => (
  <div>
    <Helmet>
      <link rel='stylesheet' type='text/css' href='semantic-ui-css/semantic.min.css'/>
    </Helmet>

    <Button primary>hi</Button>
  </div>
)

stories.add('Semantic UI', () => {
  return <App/>
})
