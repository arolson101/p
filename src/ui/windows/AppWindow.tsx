import * as React from 'react'
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

export const AppWindow = ({title, onBack, onForward, children}: AppWindowProps & React.Props<any>) =>
  <Window chrome>
    <Helmet
      link={[
        { rel: 'stylesheet', type: 'text/css', href: 'lib/metro-ui/css/metro.css' },
        { rel: 'stylesheet', type: 'text/css', href: 'lib/metro-ui/css/metro-icons.css' },
        { rel: 'stylesheet', type: 'text/css', href: 'lib/metro-bootstrap/css/metro-bootstrap.css' },
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
      background='rgb(0, 114, 198)'
      />

    <div style={{ display: 'flex', flex: '1', flexDirection: 'column' }}>

      {/*<nav className='navbar navbar-default color-accent theme-dark app-bar'>
        <div className='navbar-global color-accent theme-dark'>
          <div className='container-fluid' style={{ padding: 0 }}>
            <ul className='nav navbar-nav'>
              <li><a onClick={onBack as any}><span className='glyph glyph-arrow-left' aria-hidden='true' /></a></li>
              <li><a onClick={onForward as any}><span className='glyph glyph-arrow-right' aria-hidden='true' /></a></li>
            </ul>

            <div className='nav navbar-nav navbar-right'>
              <form className='navbar-form navbar-left'>
                <div className='form-group'>
                  <input type='text' className='form-control' placeholder='Search' />
                </div>
                <button type='submit' className='btn btn-default'></button>
              </form>
            </div>
          </div>
        </div>
      </nav>*/}

      <div className='app-bar'>
          <a className='app-bar-element' onClick={onBack as any}><span className='mif mif-arrow-left' aria-hidden='true' /></a>
          <a className='app-bar-element' onClick={onForward as any}><span className='mif mif-arrow-right' aria-hidden='true' /></a>

          {/*<ul className='app-bar-menu' style={{paddingLeft: 20}}>
              <li>
                  <a href='' className='dropdown-toggle'>Products</a>
                  <ul className='d-menu active' data-role='dropdown'>
                      <li><a href=''>Windows 10</a></li>
                      <li><a href=''>Spartan</a></li>
                      <li><a href=''>Outlook</a></li>
                      <li><a href=''>Office 2015</a></li>
                      <li className='divider'></li>
                      <li><a href='' className='dropdown-toggle'>Other Products</a>
                          <ul className='d-menu' data-role='dropdown'>
                              <li><a href=''>Internet Explorer 10</a></li>
                              <li><a href=''>Skype</a></li>
                              <li><a href=''>Surface</a></li>
                          </ul>
                      </li>
                  </ul>
              </li>
              <li><a href=''>Support</a></li>
              <li><a href=''>Help</a></li>
          </ul>*/}

          <div className='app-bar-element place-right' style={{paddingRight: 5, background: 'transparent'}}>
            <div className='input-control text' data-role='input'>
                <input type='text'/>
                <button className='button'><span className='mif mif-search' aria-hidden='true' /></button>
            </div>
          </div>
      </div>

      {children}
    </div>
  </Window>
