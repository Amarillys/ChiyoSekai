/* config: auto load info of files */
/* eslint-env browser */
global.init = function (chiyosekai) {
    /* loading local config.json, check if online logined */
    const fs = require('fs');
    const path = require('path');
    const { promisify } = require('util');
    const mkdir = promisify(fs.mkdir);
    const exist = promisify(fs.access);
    let readList = async () => {
        let listPath = path.resolve(__dirname, '../data');
        try {
            await exist(listPath);
        } catch (e) {
            await mkdir(listPath);
        }
        try {
            await exist(listPath + '/playlist');
        } catch (e) {
            await mkdir(listPath + '/playlist');
        }
        const playlists = global.getFileList(listPath, ['son']);
        if (playlists.length > 0) {
            playlists.forEach(list => fs.readFile(list, (err, data) => {
                if (err) return;
                data = JSON.parse(data);
                if (data.user === global.user)
                    chiyosekai.loadList(data);
            }));
        }
    };
    readList();
};

global.getUserdata = function(userid, callback) {
    fetch().then(userdata => callback(userdata)).catch( err => console.log(err) );
};

global.getInfo = function(music, callback) {
    Object.assign(music, {
        artist: null,
        cover    : null,
    });
    if (music.url.toLowerCase().startsWith('http') || music.url.toLowerCase().startsWith('ftp') ) {
        // deal with web file
        global.jsmediatags.read(music.url, {
            onSuccess: tag => {
                music.cover = URL.createObjectURL(new Blob([Uint8Array.from(tag.tags.picture.data)], { type: tag.tags.picture.format }));
                callback(music);
            },
            onError: err => console.log(err)
        });
    } else {
        // deal with local file(electron only)
        if (!(global.require && global.require('music-metadata')))
            return console.log('Local files are allowed only on electron(desktop).');
        const tagReader = require('music-metadata');
        tagReader.parseFile(music.url).then( info => {
            if (info.common.picture)
                music.cover = URL.createObjectURL(new Blob([Uint8Array.from(info.common.picture[0].data)], { type: info.common.picture[0].format }));
            Object.assign(music, {
                artist:     info.common.artist,
                title:      info.common.title,
                album:      info.common.album,
                format:     info.format.dataformat,
                bitrate:    info.format.bitrate,
                sampleRate: info.format.sampleRate,
                duration:   `${Math.floor(info.format.duration / 60)}:${ ('0' + Math.floor(info.format.duration % 60)).slice(-2) }`
            });
            callback(music);
        }).catch(err => console.log(err));
    }
};

global.chiyosekai = new global.ChiyoSekai({ el: '#chiyosekai' });
global.init(global.chiyosekai);
