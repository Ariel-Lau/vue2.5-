function Observer(data) {
    // 保存data对象
    this.data = data;
    // 开始对data的劫持(监视)
    this.walk(data);
}

Observer.prototype = {
    constructor: Observer,
    walk: function (data) {
        // 保存observer对象，this就是new创建的Observer实例对象
        var me = this;
        // 遍历data中所有属性
        Object.keys(data).forEach(function (key) {
            // 对指定的属性进行劫持
            // me.convert(key, data[key]);
            // 直接调用defineReactive()就行
            // 对指定的属性实现响应式的数据绑定
            me.defineReactive(me.data, key, data[key]);
        });
    },
    // convert: function(key, val) {
    //     // 对指定的属性实现响应式的数据绑定
    //     this.defineReactive(this.data, key, val);
    // },

    // 响应式属性、数据劫持
    defineReactive: function (data, key, val) {
        // 创建属性对应的dep对象  dep即dependency依赖的缩写
        var dep = new Dep();
        // 通过间接的递归调用实现对data中所有层次属性的数据劫持
        var childObj = observe(val);

        // 给data重新定义属性，为什么要重新定义？为了添加set/get方法
        Object.defineProperty(data, key, {
            enumerable: true, // 可枚举
            configurable: false, // 不能再define
            // get方法的作用：（1）返回值；（2）最重要的是建立dep与watcher之间的关系
            get: function () {
                // Dep.target即Watcher
                if (Dep.target) {
                    // 建立和watcher的关系
                    dep.depend();
                }
                // 获取值
                return val;
            },
            // 监视key属性的变化，目的是为了更新界面
            set: function (newVal) {
                if (newVal === val) {
                    return;
                }
                val = newVal;
                // 新的值是object的话，进行监听
                childObj = observe(newVal);
                // 通知订阅者 通知 所有 相关的订阅者即 所有 的watcher
                dep.notify();
            }
        });
    }
};

function observe(value, vm) {
    // 被观察的必须是一个对象
    if (!value || typeof value !== 'object') {
        return;
    }
    // 创建对应的Observer对象
    return new Observer(value);
}

var uid = 0;

/*
    Dep
        它的实例什么时候创建？
            初始化时给data的属性进行数据劫持时创建的
        个数？
            与data中的属性一一对应（包括所有层次的属性）
        Dep的结构？
            id: 标识(对data中的属性，包括所有层次中的属性进行唯一标识)
            如：
            data:{
                name: 'mm', // id 1
                like: { // id 2
                    a: 1, // id 3
                    b: 2 // id 4
                }
            }
            // 只要需要通过标识去取一个值的时候，可以用对象存，所以depIds用的是对象存储，而dep的subs没有用对象存，用的是数组，因为只需简单的遍历即可，当然subs用对象也行
            subs: [] n个相关的watcher的容器

    Watcher
        它的实例什么时候创建?
            初始化的编译/解析大括号/一般指令时创建
        个数？
            与模版中表达式（不包括事件指令）一一对应
        Watcher的结构？
            this.cb = cb; // 用于更新界面的回调
            this.vm = vm; // vm就是MVVM实例，相当于Vue实例
            this.expOrFn = expOrFn; // 对应的表达式
            // 只要需要通过标识去取一个值的时候，可以用对象存，所以depIds用的是对象存储，而dep的subs没有用对象存，用的是数组，因为只需简单的遍历即可，当然subs用对象也行
            this.depIds = {}; // 相关的n个dep的容器对象
            this.value = this.get(); // 当前表达式对应的value

Dep与Watcher直接的关系
    什么关系？
        多对多的关系
        data属性（如name） ——> Dep ——> n个Watcher（模版中有多个表达式使用了此属性）(属性在模版中多次被使用，如: <p>{{name}}</p>  <div>{{name}}</div> v-text="name"
        表达式——>Dep——>n个Watcher()
        a.b ——> W ——>n个Dep(多层表达式：a.b.c n=3)，如：<p>{{a.b}}</p> 一个表达式{{a.b}}即一个watcher对应n个dep：a一个dep，b一个dep
    如何建立的？
        vm.name = 'abc' ——>data中的name属性值变化——>name的set()调用——>dep——>相关的所有watcher
    ——>cb(回调函数)——>updater
        data中属性的get()中建立
    什么时候建立？
        初始化的解析模块中的表达式创建Watcher对象时
*/


function Dep() {
    this.id = uid++;
    // sub即订阅者，subscribe的缩写；subs多个订阅者，监听，订阅者里面放的内容是监听即watcher，也就是[]内放置的是watcher
    this.subs = [];
}

Dep.prototype = {
    // 添加watcher到dep中，相当于建立dep与watcher的关系，单向建立dep -> watcher的关系
    addSub: function (sub) {
        this.subs.push(sub);
    },
    // 真正建立dep与watcher之间的关系
    depend: function () {
        // Dep.target即Watcher，所以addDep()方法要到watcher.js中寻找
        Dep.target.addDep(this);
    },

    removeSub: function (sub) {
        var index = this.subs.indexOf(sub);
        if (index !== -1) {
            this.subs.splice(index, 1);
        }
    },

    notify: function () {
        // 遍历 所有 的watcher，通知watcher更新
        this.subs.forEach(function (sub) {
            // 每一个sub都是watcher，所以update方法是watcher的方法，可以到watcher.js文件中查找
            sub.update();
        });
    }
};

Dep.target = null;