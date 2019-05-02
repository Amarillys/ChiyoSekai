global.PromptWindow = Vue.extend({
    props: ['nyan'],
    data() {
        return {
            type: 'info',
            buttons: {
                info : ['okay'],
                ask  : ['confirm', 'cancel'],
                error: ['okay']
            },
            text: 'Nyan~~喵喵喵~~',
            title: 'Nyan~~喵喵喵~~',
            active: false,
            callback: {
                'okay': () => {}
            },
            params: {}
        };
    },
    template:
    `
    <div id="p-mask" :style="{ opacity: active ? 0.8: 0, zIndex: active ? 233: -1 }">
        <div id="prompt-window">
            <div id="header">
                <div id="title">
                    {{ title }}
                </div>
            </div>
            <div id="body">
                <div id="text">
                    {{ text }}
                </div>
                <div id="footer">
                    <button v-for="btn in buttons[type]" @click="btnHandler(btn)">{{ i18n(btn) }}</button>
                </div>
            </div>
        </div>
    </div>
    `,
    mounted() {
        this.$emit('nyan', this.invoke);
        global.nyan = this.invoke;
    },
    methods: {
        invoke(type, text, title, callback, params) {
            if (this.active)
            this.title    = title || this.title;
            this.text     = text  || this.text;
            this.type     = type  || 'info';
            this.callback = callback;
            this.params   = params;
            this.active   = true;
        },
        i18n(key) {
            return {
                confirm: { zh_CN: '确定',   en: 'Confirm' },
                cancel : { zh_CN: '取消',   en: 'Cancel' },
                okay   : { zh_CN: 'Okay',   en: 'Okay'  },
                info   : { zh_CN: '提示', en: 'Info'  },
                error  : { zh_CN: '错误发生啦',   en: 'Error Nyan'  },
                ask    : { zh_CN: '操作确认喵',   en: 'Operation Confirm Nyan' }
            }[key][global.locale];
        },
        btnHandler(btn) {
            if (this.callback && this.callback[btn])
                this.callback[btn].apply(this.params && this.params[btn]);
            this.active = false;
        }
    }
});
