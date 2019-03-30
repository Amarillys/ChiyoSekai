const global = this;
global.eval = function () {
    throw new Error('Sorry, this app does not support window.eval().');
};

global.LOOP = {
    ListLoop: 0,
    ListOnce: 1,
    OneLoop : 2,
    OneOnce : 3,
    Random  : 4
};

global.default = {
    "userid": "Guest",
    "passwd": "",
    "config": {
        "width"   : 400,
        "playList": ["Guest@Empty"],
        "loopMode": "0",
        "fontColor" : "#D4C380",
        "fontFamily": "\"Source Han Sans SC\", sans-serif"
    },
    "theme" : {
        "cover": {
            "background": "rgba(40, 40, 40, 0.9)",
            "height": 200,
            "width" : 200
        },
        "controller" : {
            "background": "rgba(40, 40, 40, 0.9)",
            "width": 600,
            "height": 30,
            "buttonWidth": 24,
            "buttonHeight": 24,
            "buttonIndent": 6,
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
            "background": "#1E1E1E"
        },
        "playlist": {
            "background": "rbga(30, 30, 30, 0.9)",
            "width": 700,
            "tab" : {
                "height": 24,
                "fontSize": "1.1em"
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
            "width": 200,
            "height": 300,
        },
        "user": {
            "background": "rgba(48, 48, 48, 0.9)",
            "width" : 200,
            "height": 100,
            "avatarMargin": 10,
        }
    }
};
