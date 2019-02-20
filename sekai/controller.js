global.Controller = Vue.extend({
    props: ['curlist', 'lists', 'playing', 'toolbar'],
    data() {
        return {
            working: true,
            config : global.default.theme.controller
        };
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
                play   : { zh_CN: '播放',   en: 'Play'  },
                next   : { zh_CN: '下一曲', en: 'Next'  },
                stop   : { zh_CN: '停止',   en: 'Stop'  },
                pause  : { zh_CN: '暂停',   en: 'Pause' },
                last   : { zh_CN: '上一首', en: 'Last'  },
                random : { zh_CN: '随机',  en: 'Random' },
            }[key][global.locale];
        }
    }
});
