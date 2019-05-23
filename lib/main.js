/* config: auto load info of files */
/* eslint-env node */
const G = this;
G.locale = 'zh_CN';
G.user   = 'chiyo';
G.getFileList = require('./lib/getFileList');
global.document = document;
G.draggable = Vue.extend(require('vuedraggable'));

G.Loading = Vue.extend({
    template:
    `<div class="lds-mask">
        <div class="lds-ripple">
            <div></div>
        </div>
    </div>`
});
let Loading = G.Loading;

G.ProgressBar = Vue.extend({
    props: ['lrate', 'bsize', 'bcolor', 'lcolor', 'lheight', 'music', 'status', 'windowWidth'],
    data() {
        return {
            width: null,
            dragging: false,
            ballSize: this.bsize || 16,
            ballColor: this.bcolor || 'rgba(214, 214, 214, 0.95)',
            lineColor: this.lcolor || 'rgba(20, 92, 60, 0.9)',
            lineHeight: this.lheight || 5,
            lengthRate: this.lrate || 94,
            showProgress: 0,
            progress: 0,
            afterAdjust: false
        };
    },
    watch: {
        showProgress(newProg) {
            if (newProg > 1) return this.showProgress = 1;
            if (newProg < 0) return this.showProgress = 0;
        },
        progress(newProg) {
            if (newProg === 0 && this.status !== 'playing') return;
            if (newProg > 1) return this.progress = 1;
            if (newProg < 0) return this.progress = 0;
            this.showProgress = this.progress;
        }
    },
    template: `
        <div :style="{ height: ballSize + 'px' }">
            <div class="progress-bar flex-center" ref="outbar" style="user-select: none;position: relative;width: 100%;">
                <div class="progress-bar-line" :style="{ width: lengthRate + '%', height: lineHeight + 'px',
                    backgroundColor: lineColor, borderRadius: lineHeight / 2 + 'px'}">
                </div>
                <div :class="{ 'width-ease': !this.dragging, 'progress-bar-played': true }" @mousedown="onMouseDown"
                    :style="{ left: ((100 - lengthRate) / 2) + '%', position: 'absolute',
                        width: (showProgress * lengthRate + 0.5)+ '%', height: lineHeight + 'px' , backgroundColor: 'rgba(216, 124, 183, 0.9)',
                        borderRadius: lineHeight / 2 + 'px'}">
                </div>
                <div :class="{ 'left-ease': !this.dragging, 'progress-bar-ball': true }" @mousedown="onMouseDown"
                    :style="{ left: left, position: 'absolute', top: (-lineHeight) + 'px',
                        width: ballSize + 'px', height: ballSize + 'px' , backgroundColor: ballColor,
                        borderRadius: ballSize / 2 + 'px', cursor: 'pointer'}">
                </div>
            </div>
        </div>`,
    computed: {
        left() {
            return `calc(${3 + this.showProgress * this.lengthRate}% - ${this.ballSize / 2}px)`;
        },
        length() {
            return this.width * this.lengthRate / 100;
        },
        side() {
            return this.width * (0.5 - this.lengthRate / 200);
        }
    },
    methods: {
        setProgress(prog, forceSetting) {
            if (prog > 1 || prog < 0) return;
            if (this.dragging && !forceSetting)
                return;
            this.progress = prog;
            this.showProgress = prog;
        },
        onMouseDown() {
            this.dragging = true;
        }
    },
    mounted() {
        this.width = this.$refs.outbar.clientWidth;
        let positionStart = this.$el.offsetLeft + this.side;
        let positionEnd = positionStart + this.width - this.side;
        registerMouseMove((evt) => {
            if (!this.dragging) return;
            if (evt.clientX > positionEnd)
                this.showProgress = 1;
            else if (evt.clientX < positionStart)
                this.showProgress = 0;
            else
                this.showProgress = (evt.clientX - positionStart) / this.length;
            evt.preventDefault();
        });
        registerMouseUp(evt => {
            if (!this.dragging) return;
            if (this.status !== 'playing') {
                this.progress = 0;
                this.showProgress = 0;
                this.dragging = false;
                return;
            }
            if (evt.clientX > positionEnd)
                this.showProgress = 1;
            else if (evt.clientX < positionStart)
                this.showProgress = 0;
            else
                this.showProgress = (evt.clientX - positionStart) / this.length;
            this.progress = this.showProgress;
            this.dragging = false;
            this.$emit('adjust', this.progress);
            evt.preventDefault();
        });
    },
});
let ProgressBar = G.ProgressBar;

function registerMouseMove(func) {
    G.document.addEventListener('mousemove', func);
}

function registerMouseUp(func) {
    G.document.addEventListener('mouseup', func);
}

G.StatusBar = Vue.extend({
    props: ['theme', 'config', 'music', 'status', 'theme'],
    components: { ProgressBar },
    template: `
    <div id="status-bar" :style="{ height: theme.height + 'px', backgroundColor: theme.background }" class="flex-fixed">
        <div :style="{ padding: '2px 3% 5px 3%', color: config.fontColor, fontSize: '1.1rem' }">Now Playing: {{ music ? music.name : ''}}
        </div>
        <div>
            <ProgressBar ref="progress" @adjust="adjustTime" :status="status" :windowWidth="config.windowWidth"></ProgressBar>
        </div>
    </div>
    `,
    methods: {
        setProgress(prog) {
            this.$refs.progress.setProgress(prog);
        },
        adjustTime(time) {
            this.$emit("adjustTime", time);
        }
    }
});

G.PlayList = Vue.extend({
    data() {
        return {
            editable: null,
            active: null,
            tabFocus: false,
            statusLocation: 2
        };
    },
    props: ['lists', 'curlist', 'display', 'theme', 'config', 'playing', 'status', 'viewlist'],
    template: `
        <div id="playlist" class="chiyo-height-fill flex-auto" :style="{ background: theme.background }">
            <div id="tablist">
                <input v-for="list, index in lists" class="tab" @click="switchList(index)"
                    :style="{ height: theme.tab.height + 'px', fontSize: theme.tab.fontSize,
                        maxWidth: theme.tab.maxWidth, textAlign: 'center', width: (list.name.length * 18) + 'px' }"
                    :class="{ active: index == viewlist, inactive: index != viewlist, noborder: true }"
                    v-model="list.name" :readonly="editable != index" @dblclick="editable = index" @blur="editable = -1">
                </input>
            </div>
            <table id="list" :style="{
                color : config.fontColor, borderCollapse: 'collapse', tableLayout: 'fixed'
            }">
                <thead>
                    <th class="header" v-for="header in addStatus()"
                        :style="{ width: header.width > 0 ? header.width + 'px' : 'auto' }">
                        {{ text(header.name) }}
                    </th>
                </thead>
                <draggable v-model="lists[viewlist].content" tag="tbody" @end="onEnd" handle=".drag-handle">
                    <tr v-for="(music, index) in lists[viewlist].content" @dblclick="onDblClick(index)"
                        :class="{ activeMusic: index == active, musicRow: true }" @click="active = index" :key="index">
                        <td v-for="(header, index) in display.slice(0, statusLocation)" :class="'nowrap ' + header.name" :title="music[header.name]">
                            <span v-if="index == 0" class="drag-handle" style="padding-right: 10px">♬</span>{{ music[header.name] }}
                        </td>
                        <td class="statusColumn drag-handle">
                            <img v-if="(index == playing && status !== null) || (lists[viewlist].content[index].invalid)" class="status-img"
                                :src="setStatusImg(index)"></img>
                        </td>
                        <td v-for="header in display.slice(statusLocation)" class="nowrap" :title="music[header.name]">
                            {{ music[header.name] }}
                        </td>
                    </tr>
                </draggable>
            </table>
        </div>
    `,
    methods: {
        onDblClick(index) {
            this.$emit('setWorkList');
            this.$emit('playMusic', index);
        },
        setStatusImg(index) {
            if (this.lists[this.curlist].content[index].invalid)
                return './img/remove.svg';
            if (this.status === 'playing')
                return './img/play.svg';
            return './img/pause.svg';
        },
        switchList(index) {
            this.$emit('switchList', index);
        },
        addStatus() {
            let arr = this.display.slice();
            arr.splice(this.statusLocation, 0, { name: 'status', width: 50 });
            return arr;
        },
        text(key) {
            return {
                album   : { zh_CN: '专辑', en: 'Album' },
                name    : { zh_CN: '音乐名', en: 'Music Name' },
                artist  : { zh_CN: '艺术家', en: 'Artist' },
                url     : { zh_CN: '来源网址', en: 'Source URL' },
                duration: { zh_CN: '时长', en: 'Length' },
                status  : { zh_CN: '状态', en: 'Status' }
            }[key][global.locale];
        },
        onEnd(e) {
            if ((e.oldIndex < this.playing && e.newIndex < this.playing) ||
                (e.oldIndex > this.playing && e.newIndex > this.playing))
                return;
            if (e.oldIndex === this.playing)
                this.$emit('resetPlayging', e.newIndex);
            if (e.oldIndex > this.playing && e.newIndex <= this.playing)
                this.$emit('resetPlayging', this.playing + 1);
            if (e.oldIndex < this.playing && e.newIndex >= this.playing)
                this.$emit('resetPlayging', this.playing - 1);
        },
    },
});

G.Controller = Vue.extend({
    props: ['curlist', 'lists', 'playing', 'toolbar', 'theme', 'nyan', 'loop', 'config'],
    data() {
        return {
            working: true,
            currentTime: 0,
            volume: 1,
            lastVolume: 1
        };
    },
    components: { ProgressBar },
    template:
    `
    <div id="controller" :style="{ background: theme.background, display: 'flex' }" class="flex-fixed">
        <audio @ended="$emit('next')" ref="audio" @timeupdate="onTimeUpdate">
            <source ref="source" id="player" src>
        </audio>
        <div id="toolbar" :style="{ height: theme.height + 'px', padding : '2px' }">
            <div v-for="button in theme.buttons" class="toolbtn"
            :style="{ backgroundImage: button.icon,
                width: theme.buttonWidth + 'px',
                height: theme.buttonHeight + 'px',
                'background-size': 'cover',
                margin: marginV + 'px ' + theme.buttonIndent + 'px ' + marginV + 'px ' + theme.buttonIndent + 'px'}"
                @click="btnHandler(button.name)" :title="i18n(button.name)">
            </div>
            <div style="flex-grow: 1;min-width: 30px;padding-top: 11px;padding-right: 16px;">
                <ProgressBar ref="volume" @adjust="adjustVolume" :status="'playing'"
                    :windowWidth="config.windowWidth"></ProgressBar>
            </div>
        </div>
    </div>
    `,
    mounted() {
        this.$refs.volume.setProgress(1);
    },
    computed: {
        marginV() {
            return (this.theme.height - this.theme.buttonHeight) / 2 > 0 ?
                (this.theme.height - this.theme.buttonHeight) / 2 : 0;
        },
    },
    watch: {
        currentTime () {
            let audio = this.$refs.audio;
            this.$emit('setProgress', this.currentTime / audio.duration);
        }
    },
    methods: {
        setVolume(vol) {
            this.lastVolume = this.volume;
            this.volume = vol;
            this.$refs.audio.volume = vol;
            this.$refs.volume.setProgress(vol, true);
        },
        adjustVolume(newVol) {
            if (newVol > 0)
                this.lastVolume = this.volume;
            this.volume = newVol;
            this.$refs.audio.volume = newVol;
            G.config.volume = newVol;
        },
        adjustTime(newTime) {
            let time = parseFloat(newTime * this.$refs.audio.duration);
            this.currentTime = time;
            this.$refs.audio.currentTime = time;
        },
        onTimeUpdate () {
            this.currentTime = this.$refs.audio.currentTime;
        },
        switchVolume() {
            this.setVolume(!this.volume * this.lastVolume);
        },
        btnHandler(button) {
            switch (button) {
                case 'play':
                    this.$emit('setWorkList');
                    return this.$emit('playMusic', this.playing);
                case 'stop':
                    return this.stop();
                case 'next':
                    return this.$emit('next');
                case 'last':
                    return this.$emit('playMusic', this.playing - 1);
                case 'pause':
                    return this.pause();
                case 'random':
                    return this.$emit('switch');
                case 'remove':
                    return this.$emit('remove');
                case 'add':
                    return this.$emit('addList');
                case 'save':
                    return this.$emit('saveList');
                case 'open':
                    return this.$emit('openFolder');
                case 'switch':
                    return this.$emit('switchView');
                case 'refresh':
                    return this.$emit('refreshFolder');
                case 'delete':
                    return this.$emit('deleteList');
                case 'volume':
                    return this.switchVolume();
                case 'split':
                default:
                    break;
            }
        },
        playMusic(curlist, index) {
            let music = this.lists[curlist].content[index];
            if (index === this.playing)
                return (this.$refs.audio.load(), this.play());
            fetch(music.url, { headers: { Range: "bytes=0-1" } })
            .then( () => {
                this.working = true;
                this.$refs.source.setAttribute('src', music.url);
                this.$refs.audio.load();
                this.play();
            })
            .catch( () => {
                this.working = false;
                this.$refs.source.setAttribute('src', null);
                music.invalid = true;
                this.$emit('next');
                this.nyan('info', this.i18n('error') + music.name, null, null, null, 2333);
            });
        },
        pause() {
            if (this.working) {
                if (this.$refs.audio.paused) {
                    this.$emit('resume');
                    return this.$refs.audio.play();
                }
                this.$emit('pause');
                this.$refs.audio.pause();
            }
        },
        stop() {
            if (this.working) {
                this.$refs.audio.pause();
                this.$refs.audio.currentTime = 0;
                this.$emit('stop');
            }
        },
        play() {
            if (this.playing === null)
                return this.$emit('playMusic', 0);
            if (this.working)
                this.$refs.audio.play();
        },
        switch() {
            if (this.working)
                this.$refs.audio.paused ? this.play() : this.pause();
        },
        i18n(key) {
            if (key === 'random')
                return [
                    { zh_CN: '列表循环', en: 'List Loop' },
                    { zh_CN: '列表单次', en: 'List Once' },
                    { zh_CN: '单曲循环', en: 'Loop One' },
                    { zh_CN: '单曲单次', en: 'Just One' },
                    { zh_CN: '随机', en: 'Random' }
                ][this.loop][G.locale];
            return {
                open   : { zh_CN: '打开目录',   en: 'Open Folder' },
                switch : { zh_CN: '切换文件视图', en: 'Switch File View' },
                add    : { zh_CN: '添加播放列表',   en: 'Add Playlist' },
                play   : { zh_CN: '播放',   en: 'Play'  },
                next   : { zh_CN: '下一曲', en: 'Next'  },
                stop   : { zh_CN: '停止',   en: 'Stop'  },
                pause  : { zh_CN: '暂停',   en: 'Pause' },
                last   : { zh_CN: '上一首', en: 'Last'  },
                refresh: { zh_CN: '刷新文件列表', en: 'Refresh file list' },
                save   : { zh_CN: '保存播放列表',  en: 'Save Playlist' },
                remove : { zh_CN: '移除该曲', en: 'Remove this music' },
                split  : { zh_CN: '喵喵喵',       en: 'Nyan Nyan Nyan' },
                delete : { zh_CN: '删除播放列表', en: 'Delete Playlist' },
                error  : { zh_CN: '无法播放歌曲：', en: 'Cannot play music: ' },
                volume : { zh_CN: '音量',   en: 'volume' }
            }[key][G.locale];
        }
    }
});

G.Cover = Vue.extend({
    props: ['theme', 'config'],
    data() {
        return {
            url: './img/music.svg'
        };
    },
    template:
    `
    <div id="cover" :style="{
        width: theme.width + 'px', height: theme.height + 'px',
        background: theme.background, opacity: theme.opacity
    }">
        <img id="cover" :src="this.url" :style="{ width: theme.width + 'px', height: theme.height + 'px' }">
    </div>
    `,
    methods: {
        setImgUrl(url) {
            this.url = url || './img/music.svg';
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
            formatedFiles: null,
            viewMode: 0,
            sort   : 'name',
            asc    : true,
            loading: false
        };
    },
    components: { Loading },
    computed: {
        viewName() {
            return Object.keys(G.VIEW)[this.viewMode];
        }
    },
    mounted() {
        this.parent = null;
        this.formatedFiles = this.view;
    },
    template :
    `
    <div id="file-container" :style="{ width: config.width + 'px' }">
        <Loading v-if="loading"></Loading>
        <div>
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
            <div class="file" v-for="file in view.filter(file => file.name.toLowerCase().includes(this.search.toLowerCase()) || (file.artist && file.artist.includes(this.search)) )" @dblclick="enter(file.name)" :title="file.name">
                <img class="fileicon" :class="{ [viewName]: true,  folder: !(file.child == undefined || file.child == null), music : (file.child == undefined || file.child == null) }"></img>
                <span class="filename">{{ file.name }}</span>
            </div>
        </div>
    </div>
    `,
    methods : {
        setLoading(loading) {
            this.loading = loading;
        },
        formatFiles(viewMode) {
            this.viewMode = viewMode;
            let groupElement = 'artist';
            let dictionary = {};
            let retFiles = [];
            switch (this.viewMode) {
                case G.VIEW.album:
                    groupElement = 'album';
                case G.VIEW.artist:
                    for (let i = 0; i < this.files.length; ++i) {
                        let ele = this.files[i][groupElement] || 'others';
                        let separator = ele.includes('&') ? '&' : '/';
                        if (groupElement === 'artist' && ele.includes(separator)) {
                            let artists = ele.split(separator);
                            artists.forEach(artist => {
                                artist = artist.trim();
                                dictionary[artist] = dictionary[artist] || [];
                                dictionary[artist].push(this.files[i]);
                            });
                        } else {
                            dictionary[ele] = dictionary[ele] || [];
                            dictionary[ele].push(this.files[i]);
                        }
                    }
                    let elements = Object.keys(dictionary);
                    for (let i = 0; i < elements.length; ++i) {
                        retFiles.push({
                            name: elements[i],
                            child: dictionary[elements[i]]
                        });
                    }
                    this.formatedFiles = retFiles;
                    break;
                case G.VIEW.folder:
                case G.VIEW.all:
                default:
                    this.formatedFiles = this.files;
            }
            this.view = this.formatedFiles;
        },
        text(key) {
            return {
                back : { zh_CN: '返 回', en: 'Back' }
            }[key][G.locale];
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
                this.view = target.child.filter(file => file.name.includes(this.search));
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
    <div id="p-mask" class="flex-center" :style="{
        opacity: active ? 0.8: 0, zIndex: active ? 233: -1,
        display: active ? 'flex' : 'none' }">
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
        G.nyan = this.invoke;
    },
    methods: {
        invoke(type, text, title, callback, params, timeout) {
            this.title    = title || this.title;
            this.text     = text  || this.text;
            this.type     = type  || 'info';
            this.callback = callback;
            this.params   = params;
            this.active   = true;
            if (timeout > 0)
                setTimeout( () => this.active = false, timeout);
        },
        i18n(key) {
            return {
                confirm: { zh_CN: '确定',   en: 'Confirm' },
                cancel : { zh_CN: '取消',   en: 'Cancel' },
                okay   : { zh_CN: 'Okay',   en: 'Okay'  },
                info   : { zh_CN: '提示', en: 'Info'  },
                error  : { zh_CN: '错误发生啦',   en: 'Error Nyan'  },
                ask    : { zh_CN: '操作确认喵',   en: 'Operation Confirm Nyan' }
            }[key][G.locale];
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
            viewMode: 0,
            viewlist: 0,
            lists   : [{ name: 'sekai', user: 'chiyo', content: [] }],
            headers: [{ name: 'name', width: 150 }, { name: 'artist', width: 80 },
                    { name: 'duration', width: 50 }, { name: 'album', width: 100 }],
            playing : null,
            status  : null,
            loop    : G.default.config.loopMode,
            config  : G.default.config,
            theme   : G.default.theme,
            nyan    : null,
            randomList :[],
            userinfo: { username: "chiyo" }
        };
    },
    components: { FileList, PlayList, Property, Lyric, Cover, Controller, User, PromptWindow, StatusBar },
    template:
    `
    <div style="height:100%; width: 100%">
        <div id="chiyosekai" :style="{ height: '100%', width: '100%', background: theme.global.background }">
            <div id="chiyo-left">
                <FileList ref="filelist" :files="files" @addMusic="addMusic" :theme="theme.filelist">
                </FileList>
                <div class="leftbottom">
                    <div class="chiyo-right">
                        <Cover ref="cover" :theme="theme.cover"></Cover>
                    </div>
                </div>
            </div>
            <div id="center">
                <Controller ref="controller" :playing="playing"  :lists="lists" :theme="theme.controller"
                    :curlist="curlist" :list="curlist"     :nyan="nyan"   :config="config" :loop="loop"
                    @pause="pauseMusic"    @addList="addList"    @stop="stopMusic" @switch="switchLoop"
                    @playMusic="playMusic" @resume="resumeMusic" @deleteList="deleteList" @switchView="switchView"
                    @setProgress="setProgress" @setWorkList="setWorkList" @refreshFolder="refreshFolder"
                    @saveList="saveList"   @remove="removeMusic" @next="nextMusic" @openFolder="openFolder" >
                </Controller>
                <PlayList ref="playlist" :lists="lists" :display="headers" :curlist="curlist" :viewlist="viewlist" 
                    :status="status" :theme="theme.playlist" :config="config" :playing="playing" @setWorkList="setWorkList"
                    @resetPlayging="resetPlayging" @playMusic="playMusic" @switchList="switchList">
                </PlayList>
                <StatusBar ref="status" :theme="theme.statusbar" :config="config" :status="status"
                    :music="lists[curlist].content[playing]" @adjustTime="adjustTime">
                </StatusBar>
            </div>
            <div id="right">
                <Lyric ref="lyric"></Lyric>
            </div>
        </div>
        <PromptWindow @nyan="nyanInited"></PromptWindow>
    </div>
    `,
    mounted() {
        this.switchLoop();
        this.switchView(0);
    },
    methods: {
        init(config) {
            if (config.lastFolder) this.loadFolder(config.lastFolder);
            if (config.volume) this.$refs.controller.setVolume(config.volume);
            if (config.loopMode !== undefined) {
                this.loop = config.loopMode;
                this.switchLoop(this.loop);
            }
            if (config.viewMode !== undefined) {
                this.viewMode = config.viewMode;
                this.switchView(this.viewMode);
            }
        },
        exit() {
            this.saveList();
            require('fs').writeFileSync(G.dataPath + '/config.json', JSON.stringify(G.config, null, 4));
        },
        adjustTime(time) {
            this.$refs.controller.adjustTime(time);
        },
        addMusic(music) {
            this.lists[this.curlist].content.push(music);
        },
        nextMusic() {
            let listLength = this.lists[this.curlist].content.length;
            this.status = null;
            switch (this.loop) {
                case G.LOOP.listloop:
                    return this.playMusic(this.playing + 1 >= listLength ? 0 : this.playing + 1);
                case G.LOOP.listonce:
                    return this.playing + 1 >= listLength ? null : this.playMusic(this.playing + 1);
                case G.LOOP.oneloop:
                    return this.playMusic(this.playing);
                case G.LOOP.once:
                    return;
                case G.LOOP.random:
                    return this.playMusic(Math.floor(Math.random() * listLength + 0.5));
            }
        },
        pauseMusic() {
            this.status = 'pause';
        },
        playMusic(index) {
            if (this.lists[this.curlist].content.length === 0)
                return (this.status = null);
            if (index >= this.lists[this.curlist].content.length)
                index = 0;
            if (index < 0)
                index = this.lists[this.curlist].content.length - 1;
            this.playing = index;
            this.$refs.controller.playMusic(this.curlist, index);
            let curMusic = this.lists[this.curlist].content[index];
            this.status = 'playing';
            if (!curMusic.info)
                G.getInfo(curMusic, music => this.$refs.cover.setImgUrl(music.cover));
            else
                this.$refs.cover.setImgUrl(curMusic.cover);
        },
        removeMusic() {
            let list = this.lists[this.curlist].content;
            let target = this.$refs.playlist.active;
            let resetPlaying = () => {
                if (target === this.playing) {
                    if (this.config.stopAfterRemove)
                        this.playing = null;
                }
                if (target < this.playing)
                    this.playing = this.playing - 1;
            };
            this.nyan('ask', this.i18n('deleteMusic', list[target].name), null, {
                'confirm': () => {
                    list.splice(target, 1);
                    this.saveList(false);
                    resetPlaying();
                },
                'cancel' : () => {}
            }, null);
        },
        resumeMusic() {
            this.status = 'playing';
        },
        stopMusic() {
            this.status = null;
        },
        deleteList() {
            this.nyan('ask', this.i18n('deleteList', this.lists[this.curlist].name), null, {
                'confirm': () => {
                    const list = this.lists[this.curlist];
                    let listPath = G.playlistPath;
                    this.lists.splice(this.curlist);
                    if (this.curlist > 1)
                        this.curlist = this.curlist - 1;
                    else
                        this.addList();
                    require('fs').rename(`${listPath}/${list.file}`, `${listPath}/${list.file}.deleted`, console.log);
                },
                'cancel' : () => {}
            }, null);
        },
        switchLoop(loop) {
            if (!loop)
                this.loop = this.loop >= Object.keys(G.LOOP).length - 1 ? 0 : this.loop + 1;
            else
                this.loop = loop;
            G.config.loopMode = this.loop;
            let btns = this.theme.controller.buttons;
            let loopWay = Object.keys(G.LOOP)[this.loop];
            let targetBtn = btns.map(btn => btn.name).indexOf('random');
            btns[targetBtn].icon = `url(./img/${loopWay}.svg)`;
        },
        switchView(view) {
            if (!view)
                this.viewMode = this.viewMode >= Object.keys(G.VIEW).length - 1 ? 0 : this.viewMode + 1;
            else
                this.viewMode = view;
            G.config.viewMode = this.viewMode;
            let btns = this.theme.controller.buttons;
            let viewWay = Object.keys(G.VIEW)[this.viewMode];
            let targetBtn = btns.map(btn => btn.name).indexOf('switch');
            btns[targetBtn].icon = `url(./img/${viewWay}.svg)`;
            this.$refs.filelist.formatFiles(this.viewMode);
        },
        openFolder() {
            const dialog = require('electron').remote.dialog;
            dialog.showOpenDialog({
                properties: ['openDirectory']
            }, folder => this.loadFolder(folder[0]));
        },
        loadFolder(folder) {
            if (!folder) return;
            G.config.lastFolder = folder;
            this.$refs.filelist.setLoading(true);
            const files = G.getFileList(folder, ['mp3', 'm4a', 'aac', 'ogg', 'wav', 'lac', 'tak', 'ape'])
            .map(file => ({
                name: file.slice(file.lastIndexOf('\\') + 1, file.lastIndexOf('.')),
                url: file
            }));
            this.files = [];
            let counter = 0;
            files.map(file => {
                G.getInfo(file, () => {
                    file.name = file.title || file.name;
                    this.files.push(file);
                    if (++counter === files.length) {
                        this.$refs.filelist.formatFiles(this.viewMode);
                        this.$refs.filelist.setLoading(false);
                    }
                });
            });
        },
        refreshFolder() {
            this.loadFolder(G.config.lastFolder);
            this.$refs.filelist.initView();
        },
        setWorkList() {
            this.curlist = this.viewlist;
        },
        switchList(index) {
            this.viewlist = index;
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
            this.lists.push({ name: newListNames, user: G.user,
                file: `${newListNames}@${G.user}.json`, content: [] });
            this.switchList(this.lists.length - 1);
            this.saveList();
        },
        loadList(list) {
            if (!this.lists || (this.lists && this.lists[0].name === 'sekai') ) this.lists = [];
            this.lists.push(list);
        },
        saveList(showTip) {
            const fs = require('fs');
            showTip = showTip || true;
            const list = this.lists[this.curlist];
            let listPath = G.playlistPath;
            const originFile = list.file;
            list.file = `${list.name}@${list.user}.json`;
            fs.writeFile(`${listPath}/${originFile}`, JSON.stringify(list, null, 4), err => {
                if (err)
                    this.nyan('error', this.i18n('saveFailed', list.name));
                if (originFile !== list.file)
                    fs.rename(`${listPath}/${originFile}`, `${listPath}/${list.file}`, console.log);
                if (showTip)
                    this.nyan('info', this.i18n('saveFinished', list.name));
            });
        },
        resetPlayging(changedPlaying) {
            this.playing = changedPlaying;
        },
        setProgress(prog) {
            this.$refs.status.setProgress(prog);
        },
        nyanInited(nyan) {
            this.nyan = nyan;
        },
        i18n(key, extra) {
            return {
                deleteList: { zh_CN: `确定要删除播放列表: ${extra} 吗？`, en: `Are you sure to delete playlist: ${extra} ?` },
                deleteMusic: { zh_CN: `确定要从播放列表移除曲子: ${extra} 吗？`, en: `Are you sure to remove music: ${extra} from playlist?` },
                saveFinished: { zh_CN: `列表 ${extra} 保存成功！`, en: `Succeed to save playlist - ${extra}!` },
                saveFailed: { zh_CN: `列表 ${extra} 保存失败！`, en: `Failded to save playlist - ${extra}!` }
            }[key][G.locale];
        }
    }
});

G.eval = function () {
    throw new Error('Sorry, this app does not support window.eval().');
};

G.VIEW = {
    all: 0,
    folders: 1,
    artist: 2,
    album: 3
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
        "width"   : 300,
        "windowWidth": 1024,
        "playList": ["Guest@Empty"],
        "loopMode": 3,
        "fontColor" : "rgb(212, 195, 128)",
        "fontFamily": "\"Source Han Sans SC\", sans-serif",
        "stopAfterRemove": true
    },
    "theme" : {
        "cover": {
            "background": "rgba(30, 30, 30, 0.8)",
            "height": 300,
            "width" : 300,
            "opacity": 0.86
        },
        "controller" : {
            "background": "rgba(40, 40, 40, 0.7)",
            "width": 600,
            "height": 30,
            "buttonWidth": 24,
            "buttonHeight": 24,
            "buttonIndent": 6,
            "lines": 1,
            "buttons": [{
                name: "refresh",
                icon: "url(./img/refresh.svg)",
            }, {
                name: "open",
                icon: "url(./img/open.svg)",
            }, {
                name: "switch",
                icon: "url(./img/folders.svg)",
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
            "background": "rbga(30, 30, 30, 0.8)"
        },
        "playlist": {
            "background": "rbga(30, 30, 30, 0.85)",
            "width": 700,
            "tab" : {
                "height": 24,
                "fontSize": "1.1em",
                "maxWidth": "160px"
            }
        },
        "filelist": {
            "background"  : "rgba(40, 40, 40, 0.8)",
            "searchBg": "rgba(48, 48, 48, 0.8)",
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
            "background": "rgba(48, 48, 48, 0.5)",
            "height": 48
        },
        "user": {
            "background": "rgba(48, 48, 48, 0.9)",
            "width" : 100,
            "height": 100,
            "avatarMargin": 0,
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
    const os = require('os');
    const { promisify } = require('util');
    const [mkdir,  exist] = [fs.mkdir, fs.access].map(f => promisify(f));
    let userPath = os.type().includes('Windows') ? os.homedir() + '/documents' : require('os').homedir();
    G.dataPath = userPath + '/ChiyoSekai';
    G.playlistPath = G.dataPath + '/playlist';
    let readList = async () => {
        try {
            await exist(G.dataPath);
        } catch (e) {
            await mkdir(G.dataPath);
        }
        try {
            await exist(G.playlistPath);
        } catch (e) {
            await mkdir(G.playlistPath);
        }
        const playlists = G.getFileList(G.playlistPath, ['son']);
        if (playlists.length > 0) {
            playlists.forEach(list => fs.readFile(list, (err, data) => {
                if (err) return;
                data = JSON.parse(data);
                if (data.user === G.user)
                    chiyosekai.loadList(data);
            }));
        }
    };
    let readConfig = async () => {
        try {
            G.config = require(G.dataPath + '/config.json');
            if (G.config) chiyosekai.init(G.config);
        } catch (err) {
            G.log(err);
        }
    };
    readList();
    readConfig();
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

G.log = log => {
    console.log(log);
};
G.config = G.config || {};
G.chiyosekai = new G.ChiyoSekai({ el: '#chiyosekai' });
G.init(G.chiyosekai);
window.onbeforeunload = () => G.chiyosekai.exit();
let css = document.createElement('link');
css.rel = 'stylesheet';
css.href = G.dataPath + '/custom.css';
document.getElementsByTagName('head')[0].appendChild(css);
