global.Controller = Vue.extend({
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
            }[key][global.locale];
        }
    }
});
