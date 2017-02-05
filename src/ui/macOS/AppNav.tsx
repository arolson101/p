import * as React from 'react'
import { ListView, ListViewRow, Text } from 'react-desktop/macOs'
import { NavProps } from '../components/AppContent'
import './AppNav.css'

export const AppNav = ({items, selectedIndex, onClick}: NavProps) =>
  <ListView
    disableRubberBand
    background='rgba(240,240,240,0.6)'
    style={{flex: 'initial', overflow: 'auto'}}
    className='appnav'
  >
    {items.map((item, index) =>
      <ListViewRow
        key={item.title}
        background={selectedIndex === index ? 'rgba(162,162,162,0.5)' : null}
        onClick={() => onClick(item)}
      >
        <Text color='#414141'><i className={item.icon + ' fa-lg'}/> {item.title}</Text>
      </ListViewRow>
    )}
  </ListView>
