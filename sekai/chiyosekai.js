
global.ChiyoSekai = Vue.extend({
    data() {
        return {
            files   : [{ "name": "Empty", "child": [] }],
            curlist : 0,
            lists   : [{ "name": "Empty", "content": [] }],
            listview: [{ name: 'name', width: 120 }, { name: 'artist', width: 80 }, { name: 'url' }],
            playing : null,
            loop    : global.LOOP.ListLoop,
            config  : global.default,
            theme   : global.default.theme
        };
    },
    components: { FileList, PlayList, Property, Lyric, Cover, Controller, User },
    template:
    `
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
                :curlist="curlist" :list="curlist" v-on:playMusic="playMusic"></Controller>
            <PlayList ref="playlist" :lists="lists" :display="listview" :curlist="curlist"
                :theme="config.theme.playlist" :config="config.config" v-on:choose="chooseMusic"
                v-on:playMusic="playMusic" v-on:switchList="switchList"></PlayList>
        </div>
        <div id="right">
            <Lyric ref="lyric"></Lyric>
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
            switch (this.loop) {
                case global.LOOP.ListLoop:
                    return this.playMusic(this.playing + 1 >= listLength ? 0 : this.playing + 1);
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
            if (this.lists[this.curlist].content.length === 0)
                return;
            if (index >= this.lists[this.curlist].content.length)
                index = 0;
            if (index < 0)
                index = this.lists[this.curlist].content.length - 1;
            this.playing = index;
            this.$refs.controller.playMusic(this.curlist, index);
            let curMusic  = this.lists[this.curlist].content[index];
            if (!curMusic.info)
                this.getInfo(curMusic, info => this.$refs.cover.setImgUrl(info.cover));
            else
                this.$refs.cover.setImgUrl(curMusic.info.cover);
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
                cover    : null,
                length: 0,
            };
            if (music.url.toLowerCase().startsWith('http') || music.url.toLowerCase().startsWith('ftp') ) {
                // deal with web file
                global.jsmediatags.read(music.url, {
                    onSuccess: tag => {
                        music.info.cover = URL.createObjectURL(new Blob([Uint8Array.from(tag.tags.picture.data)], { type: tag.tags.picture.format }));
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
                    music.info.cover = URL.createObjectURL(new Blob([Uint8Array.from(info.common.picture[0].data)], { type: info.common.picture[0].format })),
                    callback(music.info);
                }).catch(err => console.log(err));
            }
        },
    }
});
