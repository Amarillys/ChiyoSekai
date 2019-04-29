global.PlayList = Vue.extend({
    data() {
        return {
            editable: null,
            active: null,
            tabFocus: false
        };
    },
    props: ['lists', 'curlist', 'display', 'theme', 'config'],
    template: `
        <div id="playlist" class="chiyo-height-fill" :style="{ background: theme.background }">
            <div id="tablist">
                <input v-for="list, index in lists" class="tab" @click="switchList(index)"
                    :style="{ height: theme.tab.height + 'px', fontSize: theme.tab.fontSize,
                        maxWidth: theme.tab.maxWidth, textAlign: 'center', width: (list.name.length * 18) + 'px' }"
                    :class="{ active: index == curlist, inactive: index != curlist, noborder: true }"
                    v-model="list.name" :readonly="editable != index" @dblclick="editable = index" @blur="editable = -1">
                </input>
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
                    <td v-for="header in display" class="nowrap" :title="music[header.name]">
                        {{ music[header.name] }}
                    </td>
                </tr>
            </table>
        </div>
    `,
    methods: {
        switchList(index) {
            this.$emit('switchList', index);
        },
        deleteMusic() {

        },
        text(key) {
            return {
                album   : { zh_CN: '专辑', en: 'Album' },
                name    : { zh_CN: '音乐名', en: 'Music Name' },
                artist  : { zh_CN: '艺术家', en: 'Artist' },
                url     : { zh_CN: '来源网址', en: 'Source URL' },
                duration: { zh_CN: '时长', en: 'Length' }
            }[key][global.locale];
        }
    },
});
