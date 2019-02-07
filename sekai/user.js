global.User = Vue.extend({
    data() {
        return {
            username: 'Sekai',
            avatar: 'https://misuzu.moe/store/image/qq.jpg'
        };
    },
    props: ['config'],
    computed: {
        avatarSize() {
            return (Math.min(this.config.height, this.config.width) - this.config.avatarMargin * 2) + 'px';
        }
    },
    template: 
    `
    <div id="user" :style="{ height: config.height + 'px', width: config.width + 'px' }">
        <img id="avatar" :style="{ height: avatarSize, width: avatarSize, margin: config.avatarMargin + 'px' }" :src="avatar"></img>
    </div>
    `,
    methods: {
        loadUserdata() {

        }
    }
});