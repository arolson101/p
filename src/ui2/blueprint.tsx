import * as Blueprint from '@blueprintjs/core'
import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import { UI } from 'ui2'

export const BlueprintUI: UI = {
  links: [
    { rel: 'stylesheet', type: 'text/css', href: '@blueprintjs/core/dist/blueprint.css' },
    { rel: 'stylesheet', type: 'text/css', href: '@blueprintjs/datetime/dist/blueprint-datetime.css' },
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

  List: ({ children, ...props }) => <ul {...props}>{children}</ul>,

  ListItem: ({ children, ...props }) => <li {...props}>{children}</li>,

  Button: ({ children, primary, danger, fullWidth, ...props }) =>
    <Blueprint.Button
      intent={primary ? Blueprint.Intent.PRIMARY : danger ? Blueprint.Intent.DANGER : Blueprint.Intent.NONE}
      className={fullWidth ? 'pt-fill' : undefined}
      {...props}
    >
      {children}
    </Blueprint.Button>
}
