import * as React from 'react'
import { FormattedNumber } from 'react-intl'
import { NavProps } from '../components/AppContent'
import './AppNav.css'

const ulStyle = {listStyle: 'none', marginLeft: -30}

export const AppNav = ({groups, selectedId, onClick}: NavProps) =>
  <nav
    role='navigation'
    className='nav side-navigation side-navigation-large theme-default'
    style={{padding: 10, maxWidth: '100%'}}
  >
    <ul style={ulStyle}>
      {groups.map(group =>
        <li key={group.title}>
          <em><small>{group.title}</small></em>
          <ul style={ulStyle}>
            {group.items.map(item =>
              <li key={item.title}>
                <a
                  style={{cursor: 'pointer'}}
                  onClick={() => onClick(item)}
                  className={(item.id === selectedId ? 'active' : undefined)}
                >
                  <span className={item.icon + ' fa-fw fa-lg'} />
                    {' '}
                    {item.title}
                    {item.account &&
                      <em><small className='pull-right'>
                        <FormattedNumber value={item.account.balance} style='currency' currency='USD'/>
                      </small></em>
                    }
                </a>
              </li>
            )}
          </ul>
        </li>
      )}
    </ul>
  </nav>
