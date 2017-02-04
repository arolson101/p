import * as React from 'react'
import { NavProps } from '../components/AppContent'
import './AppNav.css'

export const AppNav = ({items, selectedIndex, onClick, children}: NavProps & React.Props<any>) =>
  <div style={{ flex: 1, display: 'flex' }}>
    <nav role='navigation' id='sidenav' className='nav side-navigation side-navigation-large theme-default' style={{padding: 10}}>
        <ul>
          {items.map((item, index) =>
            <li key={item.title}>
              <a style={{cursor: 'pointer'}} onClick={() => onClick(item)} className={(index === selectedIndex ? 'active' : undefined)}>
                <span className={item.icon + ' fa-fw fa-lg'} />
                {' '}
                {item.title}
                <em><small className='pull-right'>{item.balance}</small></em>
              </a>
            </li>
          )}
      </ul>
    </nav>

    <div style={{ backgroundColor: 'white', flex: 1 }}>
      {children}
    </div>
  </div>
