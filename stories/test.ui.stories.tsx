import * as React from 'react'
import { Helmet } from 'react-helmet'
import { defineMessages, FormattedMessage } from 'react-intl'
import { Button } from 'semantic-ui-react'
import { withKnobs, select } from '@storybook/addon-knobs'

import { storiesOfIntl } from './storybook'
import { UI, withUI, UIContext, UIContextProps } from 'ui2'
import { SemanticUI } from './test.semanticui.stories'
import { BlueprintUI } from './test.blueprint.stories'
import { Framework7UI } from './test.framework7.stories'

export const messages = defineMessages({
  pageTitle: {
    id: 'test.ui.stories.test',
    defaultMessage: 'Page Title'
  },
})

const stories = storiesOfIntl(`Toolkits`, module)

const TestPage = withUI(({ UI }) =>
  <UI.Page id='test' title={messages.pageTitle}>
    <UI.Button primary>primary button</UI.Button>
    <UI.Button>regular button</UI.Button>
    <UI.Button danger>danger button</UI.Button>
  </UI.Page>
)

const App = ({ UI }: UIContextProps) => {
  return <UIContext UI={UI}>
    <UI.Root>
      <TestPage/>
    </UI.Root>
  </UIContext>
}

stories.addDecorator(withKnobs)

stories.add('UiContext', () => {
  const uis: any = {
    'framework7': Framework7UI,
    'semantic ui': SemanticUI,
    'blueprint': BlueprintUI,
  }
  const uikeys = Object.keys(uis)

  return <App UI={uis[select('UI', uikeys, uikeys[0])]}/>
})
