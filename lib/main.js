/* config: auto load info of files */
/* eslint-env browser */
/* global Vue */
const locale = 'zh_CN';
const G = this;
G.user   = 'chiyo';
G.getFileList = require('./lib/getFileList');

G.Controller = Vue.extend({
    props: ['curlist', 'lists', 'playing', 'toolbar', 'theme'],
    data() {
        return {
            config: null,
            working: true,
        };
    },
    template:
    `
    <div id="controller" :style="{ background: theme.background }">
        <audio @ended="$emit('next')" ref="control">
            <source ref="source" id="player" src>
        </audio>
        <div id="toolbar" :style="{ height: theme.height + 'px', padding : '2px' }">
            <div v-for="button in theme.buttons" class="toolbtn"
            :style="{ backgroundImage: button.icon,
                width: theme.buttonWidth + 'px',
                height: theme.buttonHeight + 'px',
                'background-size': 'cover',
                margin: marginV + 'px ' + theme.buttonIndent + 'px ' + marginV + 'px ' + theme.buttonIndent + 'px'}"
                @click="btnHandler(button.name)" :title="text(button.name)">
            </div>
        </div>
        <div id="volumnBar"></div>
    </div>
    `,
    computed: {
        marginV() {
            return (this.theme.height - this.theme.buttonHeight) / 2 > 0 ?
                (this.theme.height - this.theme.buttonHeight) / 2 : 0;
        },
    },
    methods: {
        btnHandler(button) {
            switch (button) {
                case 'play':
                    return this.playMusic(this.curlist, this.playing);
                case 'stop':
                    return this.stop();
                case 'next':
                    return this.$emit('playMusic', this.playing + 1);
                case 'last':
                    return this.$emit('playMusic', this.playing - 1);
                case 'pause':
                    return this.pause();
                case 'random':
                    return this.$emit('playMusic', Math.floor(Math.random() * this.lists[this.curlist].content.length + 0.5));
                case 'add':
                    return this.$emit('addList');
                case 'save':
                    return this.$emit('saveList');
                case 'open':
                    return this.$emit('openFolder');
                case 'delete':
                    return this.$emit('deleteList');
                case 'split':
                default:
                    break;
            }
        },
        playMusic(curlist, index) {
            if (index === this.playing)
                return (this.$refs.control.load(), this.play());
            fetch(this.lists[curlist].content[index].url, { headers: { Range: "bytes=0-1" } })
            .then( () => {
                this.working = true;
                this.$refs.source.setAttribute('src', this.lists[curlist].content[index].url);
                this.$refs.control.load();
                this.play();
            })
            .catch( err => {
                this.working = false;
                this.$refs.source.setAttribute('src', null);
                console.log(err);
            });
        },
        loadConfig(userConfig) {
            this.config = userConfig;
        },
        pause() {
            if (this.working) {
                if (this.$refs.control.paused)
                    return this.$refs.control.play();
                this.$refs.control.pause();
            }
        },
        stop() {
            if (this.working)
                this.$refs.control.stop();
        },
        play() {
            if (this.playing === null)
                return this.$emit('playMusic', 0);
            if (this.working)
                this.$refs.control.play();
        },
        switch() {
            if (this.working)
                this.$refs.control.paused ? this.play() : this.pause();
        },
        text(key) {
            return {
                open   : { zh_CN: '打开目录',   en: 'Open Folder' },
                add    : { zh_CN: '添加播放列表',   en: 'Add Playlist' },
                play   : { zh_CN: '播放',   en: 'Play'  },
                next   : { zh_CN: '下一曲', en: 'Next'  },
                stop   : { zh_CN: '停止',   en: 'Stop'  },
                pause  : { zh_CN: '暂停',   en: 'Pause' },
                last   : { zh_CN: '上一首', en: 'Last'  },
                random : { zh_CN: '随机',   en: 'Random' },
                save   : { zh_CN: '保存播放列表',  en: 'Save Playlist' },
                split  : { zh_CN: '',       en: '' },
                delete : { zh_CN: '删除播放列表', en: 'Delete Playlist' }
            }[key][this.locale];
        }
    }
});

G.Cover = Vue.extend({
    props: ['theme', 'config'],
    data() {
        return {
            url: null
        };
    },
    template:
    `
    <div id="cover" :style="{
        width: theme.width + 'px',
        height: theme.height + 'px',
        background: theme.background
    }">
        <img id="cover" :src="this.url" :style="{ width: theme.width + 'px', height: theme.height + 'px' }">
    </div>
    `,
    methods: {
        setImgUrl(url) {
            this.url = url;
        }
    }
});

G.User = Vue.extend({
    data() {
        return {
            username: 'Sekai',
            avatar: 'https://misuzu.moe/store/image/qq.jpg'
        };
    },
    props: ['theme'],
    computed: {
        avatarSize() {
            return (Math.min(this.theme.height, this.theme.width) - this.theme.avatarMargin * 2) + 'px';
        }
    },
    template:
    `
    <div id="user" :style="{ height: theme.height + 'px', width: theme.width + 'px' }">
        <img id="avatar" :style="{ height: avatarSize, width: avatarSize, margin: theme.avatarMargin + 'px' }" :src="avatar"></img>
        <div>
            <div></div>
            <div></div>
        </div>
    </div>
    `,
    methods: {
        loadUserdata() {

        }
    }
});

G.Property = Vue.extend({
    props: ['config'],
    template:
    `<div id="property" :style="{
    }"></div>`
});

G.Lyric = Vue.extend({
    template:
    `
    <div id="lyric">
    </div>
    `,
});

G.FileList = Vue.extend({
    props : ['files', 'userConfig', 'theme'],
    data() {
        return {
            view   : [{ "name": "Empty", "child": [] }],
            config : G.default.config,
            parent : null,
            search : '',
        };
    },
    watch: {
        files: {
            handler(newFiles) {
                this.view = newFiles;
            }
        },
    },
    mounted() {
        this.view   = this.files;
        this.parent = null;
    },
    template :
    `
    <div id="file-container" :style="{ width: config.width + 'px' }">
        <div >
            <input id="filesearch" type="text" v-model="search" :style="{
                height: theme.searchHeight + 'px',
                fontSize   : theme.searchSize,
                fontFamily : config.fontFamily,
                color      : theme.searchColor,
                background : theme.searchBg
            }"></input>
        </div>
        <div id="filelist" :style="{
            background : theme.background,
            color      : config.fontColor,
            height     : (theme.height - 4 - 5 - theme.inputHeight) + 'px'
        }">
            <div class="file back" v-if="this.parent != null" @click="exit()">
                <img class="fileicon return"></img>
                <span class="filename">{{ text("back") }}</span>
            </div>
            <div class="file" v-for="file in view.filter(file => file.name.includes(this.search) || (file.artist && file.artist.includes(this.search)) )" @dblclick="enter(file.name)" :title="file.name">
                <img class="fileicon" :class="{ folder: !(file.child == undefined || file.child == null), music : (file.child == undefined || file.child == null) }"></img>
                <span class="filename">{{ file.name }}</span>
            </div>
        </div>
    </div>
    `,
    methods  : {
        text(key) {
            return {
                back : { zh_CN: '返 回', en: 'Back' }
            }[key][this.locale];
        },
        exit() {
            this.view = this.parent.content.filter(file => file.name.includes(this.search));
            this.parent = this.parent.parent;
        },
        enter(filename) {
            let target = this.view.find( file => file.name === filename );
            if (target.child) {
                this.parent = {
                    content: this.view,
                    parent : this.parent
                };
                this.view   = target.child.filter(file => file.name.includes(this.search));
            } else {
                this.$emit('addMusic', target);
            }
        },
        initTheme() {
            return {
            };
        },
        initConfig() {
        },
    },
});

G.PlayList = Vue.extend({
    data() {
        return {
            editable: null,
            active: null,
            tabFocus: false
        };
    },
    props: ['lists', 'curlist', 'display', 'theme', 'config'],
    template: `
        <div id="playlist" class="chiyo-height-fill" :style="{ background: theme.background }">
            <div id="tablist">
                <input v-for="list, index in lists" class="tab" @click="switchList(index)"
                    :style="{ height: theme.tab.height + 'px', fontSize: theme.tab.fontSize,
                        maxWidth: theme.tab.maxWidth, textAlign: 'center', width: (list.name.length * 18) + 'px' }"
                    :class="{ active: index == curlist, inactive: index != curlist, noborder: true }"
                    v-model="list.name" :readonly="editable != index" @dblclick="editable = index" @blur="editable = -1">
                </input>
            </div>
            <table id="list" :style="{
                height: lists[curlist].content.length * 30 + 'px',
                color : config.fontColor
            }">
                <thead>
                    <th class="header" v-for="header in display"
                        :style="{ width: header.width > 0 ? header.width + 'px' : 'auto' }">
                        {{ text(header.name) }}
                    </th>
                </thead>
                <tr v-for="music, index in lists[curlist].content" @dblclick="$emit('playMusic', index)"
                    :class="{ activeMusic: index == active }" @click="active = index">
                    <td v-for="header in display" class="nowrap" :title="music[header.name]">
                        {{ music[header.name] }}
                    </td>
                </tr>
            </table>
        </div>
    `,
    methods: {
        switchList(index) {
            this.$emit('switchList', index);
        },
        deleteMusic() {

        },
        text(key) {
            return {
                album   : { zh_CN: '专辑', en: 'Album' },
                name    : { zh_CN: '音乐名', en: 'Music Name' },
                artist  : { zh_CN: '艺术家', en: 'Artist' },
                url     : { zh_CN: '来源网址', en: 'Source URL' },
                duration: { zh_CN: '时长', en: 'Length' }
            }[key][this.locale];
        }
    },
});

G.PromptWindow = Vue.extend({
    props: ['nyan'],
    data() {
        return {
            type: 'info',
            buttons: {
                info : ['okay'],
                ask  : ['confirm', 'cancel'],
                error: ['okay']
            },
            text: 'Nyan~~喵喵喵~~',
            title: 'Nyan~~喵喵喵~~',
            active: false,
            callback: {
                'okay': () => {}
            },
            params: {}
        };
    },
    template:
    `
    <div id="p-mask" :style="{ opacity: active ? 0.8: 0, zIndex: active ? 233: -1 }">
        <div id="prompt-window">
            <div id="header">
                <div id="title">
                    {{ title }}
                </div>
            </div>
            <div id="body">
                <div id="text">
                    {{ text }}
                </div>
                <div id="footer">
                    <button v-for="btn in buttons[type]" @click="btnHandler(btn)">{{ i18n(btn) }}</button>
                </div>
            </div>
        </div>
    </div>
    `,
    mounted() {
        this.$emit('nyan', this.invoke);
        global.nyan = this.invoke;
    },
    methods: {
        invoke(type, text, title, callback, params) {
            this.title    = title || this.title;
            this.text     = text  || this.text;
            this.type     = type  || 'info';
            this.callback = callback;
            this.params   = params;
            this.active   = true;
        },
        i18n(key) {
            return {
                confirm: { zh_CN: '确定',   en: 'Confirm' },
                cancel : { zh_CN: '取消',   en: 'Cancel' },
                okay   : { zh_CN: 'Okay',   en: 'Okay'  },
                info   : { zh_CN: '提示', en: 'Info'  },
                error  : { zh_CN: '错误发生啦',   en: 'Error Nyan'  },
                ask    : { zh_CN: '操作确认喵',   en: 'Operation Confirm Nyan' }
            }[key][global.locale];
        },
        btnHandler(btn) {
            if (this.callback && this.callback[btn])
                this.callback[btn].apply(this.params && this.params[btn]);
            this.active = false;
        }
    }
});

G.ChiyoSekai = Vue.extend({
    data() {
        return {
            files   : [{ "name": "Empty", "child": [] }],
            curlist : 0,
            lists   : [{ name: 'sekai', user: 'chiyo', content: [] }],
            listview: [{ name: 'name', width: 150 }, { name: 'artist', width: 80 },
                    { name: 'duration', width: 50 }, { name: 'album', width: 100 }],
            playing : null,
            loop    : G.LOOP.ListLoop,
            config  : G.default,
            theme   : G.default.theme,
            indialog: false,
            nyan    : null
        };
    },
    components: { FileList, PlayList, Property, Lyric, Cover, Controller, User, PromptWindow },
    template:
    `
    <div style="height:100%; width: 100%">
        <div id="chiyosekai" :style="{ height: '100%', width: '100%', background: config.theme.global.background }">
            <div id="chiyo-left">
                <FileList ref="filelist" :files="files" v-on:addMusic="addMusic" :theme="theme.filelist"></FileList>
                <div class="leftbottom">
                    <div class="chiyo-left">
                        <User :theme="config.theme.user"></User>
                        <Cover ref="cover" :theme="config.theme.cover"></Cover>
                    </div>
                    <div class="chiyo-right">
                        <Property ref="property" :config="config.theme.property"></Property>
                    </div>
                </div>
            </div>
            <div id="center">
                <Controller ref="controller" :playing="playing" :lists="lists" :theme="theme.controller"
                    :curlist="curlist" :list="curlist" @playMusic="playMusic" @deleteList="deleteList"
                    @saveList="saveList" @addList="addList" @openFolder="openFolder" @next="nextMusic">
                </Controller>
                <PlayList ref="playlist" :lists="lists" :display="listview" :curlist="curlist"
                    :theme="config.theme.playlist" :config="config.config" v-on:choose="chooseMusic"
                    v-on:playMusic="playMusic" v-on:switchList="switchList"></PlayList>
            </div>
            <div id="right">
                <Lyric ref="lyric"></Lyric>
            </div>
        </div>
        <PromptWindow @nyan="nyanInited"></PromptWindow>
    </div>
    `,
    methods: {
        addMusic(music) {
            this.lists[this.curlist].content.push(music);
        },
        chooseMusic(index) {
        },
        deleteList() {
            this.nyan('ask', this.i18n('deleteList', this.lists[this.curlist].name), null, {
                'confirm': () => {
                    const list = this.lists[this.curlist];
                    this.lists.splice(this.curlist);
                    if (this.curlist > 1)
                        this.curlist = this.curlist - 1;
                    else
                        this.addList();
                    require('fs').rename(`data/playlist/${list.file}`, `data/playlist/${list.file}.deleted`, console.log);
                },
                'cancel' : () => {}
            }, null);
        },
        nyanInited(nyan) {
            this.nyan = nyan;
        },
        openFolder() {
            const dialog = require('electron').remote.dialog;
            dialog.showOpenDialog({
                properties: ['openDirectory']
            }, folder => {
                if (!folder) return;
                const files = this.getFileList(folder[0], ['mp3', 'm4a', 'aac', 'ogg', 'wav', 'lac', 'tak', 'ape'])
                .map(file => ({
                    name: file.slice(file.lastIndexOf('\\') + 1, file.lastIndexOf('.')),
                    url: file
                }));
                this.files = [];
                files.map(file => {
                    this.getInfo(file, () => {
                        file.name = file.title || file.name;
                        this.files.push(file);
                    });
                });
            });
        },
        nextMusic() {
            let listLength = this.lists[this.curlist].content.length;
            switch (this.loop) {
                case this.LOOP.ListLoop:
                    return this.playMusic(this.playing + 1 >= listLength ? 0 : this.playing + 1);
                case this.LOOP.ListOnce:
                    return this.playing + 1 >= listLength ? null : this.playMusic(this.playing + 1);
                case this.LOOP.OneLoop:
                    return this.playMusic(this.playing);
                case this.LOOP.OneOnce:
                    return;
                case this.LOOP.Random:
                    return this.playMusic(Math.floor(Math.random() * listLength + 0.5));
            }
        },
        playMusic(index) {
            if (this.lists[this.curlist].content.length === 0)
                return;
            if (index >= this.lists[this.curlist].content.length)
                index = 0;
            if (index < 0)
                index = this.lists[this.curlist].content.length - 1;
            this.playing = index;
            this.$refs.controller.playMusic(this.curlist, index);
            let curMusic = this.lists[this.curlist].content[index];
            if (!curMusic.info)
                this.getInfo(curMusic, music => this.$refs.cover.setImgUrl(music.cover));
            else
                this.$refs.cover.setImgUrl(curMusic.cover);
        },
        switchList(index) {
            this.curlist = index;
        },
        loadFiles(files) {
            this.files = files;
        },
        addList () {
            let newListNames = null;
            for (let i = 0; i < 99; ++i)
                if (!this.lists.map(list => list.name).includes(`newPlaylist-${i}`)) {
                    newListNames = `newPlaylist-${i}`;
                    break;
                }
            this.lists.push({ name: newListNames, user: this.user,
                file: `${newListNames}@${this.user}.json`, content: [] });
            this.switchList(this.lists.length - 1);
            this.saveList();
        },
        loadList(list) {
            if (!this.lists || (this.lists && this.lists[0].name === 'sekai') ) this.lists = [];
            this.lists.push(list);
        },
        saveList() {
            const fs = require('fs');
            const list = this.lists[this.curlist];
            const originFile = list.file;
            list.file = `${list.name}@${list.user}.json`;
            fs.writeFile(`data/playlist/${originFile}`, JSON.stringify(list, null, 4), err => {
                if (err) console.error(err);
                if (originFile !== list.file)
                    fs.rename(`data/playlist/${originFile}`, `data/playlist/${list.file}`, console.log);
                console.log('保存成功');
            });
        },
        loadConfig(userConfig) {
            this.$refs.controller.loadConfig(userConfig.theme.toolbar);
        },
        i18n(key, extra) {
            return {
                deleteList: { zh_CN: `确定要删除播放列表: ${extra}吗`, en: `Are you sure to delete playlist: ${extra}` }
            }[key][this.locale];
        }
    }
});

G.eval = function () {
    throw new Error('Sorry, this app does not support window.eval().');
};

G.LOOP = {
    ListLoop: 0,
    ListOnce: 1,
    OneLoop : 2,
    OneOnce : 3,
    Random  : 4
};

G.default = {
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
            }],
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
            "width": 200,
            "height": 300,
        },
        "user": {
            "background": "rgba(48, 48, 48, 0.9)",
            "width" : 200,
            "height": 108,
            "avatarMargin": 10,
        }
    }
};

/* https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript */
G.uuid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

G.init = function (chiyosekai) {
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
    const playlists = this.getFileList(path.resolve(__dirname, 'data/playlist'), ['son']);
    if (playlists.length > 0) {
        playlists.forEach(list => fs.readFile(list, (err, data) => {
            if (err) return;
            data = JSON.parse(data);
            if (data.user === this.user)
                chiyosekai.loadList(data);
        }));
    }
};

G.getUserdata = function(userid, callback) {
    fetch().then(userdata => callback(userdata)).catch( err => console.log(err) );
};

G.getInfo = function(music, callback) {
    Object.assign(music, {
        artist: null,
        cover    : null,
    });
    if (music.url.toLowerCase().startsWith('http') || music.url.toLowerCase().startsWith('ftp') ) {
        // deal with web file
        this.jsmediatags.read(music.url, {
            onSuccess: tag => {
                music.cover = URL.createObjectURL(new Blob([Uint8Array.from(tag.tags.picture.data)], { type: tag.tags.picture.format }));
                callback(music);
            },
            onError: err => console.log(err)
        });
    } else {
        // deal with local file(electron only)
        if (!(G.require && G.require('music-metadata')))
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
                duration:   `${Math.floor(info.format.duration / 60)}:${Math.floor(info.format.duration % 60)}`
            });
            callback(music);
        }).catch(err => console.log(err));
    }
};

G.chiyosekai = new G.ChiyoSekai({ el: '#chiyosekai' });
G.init(G.chiyosekai);
