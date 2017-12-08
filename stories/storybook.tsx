import { expect } from 'chai'
import * as Enzyme from 'enzyme'
import * as Adapter from 'enzyme-adapter-react-16'
import { FinancialInstitutionProfile } from 'filist'
import * as React from 'react'
import { Helmet } from 'react-helmet'
import { IntlProvider } from 'react-intl'
import { Provider } from 'react-redux'
import { setObservableConfig } from 'recompose'
import * as RRule from 'rrule-alt'
import { from } from 'rxjs/observable/from'
import * as Sinon from 'sinon'
import { action } from '@storybook/addon-actions'
import { withKnobs, select } from '@storybook/addon-knobs'
import { Story, storiesOf, addDecorator } from '@storybook/react'
// import 'bootstrap/dist/css/bootstrap.css'
import 'font-awesome/css/font-awesome.css'

import { createAppStore, setDocs, FI,
  DbInfo, Account, Bank, Transaction, Budget, Category, Bill } from 'core'
import createHistory from 'history/createHashHistory'
export { action }
export { expect }
export { specs, describe, it } from 'storybook-addon-specifications'
export { storiesOf }
export { Provider }
import { UI, UIProvider } from 'ui2'
import { SemanticUI } from 'ui2/semanticui'
import { BlueprintUI } from 'ui2/blueprint'
import { Framework7UI } from 'ui2/framework7'
import { BootstrapUI } from 'ui2/bootstrap'

setObservableConfig({
  fromESObservable: from,
  toESObservable: stream => stream
})

Enzyme.configure({ adapter: new Adapter() })

export const stub = () => Sinon.stub()

const uis = {
  'framework7': Framework7UI,
  'semantic ui': SemanticUI,
  'blueprint': BlueprintUI,
  'bootstrap': BootstrapUI,
}
const defaultUI: keyof typeof uis = 'bootstrap'

const locales = [
  'en',
]

const UIRoot: SFC<{}, UI.Context> = ({ children }, { UI }) => <UI.Root>{children}</UI.Root>
UIRoot.contextTypes = UI.contextTypes

export const StoryRoot: React.SFC<{test?: boolean}> = ({ children, test }) => {
  const UI = uis[select('UI', Object.keys(uis) as Array<keyof typeof uis>, defaultUI)]
  const locale = select('locale', locales, locales[0])
  return <IntlProvider locale={locale}>
    <UIProvider UI={UI}>
      {!test && <Helmet link={UI.links}/>}
      <UIRoot>
        {children}
      </UIRoot>
    </UIProvider>
  </IntlProvider>
}

addDecorator(withKnobs)

export const storiesOfIntl = (name: string, mod: NodeModule): Story => {
  const stories = storiesOf(name, mod)

  stories.addDecorator(getStory => (
    <StoryRoot>
      {getStory()}
    </StoryRoot>
  ))

  return stories
}

export const mountIntl: typeof Enzyme.mount = (node: any, options: any) =>
  Enzyme.mount(
    <StoryRoot test>
      {node}
    </StoryRoot>
  )

export const dummyDbInfo = (name: string): DbInfo => ({ name, location: `location://${name}` })

const imports = { db: {} as any, online: {} }
const history = createHistory()
export const dummyStore = (...docs: AnyDocument[]) => {
  const store = createAppStore(history, imports)
  store.dispatch(setDocs(docs))
  return store
}

const dummyAccount = (bank: string, account: string): Account.Doc => {
  return {
    _id: `account/${bank}/${account}` as Account.DocId,
    name: account,
    color: 'blue',
    type: Account.Type.CHECKING,
    number: 'account number',
    visible: true,
    bankid: `bank/${bank}`,
    key: 'account key',
  }
}

export const dummyBank = (bankName: string, accountNames: string[]) => {
  const accounts = accountNames.map(acct => dummyAccount(bankName, acct))
  const bank: Bank.Doc = {
    _id: `bank/${bankName}` as Bank.DocId,
    name: bankName,
    accounts: accounts.map(acct => acct._id)
  }

  return { bank, accounts }
}

export const dummyBankDocs = (bankName: string, accountNames: string[]) => {
  const { bank, accounts } = dummyBank(bankName, accountNames)
  return [bank, ...accounts]
}

export const dummyAccountView = () => {
  const { bank: bankDoc, accounts: accountDocs } = dummyBank('asdf', ['asdf'])
  const account: Account.View = {
    doc: accountDocs[0],
    transactionsRetrieved: false
  }

  const bank: Bank.View = {
    doc: bankDoc
  }

  return { account, bank }
}

export const dummyBudget = (budgetName: string) => {
  const budgetId = `budget/${budgetName}`
  const categories: Category.Doc[] = [
    { _id: `category/${budgetName}/cat1` as Category.DocId, name: 'category 1', amount: 101 },
    { _id: `category/${budgetName}/cat2` as Category.DocId, name: 'category 2', amount: 102 },
    { _id: `category/${budgetName}/cat3` as Category.DocId, name: 'category 3', amount: 103 }
  ]
  const budget: Budget.Doc = {
    _id: budgetId as Budget.DocId,
    name: budgetName,
    categories: categories.map(cat => cat._id),
    sortOrder: 1
  }
  return { budget, categories }
}

export const dummyBudgetDocs = (budgetName: string) => {
  const { budget, categories } = dummyBudget(budgetName)
  return [budget, ...categories]
}

export const dummyBillDocs = (billName: string): AnyDocument[] => {
  const [ bank, account ] = dummyBankDocs(`bank for ${billName}`, ['account 1'])
  const { budget, categories } = dummyBudget(`budget for ${billName}`)
  const bill: Bill.Doc = {
    _id: `bill/${billName}` as Bill.DocId,
    name: billName,
    group: `group for ${billName}`,
    web: `website for ${billName}`,
    notes: `notes for ${billName}`,
    amount: 123.45,
    account: (account as Account.Doc)._id,
    category: categories[0]._id,
    rruleString: new RRule({ freq: RRule.MONTHLY }).toString()
  }
  return [ bank, account, budget, ...categories, bill ]
}

export const dummyBankWithTransactionsDocs = (bankName: string, accountName: string, count: number): AnyDocument[] => {
  const { bank, accounts } = dummyBank(bankName, [accountName])
  const baseTime = Date.now()
  const transactions: Transaction.Doc[] = []
  for (let i = 0; i < count; i++) {
    transactions.push(
      Transaction.doc(
        Account.buildView(accounts[0]),
        {
          time: baseTime + i,
          name: `transaction ${i}`,
          type: '',
          memo: `transaction ${i} memo`,
          amount: i,
          split: {}
        }
      )
    )
  }
  return [bank, ...accounts, ...transactions]
}

const dummyFI = (name: string, id: number): FI => {
  const profile: FinancialInstitutionProfile = {
    address1: name + ' address1',
    address2: name + ' address2',
    address3: name + ' address3',
    city: name + 'City',
    state: name + 'State',
    zip: name + 'ZIP',
    country: name + 'Country',
    email: name + '@' + name + '.com',
    customerServicePhone: '',
    technicalSupportPhone: '',
    fax: '',
    financialInstitutionName: '',
    siteURL: `http://www.${name.replace(/\s+/, '')}.com/`
  }

  return {
    name,
    fid: name.toUpperCase() + 'FID',
    org: name.toUpperCase() + 'ORG',
    ofx: `http://ofx.${name.replace(/\s+/, '')}.com/`,
    profile: profile,
    id
  }
}

export const dummyFiList = (): FI[] => [
  dummyFI('First Bank', 1),
  dummyFI('Second Bank', 2),
  dummyFI('Third Bank', 3),
  dummyFI('Fourth Bank', 4),
  dummyFI('Fifth Bank', 5),
  dummyFI('Sixth Bank', 6),
  dummyFI('Seventh Bank', 7),
  dummyFI('Eighth Bank', 8),
  dummyFI('Ninth Bank', 9),
  dummyFI('Tenth Bank', 10),
  dummyFI('Eleventh Bank', 11),
  dummyFI('Twelveth Bank', 12),
  dummyFI('Thirteenth Bank', 13),
  dummyFI('Fourteenth Bank', 14),
  dummyFI('Fifteenth Bank', 15),
  dummyFI('Sixteenth Bank', 16),
  dummyFI('Seventeenth Bank', 17),
  dummyFI('Eighteenth Bank', 18),
  dummyFI('Ninteenth Bank', 19),
  dummyFI('Twentieth Bank', 20),
]
