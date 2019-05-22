let Loading = global.Loading;
global.FileList = Vue.extend({
    props : ['files', 'userConfig', 'theme'],
    data() {
        return {
            view   : [{ "name": "Empty", "child": [] }],
            config : global.default.config,
            parent : null,
            search : '',
            formatedFiles: null,
            viewMode: 0,
            sort   : 'name',
            asc    : true,
            loading: false
        };
    },
    components: { Loading },
    computed: {
        viewName() {
            return Object.keys(global.VIEW)[this.viewMode];
        }
    },
    mounted() {
        this.parent = null;
        this.formatedFiles = this.view;
    },
    template :
    `
    <div id="file-container" :style="{ width: config.width + 'px' }">
        <Loading v-if="loading"></Loading>
        <div>
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
            <div class="file" v-for="file in view.filter(file => file.name.toLowerCase().includes(this.search.toLowerCase()) || (file.artist && file.artist.includes(this.search)) )" @dblclick="enter(file.name)" :title="file.name">
                <img class="fileicon" :class="{ [viewName]: true,  folder: !(file.child == undefined || file.child == null), music : (file.child == undefined || file.child == null) }"></img>
                <span class="filename">{{ file.name }}</span>
            </div>
        </div>
    </div>
    `,
    methods : {
        setLoading(loading) {
            this.loading = loading;
        },
        formatFiles(viewMode) {
            this.viewMode = viewMode;
            let groupElement = 'artist';
            let dictionary = {};
            let retFiles = [];
            switch (this.viewMode) {
                case global.VIEW.album:
                    groupElement = 'album';
                case global.VIEW.artist:
                    for (let i = 0; i < this.files.length; ++i) {
                        let ele = this.files[i][groupElement] || 'others';
                        let separator = ele.includes('&') ? '&' : '/';
                        if (groupElement === 'artist' && ele.includes(separator)) {
                            let artists = ele.split(separator);
                            artists.forEach(artist => {
                                artist = artist.trim();
                                dictionary[artist] = dictionary[artist] || [];
                                dictionary[artist].push(this.files[i]);
                            });
                        } else {
                            dictionary[ele] = dictionary[ele] || [];
                            dictionary[ele].push(this.files[i]);
                        }
                    }
                    let elements = Object.keys(dictionary);
                    for (let i = 0; i < elements.length; ++i) {
                        retFiles.push({
                            name: elements[i],
                            child: dictionary[elements[i]]
                        });
                    }
                    this.formatedFiles = retFiles;
                    break;
                case global.VIEW.folder:
                case global.VIEW.all:
                default:
                    this.formatedFiles = this.files;
            }
            this.view = this.formatedFiles;
        },
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
                this.view = target.child.filter(file => file.name.includes(this.search));
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
