const { app, BrowserWindow } = require('electron');

function createWindow () {
    const win = new BrowserWindow({ 
        width: 1156,
        height: 768, 
        webPreferences: { 
            nodeIntegration: true,
            webSecurity: true,
        },
        contentSecurityPolicy: `
            script-src 'self' 'https://unpkg.com' 'https://misuzu.moe';
            unsafe-eval 'true';
	    `
    });
    win.loadFile('index.html');
}

app.on('ready', createWindow);
