
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
            loop    : global.LOOP.listloop,
            config  : global.default.config,
            theme   : global.default.theme,
            indialog: false,
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
                <FileList ref="filelist" :files="files" @addMusic="addMusic" :theme="theme.filelist"></FileList>
                <div class="leftbottom">
                    <div class="chiyo-right">
                        <Cover ref="cover" :theme="theme.cover"></Cover>
                    </div>
                </div>
            </div>
            <div id="center">
                <Controller ref="controller" :playing="playing"  :lists="lists" :theme="theme.controller"
                          :curlist="curlist" :list="curlist"     :nyan="nyan"   :config="config"  :loop="loop"
                    @pause="pauseMusic"    @addList="addList"    @stop="stopMusic" @switch="switchLoop"
                    @playMusic="playMusic" @resume="resumeMusic" @deleteList="deleteList" @setProgress="setProgress"
                    @saveList="saveList"   @remove="removeMusic" @next="nextMusic" @openFolder="openFolder" >
                </Controller>
                <PlayList ref="playlist" :lists="lists" :display="listview" :curlist="curlist" :status="status"
                    :theme="theme.playlist" :config="config" :playing="playing"
                    @playMusic="playMusic" @switchList="switchList" @choose="chooseMusic">
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
    methods: {
        adjustTime(time) {
            this.$refs.controller.adjustTime(time);
        },
        addMusic(music) {
            this.lists[this.curlist].content.push(music);
        },
        chooseMusic(index) {
        },
        nextMusic() {
            let listLength = this.lists[this.curlist].content.length;
            this.status = null;
            switch (this.loop) {
                case global.LOOP.listloop:
                    return this.playMusic(this.playing + 1 >= listLength ? 0 : this.playing + 1);
                case global.LOOP.listonce:
                    return this.playing + 1 >= listLength ? null : this.playMusic(this.playing + 1);
                case global.LOOP.oneloop:
                    return this.playMusic(this.playing);
                case global.LOOP.once:
                    return;
                case global.LOOP.random:
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
                global.getInfo(curMusic, music => this.$refs.cover.setImgUrl(music.cover));
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
                    this.saveList();
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
        switchLoop() {
            if (this.loop >= 4)
                this.loop = 0;
            else
                this.loop++;
            let btns = this.theme.controller.buttons;
            let loopWay = Object.keys(global.LOOP)[this.loop];
            let targetBtn = btns.map(btn => btn.name).indexOf('random');
            btns[targetBtn].icon = `url(./img/${loopWay}.svg)`;
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
        setProgress(prog) {
            this.$refs.status.setProgress(prog);
        },
        nyanInited(nyan) {
            this.nyan = nyan;
        },
        i18n(key, extra) {
            return {
                deleteList: { zh_CN: `确定要删除播放列表: ${extra} 吗？`, en: `Are you sure to delete playlist: ${extra} ?` },
                deleteMusic: { zh_CN: `确定要从播放列表移除曲子: ${extra} 吗？`, en: `Are you sure to remove music: ${extra} from playlist?` }
            }[key][global.locale];
        }
    }
});
