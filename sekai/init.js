const global = this;
global.eval = function () {
    throw new Error(`Sorry, this app does not support window.eval().`)
}

global.LOOP = {
    ListLoop: 0,
    ListOnce: 1,
    OneLoop : 2,
    OneOnce : 3,
    Random  : 4
}

global.default = {
    "userid": "Guest",
    "passwd": "",
    "config": {
        "width"   : 400,
        "height"  : 300,
        "playList": ["Guest@Empty"],
        "loopMode": "0"
    },
    "theme" : {
        "cover": {
            "height": 200,
            "width" : 200
        },
        "controller" : {
            "width": 600,
            "height": 30,
            "buttonWidth": 26,
            "buttonHeight": 26,
            "buttonIndent": 4,
            "lines": 1,
            "buttons": {
                "stop": {
                    icon: "url(./img/stop.svg)",
                },
                "play": {
                    icon: "url(./img/play.svg)",
                },
                "pause": {
                    icon: "url(./img/pause.svg)",
                },
                "last": {
                    icon: "url(./img/last.svg)",
                },
                "next": {
                    icon: "url(./img/next.svg)",
                },
                "random": {
                    icon: "url(./img/random.svg)",
                }
            },
            "volumnbar" : {
                "width": 120,
            },
            "timebar": {
                
            }
        },
        "global": {
            "background": "#22ce64"
        },
        "playlist": {
            "width": 700,
            "height": 570,
            "tab" : {
                "height": 24,
            }
        },
        "filelist": {
            "musicIcon" : "./img/music.svg",
            "folderIcon": "./img/folder.svg",
            "returnIcon": "./img/return.svg"
        },
        "property": {
            "width": 200,
            "height": 300,
        },
        "user": {
            "width" : 200,
            "height": 100,
            "avatarMargin": 10,
        }
    }
};
