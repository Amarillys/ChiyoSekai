
global.FileList = Vue.extend({
    props : ['files', 'userConfig', 'userTheme'],
    data() {
        return {
            view   : [{ "name": "Empty", "child": [] }],
            config : global.default.config,
            theme  : global.default.theme,
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
        this.view    = this.files;
        this.parent  = null;
    },
    template :
    `
        <div :style="{ width: this.config.width + 'px', height: this.config.height + 'px' }">
            <div>
                <input type="text" v-model="search" :style="{ width: this.config.width - 4 + 'px', height: '24px', 'font-size': '1.1em' }"></input>
            </div>
            <div id="filelist">
                <div class="file back" v-if="this.parent != null" @click="exit()">
                    <img class="fileicon return"></img>
                    <span class="filename">{{ text("back") }}</span>
                </div> 
                <div class="file" v-for="file in view.filter(file => file.name.includes(this.search))" @dblclick="enter(file.name)">
                    <img class="fileicon" :class="{ folder: !(file.child == undefined || file.child == null), music : (file.child == undefined || file.child == null) }"></img>
                    <span class="filename">{{ file.name }}</span>
                </div>
            </div>
        </div>
    `,
    methods  : {
        text(key) {
            return {
                back : { zh_CN: '返 回', en: 'Back'}
            }[key][locale];
        },
        exit() {
            this.view = this.parent.content.filter(file => file.name.includes(this.search));
            this.parent = this.parent.parent;
        },
        enter(filename) {
            let target = this.view.find( file => file.name == filename );
            if (target.child) {
                this.parent =  {
                    content: this.view,
                    parent : this.parent
                }
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
