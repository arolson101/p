import * as React from 'react'
import { NavProps } from '../components/AppContent'
import './AppNav.css'

export const AppNav = ({items, selectedIndex, onClick}: NavProps) =>
  <nav
    role='navigation'
    className='nav side-navigation side-navigation-large theme-default'
    style={{padding: 10, maxWidth: '100%'}}
  >
    <ul>
      {items.map((item, index) =>
        <li key={item.title}>
          <a
            style={{cursor: 'pointer'}}
            onClick={() => onClick(item)}
            className={(index === selectedIndex ? 'active' : undefined)}
          >
            <span className={item.icon + ' fa-fw fa-lg'} />
            {' '}
            {item.title}
            <em><small className='pull-right'>{item.balance}</small></em>
          </a>
        </li>
      )}
    </ul>
  </nav>
