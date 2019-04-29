global.FileList = Vue.extend({
    props : ['files', 'userConfig', 'theme'],
    data() {
        return {
            view   : [{ "name": "Empty", "child": [] }],
            config : global.default.config,
            parent : null,
            search : '',
        };
    },
    watch: {
        files: {
            handler(newFiles) {
                this.view = newFiles;
            }
        },
    },
    mounted() {
        this.view   = this.files;
        this.parent = null;
    },
    template :
    `
    <div id="file-container" :style="{ width: config.width + 'px' }">
        <div >
            <input id="filesearch" type="text" v-model="search" :style="{
                height: theme.searchHeight + 'px',
                fontSize   : theme.searchSize,
                fontFamily : config.fontFamily,
                color      : theme.searchColor,
                background : theme.searchBg
            }"></input>
        </div>
        <div id="filelist" :style="{
            background : theme.background,
            color      : config.fontColor,
            height     : (theme.height - 4 - 5 - theme.inputHeight) + 'px'
        }">
            <div class="file back" v-if="this.parent != null" @click="exit()">
                <img class="fileicon return"></img>
                <span class="filename">{{ text("back") }}</span>
            </div>
            <div class="file" v-for="file in view.filter(file => file.name.includes(this.search) || (file.artist && file.artist.includes(this.search)) )" @dblclick="enter(file.name)" :title="file.name">
                <img class="fileicon" :class="{ folder: !(file.child == undefined || file.child == null), music : (file.child == undefined || file.child == null) }"></img>
                <span class="filename">{{ file.name }}</span>
            </div>
        </div>
    </div>
    `,
    methods  : {
        text(key) {
            return {
                back : { zh_CN: '返 回', en: 'Back' }
            }[key][global.locale];
        },
        exit() {
            this.view = this.parent.content.filter(file => file.name.includes(this.search));
            this.parent = this.parent.parent;
        },
        enter(filename) {
            let target = this.view.find( file => file.name === filename );
            if (target.child) {
                this.parent = {
                    content: this.view,
                    parent : this.parent
                };
                this.view   = target.child.filter(file => file.name.includes(this.search));
            } else {
                this.$emit('addMusic', target);
            }
        },
        initTheme() {
            return {
            };
        },
        initConfig() {
        },
    },
});
