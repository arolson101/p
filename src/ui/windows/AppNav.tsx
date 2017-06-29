import * as React from 'react'
import { Nav, NavItem } from 'react-bootstrap'
import { FormattedNumber } from 'react-intl'
import { withRouter, RouteComponentProps } from 'react-router'
import { compose } from 'recompose'
import { NavProps } from '../components/AppContent'
import './AppNav.css'

type EnhancedProps = RouteComponentProps<any> & NavProps

const enhance = compose<EnhancedProps, NavProps>(
  withRouter,
)

export const AppNav = enhance(({groups, selectedId, onClick, history}) =>
  <div>
    {groups.map(group =>
      <div key={group.title}>
        <em style={{padding: 10}}><small>{group.title}</small></em>
        <Nav bsStyle='pills' stacked>
          {group.items.map(item =>
            <NavItem key={item.title} active={item.id === selectedId} onClick={() => onClick(item)}>
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
)
