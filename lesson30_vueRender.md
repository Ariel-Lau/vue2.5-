### 参考vue.js文档：
[render](https://cn.vuejs.org/v2/api/#render)
[渲染函数](https://cn.vuejs.org/v2/guide/render-function.html)

```javascript
new Vue({
    el: '#App',
    components: {
        App
    },
    template: '<App/>',
    store
})

<!-- render渲染函数 -->
new Vue({
    el: '#App',
    render: h => h(App),
    store
}),

new Vue({
    el: '#App',
    render: function (createdElement) {
        <!-- <App/> -->
        return createdElement(App)
    },
    store
})
```