import * as React from 'react'
import { NavPane, NavPaneItem } from 'react-desktop/windows'
import { NavProps } from '../components/AppContent'

export const AppNav = ({items, selectedIndex, onClick, children}: NavProps & React.Props<any>) =>
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
          children
        }
      </NavPaneItem>
    )}
  </NavPane>
