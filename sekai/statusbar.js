global.ProgressBar = Vue.extend({
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

function registerMouseMove(func) {
    global.document.addEventListener('mousemove', func);
}

function registerMouseUp(func) {
    global.document.addEventListener('mouseup', func);
}

let ProgressBar = global.ProgressBar;
global.StatusBar = Vue.extend({
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
