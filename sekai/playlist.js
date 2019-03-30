global.PlayList = Vue.extend({
    data() {
        return {
            active: null
        };
    },
    props: ['lists', 'curlist', 'display', 'theme', 'config'],
    template: `
        <div id="playlist" class="chiyo-height-fill" :style="{ background: theme.background }">
            <div id="tablist">
                <div v-for="list, index in lists" class="tab" @click="switchList(index)"
                :style="{ height: theme.tab.height + 'px', fontSize: theme.tab.fontSize }"
                    :class="{ active: index == curlist, inactive: index != curlist }">{{ list.name }}</div>
            </div>
            <table id="list" :style="{
                height: lists[curlist].content.length * 30 + 'px',
                color : config.fontColor
            }">
                <thead>
                    <th class="header" v-for="header in display" 
                        :style="{ width: header.width > 0 ? header.width + 'px' : 'auto' }">
                        {{ text(header.name) }}
                    </th>
                </thead>
                <tr v-for="music, index in lists[curlist].content" @dblclick="$emit('playMusic', index)"
                    :class="{ activeMusic: index == active }" @click="active = index">
                    <th v-for="header in display">
                        {{ music[header.name] }}
                    </th>
                </tr>
            </table>
        </div>
    `,
    methods: {
        switchList(index) {
            this.$emit('switchList', index);
        },
        saveList() {

        },
        deleteMusic() {

        },
        text(key) {
            return {
                name   : { zh_CN: '音乐名', en: 'Music Name' },
                artist : { zh_CN: '艺术家', en: 'Artist' },
                url    : { zh_CN: '来源网址', en: 'Source URL' }
            }[key][global.locale];
        }
    },
});
