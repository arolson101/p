// tslint:disable:no-unused-expression
import * as React from 'react'
import { defineMessages } from 'react-intl'
import { specs, describe, it } from 'storybook-addon-specifications'
import { mountIntl, expect, stub, action, storiesOfIntl, dummyAccountView } from './storybook'

import { typedFields } from 'ui/components/forms'

const messages = defineMessages({
  text: {
    id: 'Forms.Stories.text',
    defaultMessage: 'Text'
  },
  password: {
    id: 'Forms.Stories.password',
    defaultMessage: 'Password'
  },
  url: {
    id: 'Forms.Stories.url',
    defaultMessage: 'url'
  },
})

const stories = storiesOfIntl(`Forms`, module)

interface Values {
  text: string
  password: string
  url: string
  favico: string
}

const { Form, Form2, TextField2, UrlField2, PasswordField2 } = typedFields<Values>()

stories.add('normal', () => {
  return <Form2 horizontal onSubmit={action('onSubmit')}>
    {api =>
      <Form onSubmit={api.submitForm}>
        <TextField2 name='text' label={messages.text}/>
        <PasswordField2 name='text' label={messages.text}/>
        <UrlField2 name='url' favicoName='favico' label={messages.url}/>
      </Form>
    }
  </Form2>
})
