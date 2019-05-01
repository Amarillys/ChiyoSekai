
global.ChiyoSekai = Vue.extend({
    data() {
        return {
            files   : [{ "name": "Empty", "child": [] }],
            curlist : 0,
            lists   : [{ name: 'sekai', user: 'chiyo', content: [] }],
            listview: [{ name: 'name', width: 150 }, { name: 'artist', width: 80 },
                    { name: 'duration', width: 50 }, { name: 'album', width: 100 }],
            playing : null,
            status  : null,
            loop    : global.LOOP.ListLoop,
            config  : global.default,
            theme   : global.default.theme,
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
                <Controller ref="controller" :playing="playing" :lists="lists" :theme="theme.controller" @resume="resumeMusic"
                    :curlist="curlist" :list="curlist" @playMusic="playMusic" @deleteList="deleteList" @pause="pauseMusic"
                    @saveList="saveList" @addList="addList" @openFolder="openFolder" @next="nextMusic" @stop="stopMusic">
                </Controller>
                <PlayList ref="playlist" :lists="lists" :display="listview" :curlist="curlist" :status="status"
                    :theme="config.theme.playlist" :config="config.config" v-on:choose="chooseMusic" :playing="playing"
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
        pauseMusic() {
            this.status = 'pause';
        },
        resumeMusic() {
            this.status = 'playing';
        },
        stopMusic() {
            this.status = null;
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
                const files = global.getFileList(folder[0], ['mp3', 'm4a', 'aac', 'ogg', 'wav', 'lac', 'tak', 'ape'])
                .map(file => ({
                    name: file.slice(file.lastIndexOf('\\') + 1, file.lastIndexOf('.')),
                    url: file
                }));
                this.files = [];
                files.map(file => {
                    global.getInfo(file, () => {
                        file.name = file.title || file.name;
                        this.files.push(file);
                    });
                });
            });
        },
        nextMusic() {
            let listLength = this.lists[this.curlist].content.length;
            this.status = null;
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
                global.getInfo(curMusic, music => this.$refs.cover.setImgUrl(music.cover));
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
            this.lists.push({ name: newListNames, user: global.user,
                file: `${newListNames}@${global.user}.json`, content: [] });
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
            }[key][global.locale];
        }
    }
});
