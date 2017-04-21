import * as React from 'react'
import { Nav, NavItem } from 'react-bootstrap'
import { FormattedNumber } from 'react-intl'
import { NavProps } from '../components/AppContent'
import './AppNav.css'

export const AppNav = ({groups, selectedId, onClick}: NavProps) =>
  <div>
    {groups.map(group =>
      <div key={group.title}>
        <em style={{padding: 10}}><small>{group.title}</small></em>
        <Nav bsStyle='pills' stacked>
          {group.items.map(item =>
            <NavItem key={item.title} active={item.id === selectedId} href={history.createHref(item)}>
              <span className={item.icon + ' fa-fw fa-lg'} />
              {' '}
              {item.title}
              {item.account &&
                <em><small className='pull-right'>
                  <FormattedNumber value={item.account.balance} style='currency' currency='USD'/>
                </small></em>
              }
            </NavItem>
          )}
        </Nav>
      </div>
    )}
  </div>
