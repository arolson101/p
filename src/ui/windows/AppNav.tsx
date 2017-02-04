import * as React from 'react'
import { NavProps } from '../components/AppContent'
import './AppNav.css'

export const AppNav = ({items, selectedIndex, onClick, children}: NavProps & React.Props<any>) =>
  <div style={{ flex: 1, display: 'flex' }}>
    <div className='entity-list'>
      {items.map((item, index) =>
        <div
          key={item.title}
          className={(index === selectedIndex ? 'active' : undefined) + ' entity-list-item'}
          onClick={() => onClick(item)}
        >
          <div className='item-icon'>
            <i className={item.icon + ' fa-2x'} />
          </div>
          {item.balance &&
            <div className='item-content-secondary'><em style={{ color: 'gray' }} className='pull-right'>$1,234.56</em></div>
          }
          <div className='item-content-primary'>{item.title}</div>
        </div>
      )}
    </div>

    <div style={{ backgroundColor: 'white', flex: 1 }}>
      {children}
    </div>
  </div>
