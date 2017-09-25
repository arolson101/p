// tslint:disable:no-unused-expression
import * as React from 'react'
import { Button } from 'react-bootstrap'
import { defineMessages } from 'react-intl'
import { specs, describe, it } from 'storybook-addon-specifications'
import { Provider, mountIntl, expect, stub, action, storiesOfIntl, dummyStore, dummyBankDocs, dummyBudgetDocs } from './storybook'

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
  },
  accountMessage: {
    id: 'Forms.Stories.accountMessage',
    defaultMessage: 'Account'
  },
  budgetMessage: {
    id: 'Forms.Stories.budgetMessage',
    defaultMessage: 'Budget'
  }
})

const stories = storiesOfIntl(`Forms`, module)
const store = dummyStore(
  ...dummyBankDocs('bank 1', ['account 1a', 'account 1b']),
  ...dummyBankDocs('bank 2', ['account 2a']),
  ...dummyBudgetDocs('budget 1'),
  ...dummyBudgetDocs('budget 2')
)

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
  account: string
  budget: string
}

const { Form, Form2, TextField2, UrlField2, PasswordField2,
  ColorAddon2, SelectField2, CheckboxField2, CollapseField2, DateField2,
  AccountField2, BudgetField2 } = typedFields<Values>()

const opt = (i: number) => ({value: `option ${i}`, label: `Option #${i}`})
const selectOptions = [opt(1), opt(2), opt(3)]
const selectCreateableOptions = [...selectOptions]
const selectMultipleOptions = [...selectOptions]

stories.add('normal', () => {
  // console.log('store', store.getState())
  return <Provider store={store}>
    <Form2 horizontal onSubmit={(values, state, props, instance) => {
      console.log('onsubmit form2', props)
      action('onSubmit')(values)
    }}>
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
      <AccountField2 name='account' label={messages.accountMessage}/>
      <BudgetField2 name='budget' label={messages.budgetMessage}/>
      <Button type='submit'>submit</Button>
    </Form2>
  </Provider>
})
