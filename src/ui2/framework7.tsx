import * as React from 'react'
import * as F7 from 'framework7-react'
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
    <F7.Framework7App themeType='ios' routes={[]}>
      <F7.Statusbar />
      <F7.Views>
        <F7.View main>
          <F7.Pages navbarFixed toolbarFixed>
            {children}
          </F7.Pages>
        </F7.View>
      </F7.Views>
    </F7.Framework7App>,

  Page: injectIntl(({ children, title, intl: { formatMessage } }) =>
    <F7.Page id={title.id}>
      <F7.Navbar title={formatMessage(title)} />
      <p/>
      {children}
    </F7.Page>
  ),

  List: ({ children, ...props }) => <F7.List {...props}>{children}</F7.List>,

  ListItem: ({ children, ...props }) => <F7.ListItem {...props}>{children}</F7.ListItem>,

  Button: ({ children, fullWidth, ...props }) =>
    <F7.Button {...props}>
      {children}
    </F7.Button>
}

Framework7UI.Root.displayName = 'Framework7UI.Root'
Framework7UI.Page.displayName = 'Framework7UI.Page'
Framework7UI.Button.displayName = 'Framework7UI.Button'
