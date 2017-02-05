import * as React from 'react'
import { ListView, ListViewSection, ListViewSectionHeader, ListViewRow, Text } from 'react-desktop/macOs'
import { FormattedNumber } from 'react-intl'
import { NavProps } from '../components/AppContent'
import './AppNav.css'

export const AppNav = ({groups, selectedId, onClick}: NavProps) =>
  <ListView
    disableRubberBand
    background='rgba(240,240,240,0.6)'
    style={{overflow: 'auto', paddingTop: 10}}
    className='appnav'
  >
    {groups.map(group =>
      <ListViewSection
        key={group.title}
        header={
          <ListViewSectionHeader>{group.title}</ListViewSectionHeader>
        }
      >
      {group.items.map(item =>
        <ListViewRow
          key={item.title}
          background={selectedId === item.id ? 'rgba(162,162,162,0.5)' : null}
          onClick={() => onClick(item)}
        >
          <Text color='#414141' style={{width: '100%'}}>
            <i className={item.icon + ' fa-lg'}/>
            {' '}
            {item.title}
            {item.account &&
              <em><small className='pull-right'>
                <FormattedNumber value={item.account.balance} style='currency' currency='USD'/>
              </small></em>
            }
          </Text>
        </ListViewRow>
      )}
      </ListViewSection>
    )}
  </ListView>
