/* config: auto load info of files */
/* eslint-env browser */
/* global Vue */
const global = this;
const locale = 'zh_CN';
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

global.Controller = Vue.extend({
    props: ['curlist', 'lists', 'playing'],
    data() {
        return {
            working: true
        }
    },
    template:
    `
    <audio id="controller" controls @ended="$emit('next')">
        <source ref="source" id="player" src>
    </audio>
    `,
    methods: {
        playMusic(curlist, index) {
            fetch(this.lists[curlist].content[index].url, { headers: { Range: "bytes=0-1" } })
            .then( () => {
                this.working = true;
                this.$refs.source.setAttribute('src', this.lists[curlist].content[index].url);
                this.$el.load();
                this.play();
            })
            .catch( err => {
                this.working = false;
                this.$refs.source.setAttribute('src', null);
                console.log(err);
            });
        },
        pause() {
            if (this.working)
                this.$el.pause();
        },
        play() {
            if (this.working)
                this.$el.play();
        },
        switch() {
            if (this.working)
                this.$el.paused ? this.play() : this.pause();
        }
    }
});

global.ImageViewer = Vue.extend({
    data() {
        return {
            url: null
        }
    },
    template:
    `
    <div id="viewer">
        <img id="bk" :src="this.url">
    </div>
    `,
    methods: {
        setImgUrl(url) {
            this.url = url;
        }
    }
});

global.PropertyWindow = Vue.extend({
    template:
    ``
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
            view   : null,
            theme  : this.userTheme  || this.initTheme(),
            config : this.userConfig || this.initConfig(),
            parent : null,
        };
    },
    watch: {
        files: {
            handler(newFiles) {
                this.view = newFiles;
            }
        }
    },
    mounted() {
        this.view    = this.files;
        this.parent  = null;
    },
    template : `
        <div :style="{ width: this.config.width + 'px', height: this.config.height + 'px' }">
            <div>
                <input type="text" :style="{ width: this.config.width - 4 + 'px', height: '20px' }"></input>
            </div>
            <div id="filelist">
                <div class="file back" v-if="this.parent != null" @click="exit()">
                    <img class="fileicon return"></img>
                    <span class="filename">{{ text("back") }}</span>
                </div> 
                <div class="file" v-for="file in view" @dblclick="enter(file.name)">
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
            this.view = this.parent.content;
            this.parent = this.parent.parent;
        },
        enter(filename) {
            let target = this.view.find( file => file.name == filename );
            if (target.child) {
                this.parent =  {
                    content: this.view,
                    parent : this.parent
                }
                this.view   = target.child;
            } else {
                this.$emit('addMusic', target);
            }
        },
        initTheme() {
            return {
                name   : 'default',
                folder : 'image/default/folder.svg',
                return : 'image/default/return.svg',
                file   : '',
            };
        },
        initConfig() {
            return {
                width: '400',
                height: '300',
            };
        },
    },
});

global.PlayList = Vue.extend({
    props: ['lists', 'curlist', 'display'],
    template: `
        <div id="playlist">
            <div id="tablist">
                <div v-for="list, index in lists" class="tab" @click="switchList(index)">{{ list.name }}</div>
            </div>
            <table id="list" :style="{ height: lists[curlist].content.length * 30 + 'px' }">
                <thead>
                    <th class="header" v-for="header in display" 
                        :style="{ width: header.width > 0 ? header.width + 'px' : 'auto' }">
                        {{ text(header.name) }}
                    </th>
                </thead>
                <tr v-for="music, index in lists[curlist].content" @dblclick="$emit('playMusic', index)">
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
            loop    : global.LOOP.ListLoop
        };
    },
    components: { FileList, PlayList, PropertyWindow, LyricWindow, ImageViewer, Controller },
    template: 
    `
    <div id="chiyosekai">
        <div id="left">
            <FileList :files="files" :playlist="$refs.playlist" v-on:addMusic="addMusic"></FileList>
            <ImageViewer ref="bk"></ImageViewer>
        </div>
        <div id="center">
            <Controller ref="controller" :playing="playing" :lists="lists"
                :curlist="curlist" :list="curlist" v-on:next="nextMusic"></Controller>
            <PlayList ref="playlist" :lists="lists" :display="listview" :curlist="curlist"
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
            this.playing = index;
            this.$refs.controller.playMusic(this.curlist, index);
            let curMusic  = this.lists[this.curlist].content[index];
            if (!curMusic.info)
                this.getInfo(curMusic, info => this.$refs.bk.setImgUrl(info.bk));
            else
                this.$refs.bk.setImgUrl(curMusic.info.bk);
        },
        chooseMusic(index) {
            
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

global.chiyosekai = new global.ChiyoSekai({ el: '#chiyosekai' });
global.init = function () {
    /* loading local config.json, check if online logined */
    const fs = require('fs');
    const path = require('path');
    fs.readFile(path.resolve(__dirname, 'data/sekai.json'), (err, data) => {
        global.chiyosekai.loadList(JSON.parse(data));
    });
    fs.readFile(path.resolve(__dirname, 'data/files.json'), (err, data) => {
        global.chiyosekai.loadFiles(JSON.parse(data));
    });
}
global.getUserdata = function(userid, callback) {
    fetch().then(userdata => callback(userdata)).catch( err => console.log(err) );
}

global.init();
