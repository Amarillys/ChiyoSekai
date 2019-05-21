global.ChiyoSekai = Vue.extend({
    data() {
        return {
            files   : [{ "name": "Empty", "child": [] }],
            curlist : 0,
            viewlist: 0,
            lists   : [{ name: 'sekai', user: 'chiyo', content: [] }],
            headers: [{ name: 'name', width: 150 }, { name: 'artist', width: 80 },
                    { name: 'duration', width: 50 }, { name: 'album', width: 100 }],
            playing : null,
            status  : null,
            loop    : global.default.config.loopMode,
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
                    :curlist="curlist" :list="curlist"     :nyan="nyan"   :config="config" :loop="loop"
                    @pause="pauseMusic"    @addList="addList"    @stop="stopMusic" @switch="switchLoop"
                    @playMusic="playMusic" @resume="resumeMusic" @deleteList="deleteList"
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
    },
    methods: {
        init(config) {
            if (config.lastFolder) this.loadFolder(config.lastFolder);
            if (config.volume) this.$refs.controller.setVolume(config.volume);
            if (config.loopMode !== undefined) {
                this.loop = config.loopMode;
                this.switchLoop();
            }
        },
        exit() {
            this.saveList();
            require('fs').writeFileSync(global.dataPath + '/config.json', JSON.stringify(global.config, null, 4));
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
                    let listPath = global.playlistPath;
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
        switchLoop() {
            if (this.loop >= 4)
                this.loop = 0;
            else
                this.loop++;
            global.config.loopMode = this.loop;
            let btns = this.theme.controller.buttons;
            let loopWay = Object.keys(global.LOOP)[this.loop];
            let targetBtn = btns.map(btn => btn.name).indexOf('random');
            btns[targetBtn].icon = `url(./img/${loopWay}.svg)`;
        },
        openFolder() {
            const dialog = require('electron').remote.dialog;
            dialog.showOpenDialog({
                properties: ['openDirectory']
            }, folder => this.loadFolder(folder[0]));
        },
        loadFolder(folder) {
            if (!folder) return;
            global.config.lastFolder = folder;
            const files = global.getFileList(folder, ['mp3', 'm4a', 'aac', 'ogg', 'wav', 'lac', 'tak', 'ape'])
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
        },
        refreshFolder() {
            this.loadFolder(global.config.lastFolder);
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
            this.lists.push({ name: newListNames, user: global.user,
                file: `${newListNames}@${global.user}.json`, content: [] });
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
            let listPath = global.playlistPath;
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
            }[key][global.locale];
        }
    }
});
