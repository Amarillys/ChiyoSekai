global.Property = Vue.extend({
    props: ['config', 'theme', 'userinfo'],
    template:
    `<div id="property" :style="{
        height: theme.height + 'px',
        width : theme.width + 'px'
    }">
        <h2 id="username">{{ userinfo.username }}</h2>
    </div>`
});
