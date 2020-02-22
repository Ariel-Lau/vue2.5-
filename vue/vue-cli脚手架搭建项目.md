# vue-cli

github：https://github.com/vuejs/vue-cli

# 在文件夹下加这个的话  .gitkeep 那么空文件夹也会跟踪


# .babelrc
1. es6转es5
2. jss转js
3. rc runtime control 运行时控制


# 组件：就是一个功能模块，局部功能模块，包含完整的html/css/js
数据在哪个组件，更新数据的行为（方法）就应该定义在哪个组件

data在组件里必须写成函数的形式

```
// 模版三要素
<template></template>

<script>
    export default  { // 配置对象，与vue一致
        // 组件里data必须写成函数，在模版里可以写成对象的形式
        data () {
            return {

            }
        }
    }
</script>

<style></style>
```

# esLint、jsLint、jsHint

# 项目打包与发布
打包生成dist文件：npm run build

发布
使用静态服务器工具包
npm install -g server
server dist
访问：http://localhost:5000

使用动态web服务器tomcat

修改配置：
webpack.prod.conf.js

output: {
    publicPath: '/xxx/' // 打包文件夹的名称
}

重新打包：npm run build
修改dist文件下为项目名称
将xxx拷贝到运行的tomcat的webapps目录下
访问：http://localhost:8080/xxx

# 对象写法新学习
```
let name = 'mm';
let sex = 'girl';
let obj = {name, sex}; 
console.log(obj); // {name: mm, sex: girl}
```

# 父组件可以传给自组件Function
在父组件中定义的方法，可以通过props传入子组件，然后在子组件中可以直接调用

APP ——>LIST ——> ITEM逐层传递
APP
![](/imgs/4.png)
![](/imgs/5.png)

LIST
![](/imgs/1.png)
![](/imgs/6.png)

ITEM
或者结构this直接调用
![](/imgs/2.png)
![](/imgs/3.png)


# hmr热膜区块（热膜替换）可以把状态都保留下来

# 鼠标事件 mousenter mouseleave mouseover mouseout的区别

# vue绑定事件监听的方式
(1) @addTodo="addTodo"
(2) $on()
![](/imgs/7.png)
![](/imgs/8.png)

parent ——> child1 ——>child2
可以通过props传递Function类型的值将函数从parent传到child2


# 订阅与发布

绑定事件监听 ——> 订阅消息
触发事件 ——> 发布消息

发布和订阅对两个组件通信没有层级要求，如父组件到子组件、兄弟组件、父组件到子孙组件，任何两个组件之间的通信

```
import Pubsub from 'pubsub-js'

mounted() {
    // 注意回调函数要用箭头函数，否则this绑定的是Pubsub，会报错
    // 或者 let that = this;的方式
    Pubsub.subscribe('deleteTodo', (msg, index) => {
        this.deleteTodo(index);
    })
}
```

# 组件之间的通信slot——>组件之间的标签通信

# 工具包
![](/imgs/9.png)

# vue ajax请求
vue-resource vue1.x
axios  vue2.x

```
import vueResource from 'vue-resource'

// 声明插件
// 内部会给vm对象和组件对象添加一个属性：$http，包括get() post()
Vue.use(vueResource)
```

# 组件别名
![](/imgs/10.png)

# map返回一个对象需要用()包住
![](/imgs/11.png)

# vue组件库mint-ui()移动端  Elements(PC)

# vue-router
1）VueRouter(): 用于创建路由器的构建函数
```
new VueRouter({
    // 多个配置项
})
```

2）路由配置
```
routes: [
    {
        // 一般路由
        path: '/about',
        component: About
    },
    {
        // 自动跳转路由
        // 默认路由
        path: '/',
        redirect: '/about'
    },
    {
        // 一般路由
        path: '/home',
        component: home,
        // 嵌套路由/子路由
        children: [
            {
                // path: '/news', // path最左侧的/永远代表根路由，写法不对
                path: '/home/news',
                component: News
            },
            {
                path: 'message', // 不写/直接这样写也可以，简化写法
                component: Message
            },
            // home下面对应的默认路由
            {
                path: '',
                redirect: '/home/news'
            }
        ]
    }
]
```

3）注册路由器
import router from './router'
new Vue({
    router
})

4) 使用路由组件标签
![](/imgs/12.png)

# 缓存路由组件

```
<keep-alive>
    <router-view></router-view>
</keep-alive>
```

# 向路由组件传递数据
1）
```
routes: [
    {
        // 一般路由
        path: '/home',
        component: home,
        // 嵌套路由/子路由
        children: [
            {
                path: 'message', // 不写/直接这样写也可以，简化写法
                component: Message,
                children: [
                    // params传参数，取参数，注意是$route不是$router: this.$route.params.id
                    path: '/home/message/detail/:id',
                    component: Messagedetail
                ]
            }
        ]
    }
]

<router-link :to="`/home/message/detail/${message.id}`"></router-link>
```

2） query传参数
<router-link :to="`/home/message/detail?id=${message.id}`"></router-link>

### 当仅改变路由参数时，界面如果要变化可以监视$route
![](/imgs/13.png)

3） <router-view></router-view> 传递props 携带参数
```
<router-view :msg="msg"></router-view>
```

# 编程式（即写js代码）路由导航

操作路由常用的三种方法：
push()
replace()
back()

```
// 当前路由栈再push一个路由，浏览器导航栏回退时，是栈.pop()即回到的是push之前的路由，如push之前的路由栈最上面是‘/home’——>'/home/message'——>‘/home/detail’，回退直接回退到'/home/message'
this.$router.push(`/home/message/detail?id=${id}) 

 // 替换掉当前路由，浏览器导航栏回退时直接回到上一个页面的路由（注意不是替换之前的路由，是替换之前的路由的前一个路由），如‘/home’——>'/home/message'——>‘/home/detail’，回退直接回退到'/home'，这个'/home/message'路由相当于在栈中被替换掉了
this.$router.replace(`/home/message/detail?id=${id})
```

```
$router.back()
```

# 注意：`$route`代表当前的路由，`$router`代表路由器