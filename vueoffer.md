## 说下你对mvvm的理解、阐述一下你所理解的MVVM响应式原理

vue是采用数据劫持(observer)配合发布者(dep)-订阅者（watcher）模式的方式，通过Object.defineProperty()来劫持、监视各个data属性的setter和getter，在数据更新的时候，发布消息给依赖收集器（Dep），然后Dep会通知订阅者（watcher），watcher会调用对应的回调函数去更新（updater）视图。

MVVM为绑定的入口，即new Vue()的入口，通过Observer、Compile、Watcher三者之间的相互配合，即Observer来劫持、监视data中的数据变化，Compile解析、编译模板，通过Watcher建立Observer和Compile直接的通信桥梁，达到：数据更新 => 视图更新 

## v-model的原理，双向数据绑定的原理
三步：
1. model -> view，即：data: {name: mm} -> `<input :value="name"/>`
2. 给元素添加input事件监听：ele.addEventListener('input', fn......)
3. view -> model：view改变model会触发set()，即又会重新触发model -> view，这样就实现了双向绑定。所以核心还是model -> view

![](./imgs/databind2.jpg)
```javascript
<input v-model="msg" />
```
`v-model`是`v-bind`和`v-on`的语法糖，相当于`v-bind` + `v-on` => `:value='msg'` + `@input="fn"`

```javascript
<input v-bind:value="msg" v-on:input="msg=$event.target.value" />
```

## router、routes、route
| 名称 | 解释 | 备注 |
| --- | --- | --- |
| `router` | 路由实例 | `this.$router`访问路由器 |
| `routes` | 路由对象组成的路由数组 | - |
| `route` | 路由对象 | `this.$route`访问当前路由，在当前路由上可以获取到`path, params, hash, query, fullPath, matched, name`等路由信息参数，https://router.vuejs.org/zh/api/#%E8%B7%AF%E7%94%B1%E5%AF%B9%E8%B1%A1 |

动态路由传参：https://router.vuejs.org/zh/guide/essentials/dynamic-matching.html#%E5%93%8D%E5%BA%94%E8%B7%AF%E7%94%B1%E5%8F%82%E6%95%B0%E7%9A%84%E5%8F%98%E5%8C%96

## 导航守卫
1. 观察`$route`对象
2. `router.beforeEach()`注册全局前置守卫
3. `beforeRouteUpdate`组件内守卫
4. `beforeEnter`路由独享的守卫
```javascript
const router = new VueRouter({
  routes: [
    {
      path: '/foo',
      component: Foo,
      beforeEnter: (to, from, next) => {
        // ...
      }
    }
  ]
})
```
5. 组件内的守卫：https://router.vuejs.org/zh/guide/advanced/navigation-guards.html#%E7%BB%84%E4%BB%B6%E5%86%85%E7%9A%84%E5%AE%88%E5%8D%AB
`beforeRouteEnter`不能访问this
`beforeRouteUpdate`可以访问this
`beforeRouteLeave`可以访问this

///////////////////////////

* 全局前置/钩子：beforeEach、beforeResolve、afterEach
* 路由独享的守卫：beforeEnter
* 组件内的守卫：beforeRouteEnter、beforeRouteUpdate、beforeRouteLeave

完整的导航解析流程如下：

* 导航被触发。
* 在失活的组件里调用离开守卫。
* 调用全局的 beforeEach 守卫。
* 在重用的组件里调用 beforeRouteUpdate 守卫 (2.2+)。
* 在路由配置里调用 beforeEnter。
* 解析异步路由组件。
* 在被激活的组件里调用 beforeRouteEnter。
* 调用全局的 beforeResolve 守卫 (2.5+)。
* 导航被确认。
* 调用全局的 afterEach 钩子。
* 触发 DOM 更新。
* 用创建好的实例调用 beforeRouteEnter 守卫中传给 next 的回调函数。

### 父子组件的通信

### v-for 的key；vue diff算法
https://my.oschina.net/u/3060934/blog/3103711/print%E3%80%82

### vue编译，babel
https://mp.weixin.qq.com/s?__biz=Mzg2NTA4NTIwNA==&mid=2247485010&idx=1&sn=8a5a46a10f7ea706ef41592359a646a4&chksm=ce5e3429f929bd3f48fc6f6c85226aac672dd8236a203ec97977fbc0330a39c7f0883b634cc0&token=1424393752&lang=zh_CN#rd