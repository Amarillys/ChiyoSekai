global.Cover = Vue.extend({
    props: ['config'],
    data() {
        return {
            url: null
        }
    },
    template:
    `
    <div id="viewer" :style="{ width: config.width + 'px', height: config.height + 'px' }">
        <img id="cover" :src="this.url" :style="{ width: config.width + 'px', height: config.height + 'px' }">
    </div>
    `,
    methods: {
        setImgUrl(url) {    
            this.url = url;
        }
    }
});
