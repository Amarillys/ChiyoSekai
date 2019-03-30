global.User = Vue.extend({
    data() {
        return {
            username: 'Sekai',
            avatar: 'https://misuzu.moe/store/image/qq.jpg'
        };
    },
    props: ['theme'],
    computed: {
        avatarSize() {
            return (Math.min(this.theme.height, this.theme.width) - this.theme.avatarMargin * 2) + 'px';
        }
    },
    template:
    `
    <div id="user" :style="{ height: theme.height + 'px', width: theme.width + 'px' }">
        <img id="avatar" :style="{ height: avatarSize, width: avatarSize, margin: theme.avatarMargin + 'px' }" :src="avatar"></img>
        <div>
            <div></div>
            <div></div>
        </div>
    </div>
    `,
    methods: {
        loadUserdata() {

        }
    }
});
