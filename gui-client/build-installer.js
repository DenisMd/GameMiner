var electronInstaller = require('electron-winstaller');

resultPromise = electronInstaller.createWindowsInstaller({
    appDirectory: './',
    outputDirectory: './dist',
    authors: 'DenisMD',
    exe: 'gameminer.exe'
});
resultPromise.then(() => console.log("It worked!"), (e) => console.log(`No dice: ${e.message}`));