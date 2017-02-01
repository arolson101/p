import * as React from 'react'
import { Window, TitleBar, Toolbar, SearchField, Button, Label } from 'react-desktop/macOs'
import { AppWindowProps } from '../components/Root'

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

export const AppWindow = ({children, title, onBack, onForward}: React.Props<any> & AppWindowProps) =>
  <Window
    chrome
    padding='10px'
  >
    <TitleBar inset controls >
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
