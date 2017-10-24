// tslint:disable:no-unused-expression
import * as React from 'react'
import { specs, describe, it } from 'storybook-addon-specifications'
import { mountIntl, expect, stub, action, storiesOfIntl, dummyAccountView } from './storybook'

import { incomingDelta, resolveConflict } from 'util/delta'

const stories = storiesOfIntl(`util`, module)

const copy = (a: any) => {
  return ({...a, $deltas: [...a.$deltas]})
}

class Timer {
  time: number
  constructor () {
    this.time = 1
    this.increment = this.increment.bind(this)
  }
  increment () {
    return this.time++
  }
}

stories.add('delta', () => {
  specs(() => describe('delta', () => {
    it('resolve conflicts', () => {
      const timer = new Timer()
      const a = incomingDelta({_id: 'a', a: 'a', b: 'b'}, timer.increment)
      const a2 = incomingDelta({ ...copy(a), a: 'a2' }, timer.increment)
      const a3 = incomingDelta({ ...copy(a2), a: 'a3' }, timer.increment)

      const b2 = incomingDelta({ ...copy(a2), b: 'b2' }, timer.increment)
      const b3 = incomingDelta({ ...copy(b2), a: 'b3' }, timer.increment)
      const b4 = resolveConflict(a3, b3)

      expect(b4).to.have.property('a', 'b3')
      expect(b4).to.have.property('b', 'b2')
    })

    it('array conflicts keep both elements', () => {
      const timer = new Timer()
      const a = incomingDelta({_id: 'a', a: ['a'], b: ['b']}, timer.increment)
      const a2 = incomingDelta({ ...copy(a), a: [...a.a, 'a2'] }, timer.increment)
      const a3 = incomingDelta({ ...copy(a2), a: [...a2.a, 'a3'] }, timer.increment)

      const b2 = incomingDelta({ ...copy(a2), b: [...a2.b, 'b2'] }, timer.increment)
      const b3 = incomingDelta({ ...copy(b2), a: [...b2.a, 'b3'] }, timer.increment)
      const b4 = resolveConflict(a3, b3)

      expect(b4).to.have.property('a').to.eql(['a', 'a2', 'b3', 'a3'])
      expect(b4).to.have.property('b').to.eql(['b', 'b2'])
    })
  }))

  return <div>check 'specifications' for test results</div>
})
