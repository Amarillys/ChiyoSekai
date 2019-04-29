global.Cover = Vue.extend({
    props: ['theme', 'config'],
    data() {
        return {
            url: null
        };
    },
    template:
    `
    <div id="cover" :style="{
        width: theme.width + 'px',
        height: theme.height + 'px',
        background: theme.background
    }">
        <img id="cover" :src="this.url" :style="{ width: theme.width + 'px', height: theme.height + 'px' }">
    </div>
    `,
    methods: {
        setImgUrl(url) {
            this.url = url;
        }
    }
});
