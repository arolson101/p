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
  <Window
    chrome
    style={{overflow: 'hidden'}}
    >
    <Helmet
      link={[
        { rel: 'stylesheet', type: 'text/css', href: 'lib/winstrap/css/winstrap.css' },
        { rel: 'stylesheet', type: 'text/css', href: 'p.css' },
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

    <div style={{ display: 'flex', flex: '1', flexDirection: 'column' }}>

      <nav className='navbar navbar-default color-accent theme-dark app-bar'>
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
      </nav>
      <div>
        {children}
      </div>
    </div>
  </Window>
