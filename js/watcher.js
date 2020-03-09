/*
    Watcher
        它的实例什么时候创建?
            初始化的编译/解析大括号/一般指令时创建
        个数？
            与模版中表达式（不包括事件指令）一一对应
        Watcher的结构？
            this.cb = cb; // 用于更新界面的回调
            this.vm = vm; // vm
            this.expOrFn = expOrFn; // 对应的表达式
            this.depIds = {depIds, dep}; // 相关的n个dep的容器对象，将dep保存到depsIds即保存到watcher
            this.value = this.get(); // 当前表达式对应的value
*/

function Watcher(vm, expOrFn, cb) {
    // this就是new创建的Watcher实例对象
    // 更新界面的回调
    this.cb = cb;
    this.vm = vm;
    // 表达式
    this.expOrFn = expOrFn;
    // 包含所有相关的dep的容器对象
    this.depIds = {};

    if (typeof expOrFn === 'function') {
        this.getter = expOrFn;
    } else {
        this.getter = this.parseGetter(expOrFn.trim());
    }

    // 得到表达式的初始值，并保存，便于后续和新值比较
    this.value = this.get();
}

Watcher.prototype = {
    constructor: Watcher,
    update: function () {
        this.run();
    },
    run: function () {
        var value = this.get();
        var oldVal = this.value;
        if (value !== oldVal) {
            this.value = value;
            // 调用回调函数更新界面，set()方法导致的调用，也就是页面代码中写this.name=xxx时会触发
            this.cb.call(this.vm, value, oldVal);
        }
    },
    addDep: function (dep) {
        // 1. 每次调用run()的时候会触发相应属性的getter
        // getter里面会触发dep.depend()，继而触发这里的addDep
        // 2. 假如相应属性的dep.id已经在当前watcher的depIds里，说明不是一个新的属性，仅仅是改变了其值而已
        // 则不需要将当前watcher添加到该属性的dep里
        // 3. 假如相应属性是新的属性，则将当前watcher添加到新属性的dep里
        // 如通过 vm.child = {name: 'a'} 改变了 child.name 的值，child.name 就是个新属性
        // 则需要将当前watcher(child.name)加入到新的 child.name 的dep里
        // 因为此时 child.name 是个新值，之前的 setter、dep 都已经失效，如果不把 watcher 加入到新的 child.name 的dep中
        // 通过 child.name = xxx 赋值的时候，对应的 watcher 就收不到通知，等于失效了
        // 4. 每个子属性的watcher在添加到子属性的dep的同时，也会添加到父属性的dep
        // 监听子属性的同时监听父属性的变更，这样，父属性改变时，子属性的watcher也能收到通知进行update
        // 这一步是在 this.get() --> this.getVMVal() 里面完成，forEach时会从父级开始取值，间接调用了它的getter
        // 触发了addDep(), 在整个forEach过程，当前wacher都会加入到每个父级过程属性的dep
        // 例如：当前watcher的是'child.child.name', 那么child, child.child, child.child.name这三个属性的dep都会加入当前watcher
        // =======================以上是源码就有的解释==========================

        // =======================以下是学习的解释==============================
        // 只要需要通过标识去取一个值的时候，可以用对象存，所以depIds用的是对象存储，而dep的subs没有用对象存，用的是数组，因为只需简单的遍历即可，当然subs用对象也行
        // 判断dep与watcher的关系是否已经建立，建立watcher和dep的关系，实现dep和watcher双向关系的建立，实现真正的建立关系
        if (!this.depIds.hasOwnProperty(dep.id)) {
            // this就是watcher，将watcher添加到dep中  用于更新
            dep.addSub(this);
            // 将dep添加到watcher中  用于防止重复建立关系
            this.depIds[dep.id] = dep;
        }
    },
    // 得到表达式的值，建立dep与watcher的关系
    get: function () {
        // 将当前的Watcher赋给Dep的target属性
        // 给dep指定当前的watcher，this就是watcher
        Dep.target = this;
        // var value = this.getter.call(this.vm, this.vm);
        // 获取表达式的值，内部调用get建立dep与watcher的关系
        var value = this.getVMVal();
        // 去除dep中指定的当前watcher，当dep和watcher的关系已经建立，就没有必要再将watcher放到dep中，所以要将Dep.target当前的watcher重置为null
        Dep.target = null;
        return value;
    },

    // 得到表达式对应的值
    getVMVal: function () {
        // 当前的watcher实例上没有exp而是this.expOrFn，看构造函数中的this.expOrFn = sexpOrFn；所以不是this.exp.split('.');这样会报错，因为this.exp为undefined
        var exp = this.expOrFn.split('.');
        // this.vm保存的就是mvvm对象，mvvm上的_data对象保存的是页面上的data: {name: 'mm'}，所以取this.vm._data的值，而不是this.vm.data，这样取值会报错
        var val = this.vm._data;
        exp.forEach(function (k) {
            val = val[k];
        });
        return val;
    },


    parseGetter: function (exp) {
        if(/[^\w.$]/.test(exp)) return;

        var exps = exp.split('.');

        return function (obj) {
            for (var i = 0, len = exps.length; i < len; i++) {
                if (!obj) return;
                obj = obj[exps[i]];
            }
            return obj;
        };
    }
};