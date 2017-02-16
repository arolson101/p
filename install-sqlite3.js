// Building for sqlcipher
// https://github.com/mapbox/node-sqlite3#building-for-sqlcipher
'use strict'
require('shelljs/global')
var isArray = require('util').isArray

var args
try {
  args = JSON.parse(process.env.npm_config_argv).original
} catch (e) {
  // ignore
} finally {
  if (!isArray(args)) {
    args = []
  }
}
var targetArgs = args.filter(function (arg) {
  return /^--(runtime|target)/.test(arg)
})
var targetStr = targetArgs.reduce(function (m, arg) {
  return m + ' ' + arg
}, '')

if (process.platform === 'win32') {
  // TODO: detect version
  let target = '1.4.15'
  let module_path = '../lib/binding/electron-v1.4-win32-x64';
  let module_name = 'node_sqlite3';
  cd('node_modules/win-sqlcipher/node_modules/sqlite3')
  exec(`node-gyp rebuild --target=${target} --arch=x64 --target_platform=win32 --dist-url=https://atom.io/download/atom-shell --module_name=${module_name} --module_path=${module_path}`)

} else {

  cd('node_modules/unix-sqlcipher/node_modules/sqlite3')

  if (process.platform === 'darwin') {
    // macos
    if (exec('which brew').stdout.trim() === '') {
      console.error('`brew` is required to be installed.')
      exit(1)
    }
    if (exec('brew list sqlcipher').code !== 0) {
      // exec('brew install sqlcipher')
      exec('brew install sqlcipher --with-fts')
    }
    exec('export LDFLAGS="-L`brew --prefix`/opt/sqlcipher/lib"')
    exec('export CPPFLAGS="-I`brew --prefix`/opt/sqlcipher/include"')

    exec('npm run prepublish')

    // TODO: detect version
    let target = '1.4.15'
    let module_path = '../lib/binding/electron-v1.4-darwin-x64';
    let sqlite_libname = 'sqlcipher';
    let sqlite = '`brew --prefix`';
    let module_name = 'node_sqlite3';
    exec(`node-gyp configure --sqlite_libname=${sqlite_libname} --sqlite=${sqlite} --module_name=${module_name} --module_path=${module_path}`)
    exec(`node-gyp rebuild --sqlite_libname=${sqlite_libname} --sqlite=${sqlite} --target=${target} --arch=x64 --target_platform=darwin --dist-url=https://atom.io/download/atom-shell --module_name=${module_name} --module_path=${module_path}`)
  } else {
    // linux
    exec('export LDFLAGS="-L/usr/local/lib"')
    exec('export CPPFLAGS="-I/usr/local/include -I/usr/local/include/sqlcipher"')
    exec('export CXXFLAGS="$CPPFLAGS"')
    exec('npm i --build-from-source --sqlite_libname=sqlcipher --sqlite=/usr/local --verbose' + targetStr)
  }
}
