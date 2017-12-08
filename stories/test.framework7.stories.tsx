import * as React from 'react'
import { Helmet } from 'react-helmet'
import { Framework7App, Statusbar, Navbar, Views, View, Page, Pages, Toolbar, Link } from './framework7'

import { storiesOfIntl } from './storybook'

const stories = storiesOfIntl(`Toolkits`, module)

export const About = () => (
  <Page id='about' name='about'>...</Page>
)

// Create Component for Login page
export const Login = () => (
  <Page id='login' name='login'>...</Page>
)

const App = () => (
  <Framework7App
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
    <Helmet>
      <link rel='stylesheet' type='text/css' href='framework7-react/dist/umd/css/framework7.ios.min.css'/>
      <link rel='stylesheet' type='text/css' href='framework7-react/dist/umd/css/framework7.ios.colors.min.css'/>
      <link rel='stylesheet' type='text/css' href='framework7-react/dist/umd/css/my-app.css'/>
    </Helmet>

    <Statusbar />
    {/* Views */}
    <Views>
      {/* Your main view, should have "main" prop */}
      <View main>
        {/* Pages container, because we use fixed navbar and toolbar, it has additional appropriate props */}
        <Pages navbarFixed toolbarFixed>
          {/* Initial Page */}
          <Page id='initial'>
            {/* Top Navbar */}
            <Navbar title='Awesome App' />
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

stories.add('Framework7', () => {
  return <App/>
})
