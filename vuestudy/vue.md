## vue 2.5学习从入门到精通
1.v-show通过display来显示/隐藏
2.filter过滤器：思考：全局过滤器？定义通用方法？
3.transition过渡动画
4.自定义指令：
可以操作绑定的元素：
```
<p v-test="测试" id="test"></p>

<!-- el就是绑定的p元素，binding.value就是v-test指令绑定的值 -->
Vue.directive('test', {
  bind: function (el, binding, vnode) {
    el.style.position = 'fixed'
    el.style.top = binding.value + 'px'
  }
})

new Vue({
  el: '#test'
})

```
思考：项目里的通用方法可以改成自定义指令的形式么？然后用指令的形式接入业务逻辑中

5.vue的插件库

```
(function() {
    // 需要向外暴露的插件对象
    const MyPlugin = {};
    // 插件对象必须有一个install()
    MyPlugin.install = function (Vue, options) {
        // 1. 添加全局方法或属性
        Vue.myGlobalMethod = function () {
            // 逻辑...
            console.l.og('vue函数对象的方法myGlobalMethod()');
        }
    }

    // 2. 添加全局资源
    Vue.directive('my-directive', function(el, binding){
        el.textContent = binding.value.toUpperCase();
    })

    // 4. 添加实例方法
    Vue.prototype.$myMethod = function (methodOptions) {
        // 逻辑...
        console.log('vue实例对象的方法$myMethod()');
    }

    // 向外暴露
    window.MyPlugin = MyPlugin;
})()
```

```
// 声明使用插件
Vue.use(MyPlugin) // 内部会执行MyPlugin.install(Vue)
```
