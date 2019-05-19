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
            progress: 0,
            afterAdjust: false
        };
    },
    watch: {
        progress(newProg) {
            if (newProg === 0 && this.status !== 'playing') return;
            if (newProg > 1) return this.progress = 1;
            if (newProg < 0) return this.progress = 0;
            if (!this.afterAdjust) return;
            if (this.status !== 'playing') return this.progress = 0;
            this.afterAdjust = false;
            this.$emit('adjust', newProg);
        }
    },
    template: `
        <div :style="{ height: ballSize + 'px'}">
            <div class="progress-bar flex-center" ref="outbar" style="user-select: none;position: relative;width: 100%;">
                <div class="progress-bar-line" :style="{ width: lengthRate + '%', height: lineHeight + 'px',
                    backgroundColor: lineColor, borderRadius: lineHeight / 2 + 'px'}">
                </div>
                <div class="progress-bar-played" @mousedown="onMouseDown"
                    :style="{ left: ((100 - lengthRate) / 2) + '%', position: 'absolute',
                        width: (progress * lengthRate + 0.5)+ '%', height: lineHeight + 'px' , backgroundColor: 'rgba(216, 124, 183, 0.9)',
                        borderRadius: lineHeight / 2 + 'px'}">
                </div>
                <div class="progress-bar-ball" @mousedown="onMouseDown"
                    :style="{ left: left, position: 'absolute', top: (-lineHeight) + 'px',
                        width: ballSize + 'px', height: ballSize + 'px' , backgroundColor: ballColor,
                        borderRadius: ballSize / 2 + 'px', cursor: 'pointer'}">
                </div>
            </div>
        </div>`,
    computed: {
        left() {
            return `calc(${3 + this.progress * this.lengthRate}% - ${this.ballSize / 2}px)`;
        },
        length() {
            return this.width * this.lengthRate / 100;
        },
        side() {
            return this.width * (0.5 - this.lengthRate / 200);
        }
    },
    methods: {
        setProgress(prog) {
            if (prog > 1 || prog < 0) return;
            if (this.dragging)
                return;
            this.progress = prog;
        },
        onMouseDown() {
            this.dragging = true;
        }
    },
    mounted() {
        this.width = this.$refs.outbar.clientWidth;
        registerMouseMove((evt) => {
            if (!this.dragging) return;
            evt.preventDefault();
        });
        registerMouseUp(evt => {
            if (!this.dragging) return;
            this.afterAdjust = true;
            if (evt.offsetX > this.windowWidth )
                this.progress = 1;
            else if (evt.clientX < this.windowWidth - this.length * 1.2)
                this.progress = 0;
            else
                this.progress = (evt.offsetX - this.side) / this.length;
            this.dragging = false;
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
    props: ['theme', 'config', 'music', 'status'],
    components: { ProgressBar },
    template: `
    <div id="status-bar" :style="{ height: theme.height + 'px' }" class="flex-fixed">
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
