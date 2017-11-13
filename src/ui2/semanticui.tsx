import * as React from 'react'
import { Helmet } from 'react-helmet'
import * as SUI from 'semantic-ui-react'
import { FormattedMessage } from 'react-intl'

import { UI } from 'ui2'

export const SemanticUI: UI = {
  links: [
    { rel: 'stylesheet', type: 'text/css', href: 'semantic-ui-css/semantic.min.css' },
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

  List: ({ children, ...props }) => <ul {...props}>{children}</ul>,

  ListItem: ({ children, ...props }) => <li {...props}>{children}</li>,

  Button: ({ children, ...props }) => <SUI.Button {...props}>{children}</SUI.Button>
}
