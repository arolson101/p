import * as React from 'react'
import { Framework7App, Statusbar, Views, View, Page, Pages, Toolbar, Link } from './framework7'

import { mountIntl, expect, stub, action, storiesOfIntl,
  dummyStore, dummyBankDocs, dummyBudgetDocs, Provider } from './storybook'

const stories = storiesOfIntl(`Framework7`, module)

export const About = () => (
  <Page name='about'>...</Page>
)

// Create Component for Login page
export const Login = () => (
  <Page name='login'>...</Page>
)

const App = () => (
  <Framework7App
    {...{style: {height: '100%'}}}
    themeType='ios'
    routes={[
      {
        path: '/about/',
        component: About
      },
      {
        path: '/login/',
        component: Login
      }
    ]}
  >
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
