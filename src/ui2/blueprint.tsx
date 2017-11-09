import * as Blueprint from '@blueprintjs/core'
import * as React from 'react'
import { Helmet } from 'react-helmet'
import { FormattedMessage } from 'react-intl'
import { UI } from 'ui2'

export const BlueprintUI: UI = {
  links: [
    { rel: 'stylesheet', type: 'text/css', href: '@blueprintjs/core/dist/blueprint.css' },
    { rel: 'stylesheet', type: 'text/css', href: '@blueprintjs/datetime/dist/blueprint-datetime.css' },
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
    <Blueprint.Button intent={primary ? Blueprint.Intent.PRIMARY : danger ? Blueprint.Intent.DANGER : Blueprint.Intent.NONE} {...props}>
      {children}
    </Blueprint.Button>
}
