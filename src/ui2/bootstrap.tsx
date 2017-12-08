import * as React from 'react'
import * as RB from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'

import { UI } from 'ui2'

export const BootstrapUI: UI = {
  links: [
    { rel: 'stylesheet', type: 'text/css', href: 'bootstrap/dist/css/bootstrap.css' },
  ],

  Root: ({ children, ...props }) => <>{children}</>,

  Page: ({ children, title }) =>
    <div>
      <h1>
        <FormattedMessage {...title}/>
        <br/>
      </h1>
      {children}
    </div>,

  List: ({ children }) => <RB.ListGroup>{children}</RB.ListGroup>,

  ListItem: ({ children }) => <RB.ListGroupItem>{children}</RB.ListGroupItem>,

  Button: ({ children, primary, danger, fullWidth, ...props }) =>
    <RB.Button
      bsStyle={primary ? 'primary' : danger ? 'danger' : undefined}
      block={fullWidth}
      {...props}
    >
      {children}
    </RB.Button>
}

BootstrapUI.Root.displayName = 'BootstrapUI.Root'
BootstrapUI.Page.displayName = 'BootstrapUI.Page'
BootstrapUI.Button.displayName = 'BootstrapUI.Button'
