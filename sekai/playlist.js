global.PlayList = Vue.extend({
    data() {
        return {
            editable: null,
            active: null,
            tabFocus: false,
            statusLocation: 2
        };
    },
    props: ['lists', 'curlist', 'display', 'theme', 'config', 'playing', 'status', 'viewlist'],
    template: `
        <div id="playlist" class="chiyo-height-fill flex-auto" :style="{ background: theme.background }">
            <div id="tablist">
                <input v-for="list, index in lists" class="tab" @click="switchList(index)"
                    :style="{ height: theme.tab.height + 'px', fontSize: theme.tab.fontSize,
                        maxWidth: theme.tab.maxWidth, textAlign: 'center', width: (list.name.length * 18) + 'px' }"
                    :class="{ active: index == viewlist, inactive: index != viewlist, noborder: true }"
                    v-model="list.name" :readonly="editable != index" @dblclick="editable = index" @blur="editable = -1">
                </input>
            </div>
            <table id="list" :style="{
                color : config.fontColor, borderCollapse: 'collapse', tableLayout: 'fixed'
            }">
                <thead>
                    <th class="header" v-for="header in addStatus()"
                        :style="{ width: header.width > 0 ? header.width + 'px' : 'auto' }">
                        {{ text(header.name) }}
                    </th>
                </thead>
                <draggable v-model="lists[viewlist].content" tag="tbody" @end="onEnd" handle=".drag-handle">
                    <tr v-for="(music, index) in lists[viewlist].content" @dblclick="onDblClick(index)"
                        :class="{ activeMusic: index == active, musicRow: true }" @click="active = index" :key="index">
                        <td v-for="(header, index) in display.slice(0, statusLocation)" :class="'nowrap ' + header.name" :title="music[header.name]">
                            <span v-if="index == 0" class="drag-handle" style="padding-right: 10px">♬</span>{{ music[header.name] }}
                        </td>
                        <td class="statusColumn drag-handle">
                            <img v-if="(index == playing && status !== null) || (lists[viewlist].content[index].invalid)" class="status-img"
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
        onDblClick(index) {
            this.$emit('setWorkList');
            this.$emit('playMusic', index);
        },
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
        },
        onEnd(e) {
            if ((e.oldIndex < this.playing && e.newIndex < this.playing) ||
                (e.oldIndex > this.playing && e.newIndex > this.playing))
                return;
            if (e.oldIndex === this.playing)
                this.$emit('resetPlayging', e.newIndex);
            if (e.oldIndex > this.playing && e.newIndex <= this.playing)
                this.$emit('resetPlayging', this.playing + 1);
            if (e.oldIndex < this.playing && e.newIndex >= this.playing)
                this.$emit('resetPlayging', this.playing - 1);
        },
    },
});
