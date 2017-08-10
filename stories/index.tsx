import * as React from 'react'
import { storiesOf } from '@storybook/react'
import { BankDialog } from '../src/ui/dialogs'

const action = (str: string) => () => console.log(str)

storiesOf('Button', module)
  .add('AccountDialog', () => (
    <BankDialog show={true} onHide={() => null} />
  ))
  .add('with some emoji', () => (
    <button onClick={action('clicked')}>😀 😎 👍 💯</button>
  ))
