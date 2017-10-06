import * as React from 'react'
import { Framework7App, Statusbar, Views, View, Page, Pages, Toolbar, Link } from 'framework7-react'

import { mountIntl, expect, stub, action, storiesOfIntl,
  dummyStore, dummyBankDocs, dummyBudgetDocs, Provider } from './storybook'

const stories = storiesOfIntl(`Framework7`, module)

import 'framework7-react/dist/umd/css/framework7.ios.min.css'
import 'framework7-react/dist/umd/css/framework7.ios.colors.min.css'
import 'framework7-react/dist/umd/css/my-app.css'

const App = () => (
  <Framework7App themeType='ios' routes={[]}>
    <Statusbar />
    {/* Views */}
    <Views>
      {/* Your main view, should have "main" prop */}
      <View main>
        {/* Pages container, because we use fixed navbar and toolbar, it has additional appropriate props */}
        <Pages navbarFixed toolbarFixed>
          {/* Initial Page */}
          <Page>
            {/* Top Navbar /*}
            <Navbar title="Awesome App" />
            {/* Toolbar */}
            <Toolbar>
              <Link>Link 1</Link>
              <Link>Link 2</Link>
            </Toolbar>
            {/* Page Content */}
            <p>Page content goes here</p>
            <Link href='/about/'>About App</Link>
          </Page>
        </Pages>
      </View>
    </Views>
  </Framework7App>
)

stories.add('normal', () => {
  return <App/>
})
