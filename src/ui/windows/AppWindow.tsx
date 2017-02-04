import * as React from 'react'
import { Navbar, Nav, NavItem, FormGroup, FormControl, Button } from 'react-bootstrap'
import { Window, TitleBar } from 'react-desktop/windows'
import * as Helmet from 'react-helmet'
import { AppWindowProps } from '../components/AppWindow'
import * as electron from 'electron'

const onCloseClick = () => electron.remote.BrowserWindow.getFocusedWindow().close()
// const onMaximizeClick = () => electron.remote.BrowserWindow.getFocusedWindow().maximize()
const onMinimizeClick = () => electron.remote.BrowserWindow.getFocusedWindow().minimize()
const toggleMaximize = () => {
  if (electron.remote.BrowserWindow.getFocusedWindow().isMaximized()) {
    electron.remote.BrowserWindow.getFocusedWindow().unmaximize()
  } else {
    electron.remote.BrowserWindow.getFocusedWindow().maximize()
  }
}

export const AppWindow = ({title, onBack, children}: AppWindowProps & React.Props<any>) =>
  <Window
    chrome
  >
    <Helmet
      link={[
        {rel: 'stylesheet', type: 'text/css', href: 'lib/winstrap/css/winstrap.css'},
        {/*{rel: 'stylesheet', type: 'text/css', href: 'lib/metro-ui/css/metro.css'},
        {rel: 'stylesheet', type: 'text/css', href: 'lib/metro-ui/css/metro-responsive.css'},
        {rel: 'stylesheet', type: 'text/css', href: 'lib/metro-ui/css/metro-schemes.css'},
        {rel: 'stylesheet', type: 'text/css', href: 'lib/metro-ui/css/metro-icons.css'}*/}
      ]}
    />

    <TitleBar
      title={title}
      controls
      onCloseClick={onCloseClick}
      onMinimizeClick={onMinimizeClick}
      onMaximizeClick={toggleMaximize}
      onRestoreDownClick={toggleMaximize}
      theme='dark'
      background='#0078D7'
    />

    <div style={{display: 'flex', flex: '1', flexDirection: 'column'}}>

    <nav className='navbar navbar-default app-bar'>
        <div className='navbar-local color-accent theme-dark'>
            <div className='container-fluid'>
                <div className='navbar-header'>
                    <a className='navbar-brand' href='#'>Brand</a>
                </div>

                <div className='collapse navbar-collapse' id='bs-example-navbar-collapse-2'>
                    <ul className='nav navbar-nav'>
                        <li className='active'><a href='#'>Link <span className='sr-only'>(current)</span></a></li>
                        <li><a href='#'>Link</a></li>
                    </ul>

                    <ul className='nav navbar-nav navbar-right'>
                        <li><a href='#'>Link</a></li>
                    </ul>
                </div>
            </div>
        </div>
    </nav>


      {children}
    </div>
  </Window>
