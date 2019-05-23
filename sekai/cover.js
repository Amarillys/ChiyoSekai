global.Cover = Vue.extend({
    props: ['theme', 'config'],
    data() {
        return {
            url: './img/music.svg'
        };
    },
    template:
    `
    <div id="cover" :style="{
        width: theme.width + 'px', height: theme.height + 'px',
        background: theme.background, opacity: theme.opacity
    }">
        <img id="cover" :src="this.url" :style="{ width: theme.width + 'px', height: theme.height + 'px' }">
    </div>
    `,
    methods: {
        setImgUrl(url) {
            this.url = url || './img/music.svg';
        }
    }
});
