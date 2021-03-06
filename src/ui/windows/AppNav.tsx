import * as React from 'react'
import { Nav, NavItem } from 'react-bootstrap'
import { FormattedNumber } from 'react-intl'
import { compose } from 'recompose'
import { NavProps } from '../components/AppContent'
import './AppNav.css'

type EnhancedProps = NavProps

const enhance = compose<EnhancedProps, NavProps>(
)

export const AppNav = enhance(({ groups, selectedId, onClick }) =>
  <div>
    {groups.map(group =>
      <div key={group.title}>
        <em style={{ padding: 10 }}><small>{group.title}</small></em>
        <Nav bsStyle='pills' stacked>
          {group.items.map(item =>
            <NavItem key={item.title} active={item.id === selectedId} onClick={() => onClick(item)}>
              <span className={item.icon + ' fa-fw fa-lg'} />
              {' '}
              {item.title}
              {item.account &&
                <em><small className='pull-right'>
                  <FormattedNumber value={/*item.account.balance*/ 0} style='currency' currency='USD'/>
                </small></em>
              }
            </NavItem>
          )}
        </Nav>
      </div>
    )}
  </div>
)
