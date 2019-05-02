global.PlayList = Vue.extend({
    data() {
        return {
            editable: null,
            active: null,
            tabFocus: false,
            statusLocation: 2
        };
    },
    props: ['lists', 'curlist', 'display', 'theme', 'config', 'playing', 'status'],
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
                    <th class="header" v-for="header in addStatus()"
                        :style="{ width: header.width > 0 ? header.width + 'px' : 'auto' }">
                        {{ text(header.name) }}
                    </th>
                </thead>
                <draggable v-model="lists[curlist].content" tag="tbody">
                    <tr v-for="(music, index) in lists[curlist].content" @dblclick="$emit('playMusic', index)"
                        :class="{ activeMusic: index == active, musicRow: true }" @click="active = index" :key="index">
                        <td v-for="header in display.slice(0, statusLocation)" class="nowrap" :title="music[header.name]">
                            {{ music[header.name] }}
                        </td>
                        <td class="statusColumn">
                            <img v-if="(index == playing && status !== null) || (lists[curlist].content[index].invalid)" class="status-img"
                                :src="setStatusImg(index)"></img>
                        </td>
                        <td v-for="header in display.slice(statusLocation)" class="nowrap" :title="music[header.name]">
                            {{ music[header.name] }}
                        </td>
                    </tr>
                </draggable>
            </table>
        </div>
    `,
    methods: {
        setStatusImg(index) {
            if (this.lists[this.curlist].content[index].invalid)
                return './img/remove.svg';
            if (this.status === 'playing')
                return './img/play.svg';
            return './img/pause.svg';
        },
        switchList(index) {
            this.$emit('switchList', index);
        },
        addStatus() {
            let arr = this.display.slice();
            arr.splice(this.statusLocation, 0, { name: 'status', width: 50 });
            return arr;
        },
        text(key) {
            return {
                album   : { zh_CN: '专辑', en: 'Album' },
                name    : { zh_CN: '音乐名', en: 'Music Name' },
                artist  : { zh_CN: '艺术家', en: 'Artist' },
                url     : { zh_CN: '来源网址', en: 'Source URL' },
                duration: { zh_CN: '时长', en: 'Length' },
                status  : { zh_CN: '状态', en: 'Status' }
            }[key][global.locale];
        }
    },
});
