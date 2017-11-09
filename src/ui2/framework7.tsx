import * as React from 'react'
import { Framework7App, Statusbar, Button, Navbar, Views, View, Page, Pages, Toolbar, Link } from 'framework7-react'
import { Helmet } from 'react-helmet'
import { injectIntl } from 'react-intl'
import { UI } from 'ui2'

export const Framework7UI: UI = {
  links: [
    { rel: 'stylesheet', type: 'text/css', href: 'framework7-react/dist/umd/css/framework7.ios.min.css' },
    { rel: 'stylesheet', type: 'text/css', href: 'framework7-react/dist/umd/css/framework7.ios.colors.min.css' },
    { rel: 'stylesheet', type: 'text/css', href: 'framework7-react/dist/umd/css/my-app.css' },
  ],

  Root: ({ children, ...props }) =>
    <Framework7App themeType='ios' routes={[]}>
      <Statusbar />
      <Views>
        <View main>
          <Pages navbarFixed toolbarFixed>
            {children}
          </Pages>
        </View>
      </Views>
    </Framework7App>,

  Page: injectIntl(({ children, title, intl: { formatMessage } }) =>
    <Page id={title.id}>
      <Navbar title={formatMessage(title)} />
      <p/>
      {children}
    </Page>
  ),

  Button: ({ children, ...props }) =>
    <Button {...props}>
      {children}
    </Button>
}

Framework7UI.Root.displayName = 'Framework7UI.Root'
Framework7UI.Page.displayName = 'Framework7UI.Page'
Framework7UI.Button.displayName = 'Framework7UI.Button'
