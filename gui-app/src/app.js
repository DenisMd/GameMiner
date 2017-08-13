const {app, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');
const GhReleases = require('electron-gh-releases');

const electron = require('electron');

if (handleSquirrelEvent(app)) {
    return;
}

// ------------------------------------------------ GitHub autoUpdater

let ghOptions = {
    repo: 'DenisMd/GameMiner',
    currentVersion: app.getVersion()
};

const updater = new GhReleases(ghOptions);

updater.check((err, status) => {
    if (!err && status) {
        updater.download()
    }
});

updater.on('update-downloaded', (info) => {
    updater.install()
});


// ------------------------------------------------ Creating main window
let win;

function createWindow () {
    win = new BrowserWindow({width: 1000, height: 600});
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));
    win.setMenu(null);
    win.html5Mode = true;
    win.on('closed', () => {
        win = null
    })
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', () => {
    if (win === null) {
        createWindow()
    }
});


exports.openWindows = (filename) => {
    let newWin = new BrowserWindow({width: 800, height: 600});
    newWin.loadURL(`file://${__dirname}/${filename}.html`);
};

// ------------------------------------------------ Packing application
function handleSquirrelEvent(application) {
    if (process.argv.length === 1) {
        return false;
    }

    const ChildProcess = require('child_process');
    const path = require('path');

    const appFolder = path.resolve(process.execPath, '..');
    const rootAtomFolder = path.resolve(appFolder, '..');
    const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
    const exeName = path.basename(process.execPath);

    const spawn = function(command, args) {
        let spawnedProcess, error;

        try {
            spawnedProcess = ChildProcess.spawn(command, args, {
                detached: true
            });
        } catch (error) {}

        return spawnedProcess;
    };

    const spawnUpdate = function(args) {
        return spawn(updateDotExe, args);
    };

    const squirrelEvent = process.argv[1];
    switch (squirrelEvent) {
        case '--squirrel-install':
        case '--squirrel-updated':
        // Optionally do things such as:
        // - Add your .exe to the PATH
        // - Write to the registry for things like file associations and
        //   explorer context menus

        // Install desktop and start menu shortcuts
        spawnUpdate(['--createShortcut', exeName]);

        setTimeout(application.quit, 1000);
        return true;

        case '--squirrel-uninstall':
            // Undo anything you did in the --squirrel-install and
            // --squirrel-updated handlers

            // Remove desktop and start menu shortcuts
            spawnUpdate(['--removeShortcut', exeName]);

            setTimeout(application.quit, 1000);
            return true;

        case '--squirrel-obsolete':
            // This is called on the outgoing version of your app before
            // we update to the new version - it's the opposite of
            // --squirrel-updated

            application.quit();
            return true;
    }
};