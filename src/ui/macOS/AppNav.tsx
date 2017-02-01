import * as React from 'react'
import { ListView, ListViewRow, Text } from 'react-desktop/macOs'
import { NavProps } from '../components/AppContent'

export const AppNav = ({items, selectedIndex, children}: NavProps & React.Props<any>) =>
  <div style={{display: 'flex', flexDirection: 'row', flex: 1}}>
    <ListView
      disableRubberBand
      background='#f1f2f4'
      width='240'
      style={{flex: 'initial', overflow: 'auto'}}
    >
      {items.map((item, index) =>
        <ListViewRow key={item.title} background={selectedIndex === index ? '#d8dadc' : null}>
          <Text color='#414141'><i className={item.icon}/> {item.title}</Text>
        </ListViewRow>
      )}
    </ListView>
    <div style={{flex: 1, padding: 10}}>
      {children}
    </div>
  </div>
