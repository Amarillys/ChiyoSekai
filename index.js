const { app, BrowserWindow } = require('electron');

function createWindow () {
    const win = new BrowserWindow({
        width: 1024,
        height: 681,
        webPreferences: {
            nodeIntegration: true,
            webSecurity: true,
            experimentalFeatures: true,
            enableBlinkFeatures: 'OverlayScrollbars'
        },
        contentSecurityPolicy: `
            script-src 'self' 'https://unpkg.com' 'https://misuzu.moe';
            unsafe-eval 'true';
	    `
    });
    win.loadFile('index.html');
}

app.on('ready', createWindow);
app.on('window-all-closed', () => {
  app.quit();
});