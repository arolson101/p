import * as React from 'react'
import { storiesOf } from '@storybook/react'

const action = (str: string) => () => console.log(str)

storiesOf('Button', module)
  .add('with text', () => (
    <button onClick={action('clicked')}>Hello Button</button>
  ))
  .add('with some emoji', () => (
    <button onClick={action('clicked')}>😀 😎 👍 💯</button>
  ))
