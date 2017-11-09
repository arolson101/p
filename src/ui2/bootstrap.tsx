import * as React from 'react'
import * as RB from 'react-bootstrap'
import { Helmet } from 'react-helmet'
import { FormattedMessage } from 'react-intl'

import { UI } from 'ui2'

export const BootstrapUI: UI = {
  links: [
    { rel: 'stylesheet', type: 'text/css', href: 'bootstrap/dist/css/bootstrap.css' },
  ],

  Root: ({ children, ...props }) => React.Children.only(children),

  Page: ({ children, title }) =>
    <div>
      <h1>
        <FormattedMessage {...title}/>
        <br/>
      </h1>
      {children}
    </div>,

  Button: ({ children, primary, danger, ...props }) =>
    <RB.Button bsStyle={primary ? 'primary' : danger ? 'danger' : undefined} {...props}>
      {children}
    </RB.Button>
}

BootstrapUI.Root.displayName = 'BootstrapUI.Root'
BootstrapUI.Page.displayName = 'BootstrapUI.Page'
BootstrapUI.Button.displayName = 'BootstrapUI.Button'
