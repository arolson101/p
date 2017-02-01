import * as React from 'react'
import { Window, TitleBar } from 'react-desktop/windows'
import { AppWindowProps } from '../components/Root'

// const buttonStyle: React.CSSProperties = {
//   WebkitUserSelect: 'none',
//   '-webkit-app-region': 'no-drag',
//   cursor: 'default',
//   width: '46px',
//   height: '100%',
//   lineHeight: 0,
//   display: 'flex',
//   justifyContent: 'center',
//   alignItems: 'center',
// }

export const AppWindow = ({title, onBack, children}: AppWindowProps & React.Props<any>) =>
  <Window
    chrome
  >
    {/*<div style={{display: 'flex', flex: '1', flexDirection: 'column'}}>
      <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', backgroundColor:'#0078D7'}}>
        <a style={buttonStyle}>
          <i className='fa fa-angle-left fa-lg' style={{color: 'black'}}/>
        </a>*/}
        <TitleBar title={title} controls theme='dark' background='#0078D7'/>
      {/*</div>*/}
      {children}
    {/*</div>*/}
  </Window>
