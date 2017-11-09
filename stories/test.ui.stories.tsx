import * as React from 'react'
import { Helmet } from 'react-helmet'
import { defineMessages, FormattedMessage } from 'react-intl'
import { Button } from 'semantic-ui-react'
import { withKnobs, select } from '@storybook/addon-knobs'

import { storiesOfIntl } from './storybook'
import { UI, UIProvider, UIContext } from 'ui2'
import { SemanticUI } from 'ui2/semanticui'
import { BlueprintUI } from 'ui2/blueprint'
import { Framework7UI } from 'ui2/framework7'
import { BootstrapUI } from 'ui2/bootstrap'

export const messages = defineMessages({
  pageTitle: {
    id: 'test.ui.stories.test',
    defaultMessage: 'Page Title'
  },
})

const stories = storiesOfIntl(`Toolkits`, module)

const TestPage: SFC<{}, UI.Context> = ({}, { UI }) =>
  <UI.Page title={messages.pageTitle}>
    <UI.Button primary>primary button</UI.Button>
    <UI.Button>regular button</UI.Button>
    <UI.Button danger>danger button</UI.Button>
  </UI.Page>

const Root: SFC<{}, UI.Context> = ({}, { UI }) =>
  <UI.Root>
    <TestPage/>
  </UI.Root>

const App = ({ UI }: UI.Context) => {
  return <UIProvider UI={UI}>
    <Root>
      <TestPage/>
    </Root>
  </UIProvider>
}

stories.addDecorator(withKnobs)

stories.add('UiContext', () => {
  const uis: any = {
    'framework7': Framework7UI,
    'semantic ui': SemanticUI,
    'blueprint': BlueprintUI,
    'bootstrap': BootstrapUI,
  }
  const uikeys = Object.keys(uis)

  return <App UI={uis[select('UI', uikeys, uikeys[0])]}/>
})
