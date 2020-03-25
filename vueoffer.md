## 说下你对mvvm的理解、阐述一下你所理解的MVVM响应式原理

vue是采用数据劫持(observer)配合发布者(dep)-订阅者（watcher）模式的方式，通过Object.defineProperty()来劫持、监视各个data属性的setter和getter，在数据更新的时候，发布消息给依赖收集器（Dep），然后Dep会通知订阅者（watcher），watcher会调用对应的回调函数去更新（updater）视图。

MVVM为绑定的入口，即new Vue()的入口，通过Observer、Compile、Watcher三者之间的相互配合，即Observer来劫持、监视data中的数据变化，Compile解析、编译模板，通过Watcher建立Observer和Compile直接的通信桥梁，达到：数据更新 => 视图更新 