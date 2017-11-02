import * as React from 'react'
import { Helmet } from 'react-helmet'
import { Button } from 'semantic-ui-react'
import { FormattedMessage } from 'react-intl'

import { mountIntl, expect, stub, action, storiesOfIntl,
  dummyStore, dummyBankDocs, dummyBudgetDocs, Provider } from './storybook'

import { UI } from 'ui2'

export const SemanticUI: UI = {
  Root: ({ children, ...props }) =>
    <div>
      <Helmet>
        <link rel='stylesheet' type='text/css' href='semantic-ui-css/semantic.min.css'/>
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

  Button: ({ children, ...props }) => <Button {...props}>{children}</Button>
}

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
