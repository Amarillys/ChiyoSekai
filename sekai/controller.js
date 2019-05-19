global.Controller = Vue.extend({
    props: ['curlist', 'lists', 'playing', 'toolbar', 'theme', 'nyan', 'loop', 'config', 'initVolume'],
    data() {
        return {
            working: true,
            currentTime: 0,
            volume: this.initVolume
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
                <ProgressBar ref="volume" @adjust="adjustvolume" :status="'playing'"
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
        adjustvolume(newVol) {
            this.volume = newVol;
            this.$refs.audio.volume = newVol;
            global.config.volume = newVol;
        },
        adjustTime(newTime) {
            let time = parseFloat(newTime * this.$refs.audio.duration);
            this.currentTime = time;
            this.$refs.audio.currentTime = time;
        },
        onTimeUpdate () {
            this.currentTime = this.$refs.audio.currentTime;
        },
        btnHandler(button) {
            switch (button) {
                case 'play':
                    return this.playMusic(this.curlist, this.playing);
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
                case 'delete':
                    return this.$emit('deleteList');
                case 'volume':
                    return this;
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
                this.nyan('info', this.i18n('error') + music.name);
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
                ][this.loop][global.locale];
            return {
                open   : { zh_CN: '打开目录',   en: 'Open Folder' },
                add    : { zh_CN: '添加播放列表',   en: 'Add Playlist' },
                play   : { zh_CN: '播放',   en: 'Play'  },
                next   : { zh_CN: '下一曲', en: 'Next'  },
                stop   : { zh_CN: '停止',   en: 'Stop'  },
                pause  : { zh_CN: '暂停',   en: 'Pause' },
                last   : { zh_CN: '上一首', en: 'Last'  },
                remove : { zh_CN: '移除该曲', en: 'Remove this music' },
                save   : { zh_CN: '保存播放列表',  en: 'Save Playlist' },
                split  : { zh_CN: '',       en: '' },
                delete : { zh_CN: '删除播放列表', en: 'Delete Playlist' },
                error  : { zh_CN: '无法播放歌曲：', en: 'Cannot play music: ' },
                volume : { zh_CN: '音量',   en: 'volume' }
            }[key][global.locale];
        }
    }
});
