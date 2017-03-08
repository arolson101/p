const electron = require('electron')
const path = require('path')
const fs = require('fs')
const { ipcMain } = electron
// const electron_devtools_installer = require('electron-devtools-installer');
// const installExtension = electron_devtools_installer.default;
// //const  { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
// const POUCHDB_INSPECTOR = 'hbhhpaojmpfimakffndmpmpndcmonkfa';

// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow


// installExtension(POUCHDB_INSPECTOR)
//     .then((name) => console.log(`Added Extension:  ${name}`))
//     .catch((err) => console.log('An error occurred: ', err));

let indexURL = `file://${__dirname}/index.html`;

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development'
}
const __DEVELOPMENT__ = (process.env.NODE_ENV == 'development');


if (__DEVELOPMENT__) {
  const port = 3003;
  // const WebpackDevServer = require('webpack-dev-server');
  // const webpack = require('webpack');
  // const config = require('../webpack.config.js');
  indexURL = `http://localhost:${port}`;
  // config.entry.unshift(`webpack-dev-server/client?${indexURL}`);
  // config.entry.unshift('webpack/hot/only-dev-server');
  // config.entry.unshift('react-hot-loader/patch');
  // config.plugins.push(new webpack.HotModuleReplacementPlugin());
  // config.plugins.push(new webpack.NamedModulesPlugin());
  // const compiler = webpack(config);
  // const server = new WebpackDevServer(compiler, {
	// 	contentBase: __dirname,
  //   hot: true,
  //   historyApiFallback: true,
  //   //stats: { colors: true }
  //   noInfo: true,
  //   quiet: true
  // });
  // server.listen(port);
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  var configPath = path.join(app.getPath("userData"), "config.json");

  var config = readConfig(configPath);
  config.webPreferences = {webSecurity: false};
  config.frame = false;
  config.vibrancy = 'medium-light';

  // Create the browser window.
  mainWindow = new BrowserWindow(config)

  // and load the index.html of the app.
  mainWindow.loadURL(indexURL)

  // Open the DevTools.
  if (__DEVELOPMENT__) {
    const devtools = require('electron-devtools-installer');
    const installExtension = devtools.default;

    Promise.all(
      [devtools.REACT_DEVELOPER_TOOLS, devtools.REDUX_DEVTOOLS]
      .map(installExtension)
    )
    .then((name) => console.log(`Added Extension:  ${name}`))
    .catch((err) => console.log('An error occurred: ', err))
    .then(() => mainWindow.webContents.openDevTools());
  }

  mainWindow.on('app-command', (e, cmd) => {
    // Navigate the window back when the user hits their mouse back button
    if (cmd === 'browser-backward' && mainWindow.webContents.canGoBack()) {
      mainWindow.webContents.goBack()
    }
    if (cmd === 'browser-forward' && mainWindow.webContents.canGoForward()) {
      mainWindow.webContents.goForward()
    }
  })

  mainWindow.on('close', function() {
    writeConfig(configPath);
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})


const electronOauth2 = require('electron-oauth2')

const windowParams = {
  alwaysOnTop: true,
  autoHideMenuBar: true,
  webPreferences: {
      nodeIntegration: false
  }
}

ipcMain.on('oauth-getAccessToken', function (event, arg) {
  const { config, options, channel } = arg
  const myApiOauth = electronOauth2(config, windowParams);

  myApiOauth.getAccessToken(options)
    .then(
      token => {
        event.sender.send(channel, {token})
      },
      error => {
        event.sender.send(channel, {error: error.message})
      }
    );
})

ipcMain.on('oauth-refreshToken', function (event, arg) {
  const { config, refreshToken, channel } = arg
  const myApiOauth = electronOauth2(config, windowParams);

  myApiOauth.refreshToken(refreshToken)
    .then(
      token => {
        event.sender.send(channel, {token})
      },
      error => {
        event.sender.send(channel, {error: error.message})
      }
    );
})


function readConfig(configPath) {
  var data;
  try {
    data = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }
  catch(e) {
  }

  return Object.assign(
    {
      width: 1280,
      height: 1024
    },
    data
  );
}

function writeConfig(configPath) {
  var data = Object.assign(
    {},
    readConfig(configPath),
    mainWindow.getBounds()
  );
  fs.writeFileSync(configPath, JSON.stringify(data));
}