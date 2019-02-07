/* config: auto load info of files */
/* eslint-env browser */
/* global Vue */
const locale = 'zh_CN';

global.Controller = Vue.extend({
    props: ['curlist', 'lists', 'playing', 'toolbar'],
    data() {
        return {
            working: true,
            config : global.default.theme.controller
        }
    },
    template:
    `
    <div id="controller">
        <audio  @ended="$emit('next')" ref="control">
            <source ref="source" id="player" src>
        </audio>
        <div id="toolbar" :style="{ height: config.height + 'px' }">
            <div v-for="button in Object.keys(config.buttons)"  class="toolbtn" :style="{ background: config.buttons[button].icon, 
                width: config.buttonWidth + 'px', height: config.buttonHeight + 'px', 'background-size': 'cover',
                margin: marginV + 'px ' + config.buttonIndent + 'px ' + marginV + 'px ' + config.buttonIndent + 'px'}"
                @click="btnHandler(button)" :title="text(button)">
            </div>
        </div>
        <div id="volumnBar"></div>
    </div>
    `,
    computed: {
        marginV() {
            return (this.config.height - this.config.buttonHeight) / 2 > 0 ? (this.config.height - this.config.buttonHeight) / 2 : 0;
        },
    },
    methods: {
        btnHandler(button) {
            switch(button) {
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
            }
        },
        playMusic(curlist, index) {
            if (index == this.playing)
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
                play   : { zh_CN: '播放',   en: 'Play'  },
                next   : { zh_CN: '下一曲', en: 'Next'  },
                stop   : { zh_CN: '停止',   en: 'Stop'  },
                pause  : { zh_CN: '暂停',   en: 'Pause' },
                last   : { zh_CN: '上一首', en: 'Last'  },
                random : { zh_CN: '随机',   en: 'Random'},
            }[key][locale];
        }
    }
});

global.ImageViewer = Vue.extend({
    props: ['config'],
    data() {
        return {
            url: null
        }
    },
    template:
    `
    <div id="viewer" :style="{ width: config.width + 'px', height: config.height + 'px' }">
        <img id="bk" :src="this.url" :style="{ width: config.width + 'px', height: config.height + 'px' }">
    </div>
    `,
    methods: {
        setImgUrl(url) {
            this.url = url;
        }
    }
});

global.userWin = Vue.extend({

});

global.PropertyWindow = Vue.extend({
    props: ['config'],
    template:
    `<div id="propertyWin" :style="{ width: config.width + 'px', height: config.height + 'px' }"></div>`
});

global.LyricWindow = Vue.extend({
    template:
    `
    <div id="lyric">
    </div>
    `,
});

global.FileList = Vue.extend({
    props : ['files', 'userConfig', 'userTheme'],
    data() {
        return {
            view   : [{ "name": "Empty", "child": [] }],
            config : global.default.config,
            theme  : global.default.theme,
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
        this.view    = this.files;
        this.parent  = null;
    },
    template :
    `
        <div :style="{ width: this.config.width + 'px', height: this.config.height + 'px' }">
            <div>
                <input type="text" v-model="search" :style="{ width: this.config.width - 4 + 'px', height: '24px', 'font-size': '1.1em' }"></input>
            </div>
            <div id="filelist">
                <div class="file back" v-if="this.parent != null" @click="exit()">
                    <img class="fileicon return"></img>
                    <span class="filename">{{ text("back") }}</span>
                </div> 
                <div class="file" v-for="file in view.filter(file => file.name.includes(this.search))" @dblclick="enter(file.name)">
                    <img class="fileicon" :class="{ folder: !(file.child == undefined || file.child == null), music : (file.child == undefined || file.child == null) }"></img>
                    <span class="filename">{{ file.name }}</span>
                </div>
            </div>
        </div>
    `,
    methods  : {
        text(key) {
            return {
                back : { zh_CN: '返 回', en: 'Back'}
            }[key][locale];
        },
        exit() {
            this.view = this.parent.content.filter(file => file.name.includes(this.search));
            this.parent = this.parent.parent;
        },
        enter(filename) {
            let target = this.view.find( file => file.name == filename );
            if (target.child) {
                this.parent =  {
                    content: this.view,
                    parent : this.parent
                }
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

global.PlayList = Vue.extend({
    data() {
        return {
            active: null
        }
    },
    props: ['lists', 'curlist', 'display', 'config'],
    template: `
        <div id="playlist" :style="{ height: config.height + 'px', width: config.width + 'px' }">
            <div id="tablist" :style="{ height: config.tab.height }">
                <div v-for="list, index in lists" class="tab" @click="switchList(index)" :style="{ height: config.tab.height }"
                    :class="{ active: index == curlist }">{{ list.name }}</div>
            </div>
            <table id="list" :style="{ height: lists[curlist].content.length * 30 + 'px' }">
                <thead>
                    <th class="header" v-for="header in display" 
                        :style="{ width: header.width > 0 ? header.width + 'px' : 'auto' }">
                        {{ text(header.name) }}
                    </th>
                </thead>
                <tr v-for="music, index in lists[curlist].content" @dblclick="$emit('playMusic', index)"
                    :class="{ activeMusic: index == active }" @click="active = index">
                    <th v-for="header in display">
                        {{ music[header.name] }}
                    </th>
                </tr>
            </table>
        </div>
    `,
    methods: {
        switchList(index) {
            this.$emit('switchList', index);
        },
        saveList() {

        },
        deleteMusic() {

        },
        text(key) {
            return {
                name   : { zh_CN: '音乐名', en: 'Music Name'},
                artist : { zh_CN: '艺术家', en: 'Artist'},
                url    : { zh_CN: '来源网址', en: 'Source URL'}
            }[key][locale];
        }
    },
});

global.ChiyoSekai = Vue.extend({
    data() {
        return {
            files   : [{ "name": "Empty", "child": [] }],
            curlist : 0,
            lists   : [{ "name": "Empty", "content": [] }],
            listview: [{ name: 'name', width: 120}, { name: 'artist', width: 80}, { name: 'url'}],
            playing : null,
            loop    : global.LOOP.ListLoop,
            config  : global.default
        };
    },
    components: { FileList, PlayList, PropertyWindow, LyricWindow, ImageViewer, Controller },
    template: 
    `
    <div id="chiyosekai" :style="{ height: '100%', width: '100%', background: this.config.theme.global.background }">
        <div id="left">
            <FileList ref="filelist" :files="files" v-on:addMusic="addMusic"></FileList>
            <ImageViewer ref="bk" :config="config.theme.bk"></ImageViewer>
            <PropertyWindow ref="propertyWin" :config="config.theme.propertyWin"></PropertyWindow>
        </div>
        <div id="center">
            <Controller ref="controller" :playing="playing" :lists="lists" :config="config.theme.controller"
                :curlist="curlist" :list="curlist" v-on:playMusic="playMusic"></Controller>
            <PlayList ref="playlist" :lists="lists" :display="listview" :curlist="curlist" :config="config.theme.playlist"
                v-on:choose="chooseMusic" v-on:playMusic="playMusic" v-on:switchList="switchList"></PlayList>
        </div>
        <div id="right">
            <LyricWindow ref="lyric"></LyricWindow>
        </div>
    </div>
    `,
    methods: {
        addMusic(music) {
            this.lists[this.curlist].content.push(music);
        },
        chooseMusic(index) {

        },
        nextMusic() {
            let listLength = this.lists[this.curlist].content.length;
            switch(this.loop) {
                case global.LOOP.ListLoop:
                    return this.playMusic(this.playing + 1 >= listLength ?　0 : this.playing + 1);
                case global.LOOP.ListOnce:
                    return this.playing + 1 >= listLength ? null : this.playMusic(this.playing + 1);
                case global.LOOP.OneLoop:
                    return this.playMusic(this.playing);
                case global.LOOP.OneOnce:
                    return;
                case global.LOOP.Random:
                    return this.playMusic(Math.floor(Math.random() * listLength + 0.5));
            }
        },
        playMusic(index) {
            if (this.lists[this.curlist].content.length == 0)
                return;
            if (index >= this.lists[this.curlist].content.length)
                index = 0;
            if (index < 0)
                index = this.lists[this.curlist].content.length - 1;
            this.playing = index;
            this.$refs.controller.playMusic(this.curlist, index);
            let curMusic  = this.lists[this.curlist].content[index];
            if (!curMusic.info)
                this.getInfo(curMusic, info => this.$refs.bk.setImgUrl(info.bk));
            else
                this.$refs.bk.setImgUrl(curMusic.info.bk);
        },
        switchList(index) {
            this.curlist = index;
        },
        loadFiles(files) {
            this.files = files;
        },
        loadList(list) {
            this.lists = list;
        },
        loadConfig(userConfig) {
            this.$refs.controller.loadConfig(userConfig.theme.toolbar);
        },
        getInfo(music, callback) {
            music.info = {
                artist: null,
                bk    : null,
                length: 0,
            };
            if (music.url.toLowerCase().startsWith('http')  || music.url.toLowerCase().startsWith('ftp') ) {
                // deal with web file
                global.jsmediatags.read(music.url, {
                    onSuccess: tag => {
                        music.info.bk = URL.createObjectURL(new Blob([Uint8Array.from(tag.tags.picture.data)], { type: tag.tags.picture.format }))
                        callback(music.info);
                    },
                    onError: err => console.log(err)
                });
            } else {
                // deal with local file(electron only)
                if (!(global.require && global.require('music-metadata')))
                    return console.log('Local files are allowed only on electron(desktop).');
                const tagReader = require('music-metadata');
                tagReader.parseFile(music.url).then( info => {
                    music.info.bk = URL.createObjectURL(new Blob([Uint8Array.from(info.common.picture[0].data)], { type: info.common.picture[0].format })),
                    callback(music.info);
                }).catch(err => console.log(err));
            }
        },
    }
});

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
}

global.getUserdata = function(userid, callback) {
    fetch().then(userdata => callback(userdata)).catch( err => console.log(err) );
}

global.chiyosekai = new global.ChiyoSekai({ el: '#chiyosekai' });
global.init(global.chiyosekai);
