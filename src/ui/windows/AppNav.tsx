import * as React from 'react'
import { NavPane, NavPaneItem } from 'react-desktop/windows'
import { NavProps } from '../components/AppContent'
import './AppNav.css'

export const AppNav = ({items, selectedIndex, onClick, children}: NavProps & React.Props<any>) =>
  <div className='navpane'>
  <NavPane push>
    {items.map((item, index) =>
      <NavPaneItem
        key={item.title}
        title={item.title}
        selected={index === selectedIndex}
        icon={<i className={item.icon + ' fa-lg'}/>}
        style={{textDecoration: 'none !important'}}
        onSelect={() => onClick(item)}
      >
        {index === selectedIndex &&
          <div style={{backgroundColor: 'white'}}>
            {children}
          </div>
        }
      </NavPaneItem>
    )}
  </NavPane>
</div>
