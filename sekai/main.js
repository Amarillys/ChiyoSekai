/* config: auto load info of files */
/* eslint-env browser */
/* global Vue */
global.locale = 'zh_CN';

global.init = function (chiyosekai) {
    /* loading local config.json, check if online logined */
    const fs = require('fs');
    const path = require('path');
    fs.readFile(path.resolve(__dirname, 'data/chiyo.json'), (err, data) => {
        if (err) return;
        chiyosekai.loadConfig(JSON.parse(data));
    });
    fs.readFile(path.resolve(__dirname, 'data/sekai.json'), (err, data) => {
        if (err) return;
        chiyosekai.loadList(JSON.parse(data));
    });
    fs.readFile(path.resolve(__dirname, 'data/files.json'), (err, data) => {
        if (err) return;
        chiyosekai.loadFiles(JSON.parse(data));
    });
};

global.getUserdata = function(userid, callback) {
    fetch().then(userdata => callback(userdata)).catch( err => console.log(err) );
};

global.chiyosekai = new global.ChiyoSekai({ el: '#chiyosekai' });
global.init(global.chiyosekai);
