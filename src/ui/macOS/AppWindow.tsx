import * as React from 'react'
import { Window, TitleBar, Toolbar, SearchField, Button, Label } from 'react-desktop/macOs'
import { AppWindowProps } from '../components/AppWindow'
import * as electron from 'electron'

const icons = {
  backButton: {
    className: 'fa fa-angle-left fa-lg',
  },
  forwardButton: {
    className: 'fa fa-angle-right fa-lg',
  }
}

const styles = {
  navButton: {
    height: 24,
    width: 28,
    paddingLeft: 0,
    paddingRight: 0,
    WebkitAppRegion: 'no-drag',
  },
  navButtonIcon: {
    color: 'darkgrey'
  },
}

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

export const AppWindow = ({children, title, onBack, onForward}: React.Props<any> & AppWindowProps) =>
  <Window
    chrome
    padding='0px'
  >
    <TitleBar
      inset
      controls
      onCloseClick={onCloseClick}
      onMinimizeClick={onMinimizeClick}
      onMaximizeClick={toggleMaximize}
      onResizeClick={toggleMaximize}
    >
      <Toolbar height='36' horizontalAlignment='left'>
        <Button style={styles.navButton} marginLeft={10} onClick={onBack}>
          <i {...icons.backButton} style={styles.navButtonIcon}/>
        </Button>
        <Button style={styles.navButton} onClick={onForward}>
          <i {...icons.forwardButton} style={styles.navButtonIcon}/>
        </Button>
      </Toolbar>

      <Label horizontalAlignment='center'>{title}</Label>

      <Toolbar horizontalAlignment='right'>
        <SearchField
          placeholder='Search'
          defaultValue=''
        />
      </Toolbar>
    </TitleBar>
    {children}
  </Window>
