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
  textWithColor: {
    id: 'Forms.Stories.textWithColor',
    defaultMessage: 'Text with color'
  },
  select: {
    id: 'Forms.Stories.select',
    defaultMessage: 'Select'
  },
  selectPlaceholder: {
    id: 'Forms.Stories.selectPlaceholder',
    defaultMessage: 'placeholder...'
  },
  selectCreateable: {
    id: 'Forms.Stories.selectCreateable',
    defaultMessage: 'Createable Select'
  },
  selectMultiple: {
    id: 'Forms.Stories.selectMultiple',
    defaultMessage: 'Select multiple'
  },
  checkbox: {
    id: 'Forms.Stories.checkbox',
    defaultMessage: 'Checkbox'
  },
  checkboxMessage: {
    id: 'Forms.Stories.checkboxMessage',
    defaultMessage: 'Checkbox message'
  },
  dateMessage: {
    id: 'Forms.Stories.dateMessage',
    defaultMessage: 'Date'
  }
})

const stories = storiesOfIntl(`Forms`, module)

interface Values {
  text: string
  password: string
  url: string
  favico: string
  textWithColor: string
  color: string
  select: string
  selectCreateable: string
  selectMultiple: string
  checkbox: boolean
  date: string
}

const { Form, Form2, TextField2, UrlField2, PasswordField2,
  ColorAddon2, SelectField2, CheckboxField2, CollapseField2, DateField2 } = typedFields<Values>()

const opt = (i: number) => ({value: `option ${i}`, label: `Option #${i}`})
const selectOptions = [opt(1), opt(2), opt(3)]
const selectCreateableOptions = [...selectOptions]
const selectMultipleOptions = [...selectOptions]

stories.add('normal', () => {
  return <Form2 horizontal onSubmit={action('onSubmit')}>
    {api =>
      <Form onSubmit={api.submitForm}>
        <TextField2 name='text' label={messages.text}/>
        <PasswordField2 name='text' label={messages.password}/>
        <UrlField2 name='url' favicoName='favico' label={messages.url}/>
        <TextField2 name='textWithColor' label={messages.textWithColor} addonBefore={<ColorAddon2 name='color'/>} />
        <SelectField2 name='select' options={selectOptions} label={messages.select} placeholderMessage={messages.selectPlaceholder}/>
        <SelectField2 createable name='selectCreateable' options={selectCreateableOptions} label={messages.selectCreateable} />
        <SelectField2 multi name='selectMultiple' options={selectMultipleOptions} label={messages.selectMultiple} />
        <CheckboxField2 name='checkbox' label={messages.checkbox} message={messages.checkboxMessage}/>
        <CollapseField2 name='checkbox'>
          <div>collapsed data</div>
        </CollapseField2>
        <DateField2 name='date' label={messages.dateMessage}/>
      </Form>
    }
  </Form2>
})
