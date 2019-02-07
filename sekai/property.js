global.Property = Vue.extend({
    props: ['config'],
    template:
    `<div id="property" :style="{ width: config.width + 'px', height: config.height + 'px' }"></div>`
});