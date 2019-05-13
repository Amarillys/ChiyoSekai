const global = this;
global.eval = function () {
    throw new Error('Sorry, this app does not support window.eval().');
};

global.locale = 'zh_CN';
global.user   = 'chiyo';
global.document = document;
global.getFileList = require('./lib/getFileList');
global.draggable = Vue.extend(require('vuedraggable'));
/* https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript */
global.uuid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

global.LOOP = {
    listloop: 0,
    listonce: 1,
    oneloop : 2,
    once    : 3,
    random  : 4
};

global.default = {
    "userid": "Guest",
    "passwd": "",
    "config": {
        "width"   : 300,
        "windowWidth": 1024,
        "playList": ["Guest@Empty"],
        "loopMode": 1,
        "fontColor" : "rgb(212, 195, 128)",
        "fontFamily": "\"Source Han Sans SC\", sans-serif",
        "stopAfterRemove": true
    },
    "theme" : {
        "cover": {
            "background": "rgba(30, 30, 30, 0.9)",
            "height": 300,
            "width" : 300
        },
        "controller" : {
            "background": "rgba(40, 40, 40, 0.9)",
            "width": 600,
            "height": 30,
            "buttonWidth": 24,
            "buttonHeight": 24,
            "buttonIndent": 6,
            "lines": 1,
            "buttons": [{
                name: "open",
                icon: "url(./img/open.svg)",
            }, {
                name: "split",
                icon: "url(./img/split.svg)",
            }, {
                name: "play",
                icon: "url(./img/play.svg)",
            }, {
                name: "stop",
                icon: "url(./img/stop.svg)",
            }, {
                name: "pause",
                icon: "url(./img/pause.svg)",
            }, {
                name: "last",
                icon: "url(./img/last.svg)",
            }, {
                name: "next",
                icon: "url(./img/next.svg)",
            }, {
                name: "random",
                icon: "url(./img/random.svg)",
            },  {
                name: "split",
                icon: "url(./img/split.svg)",
            }, {
                name: "remove",
                icon: "url(./img/remove.svg)",
            }, {
                name: "split",
                icon: "url(./img/split.svg)",
            }, {
                name: "add",
                icon: "url(./img/add.svg)",
            }, {
                name: "save",
                icon: "url(./img/save.svg)",
            }, {
                name: "delete",
                icon: "url(./img/delete.svg)",
            }, {
                name: "split",
                icon: "url(./img/split.svg)",
            }, {
                name: "volume",
                icon: "url(./img/volume.svg)",
            }],
            "volumebar" : {
                "width": 120,
            },
            "timebar": {

            }
        },
        "global": {
            "background": "#1E1E1E"
        },
        "playlist": {
            "background": "rbga(30, 30, 30, 0.9)",
            "width": 700,
            "tab" : {
                "height": 24,
                "fontSize": "1.1em",
                "maxWidth": "160px"
            }
        },
        "filelist": {
            "background"  : "rgba(40, 40, 40, 0.9)",
            "searchBg": "rgba(48, 48, 48, 0.9)",
            "searchSize": "1.2em",
            "searchColor": "#D4C380",
            "searchHeight": 32,
            "musicIcon" : "./img/music.svg",
            "folderIcon": "./img/folder.svg",
            "returnIcon": "./img/return.svg",
            "borderColor": "#111111",
            "bg" : "#282828"
        },
        "property": {
            "width": 100,
            "height": 200,
        },
        "statusbar": {
            height: 48
        },
        "user": {
            "background": "rgba(48, 48, 48, 0.9)",
            "width" : 100,
            "height": 100,
            "avatarMargin": 0,
        }
    }
};
