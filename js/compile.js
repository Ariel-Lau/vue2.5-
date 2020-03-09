// 模板编译、解析
function Compile(el, vm) {
    // 保存vm到compile对象，this就是new创建的Compile实例对象
    this.$vm = vm;
    // 将el对应的元素对象保存到compile对象中
    this.$el = this.isElementNode(el) ? el : document.querySelector(el);
    // 如果有el元素，执行模板编译的主要三步
    if (this.$el) {
        // 1.取出el元素中所有子节点保存到一个fragment（文档碎片）对象中
        this.$fragment = this.node2Fragment(this.$el);
        // 2.编译fragment中所有层次子节点
        this.init();
        // 3.将编译好的fragment添加到页面的el元素中
        this.$el.appendChild(this.$fragment);
    }
}

Compile.prototype = {
    constructor: Compile,
    node2Fragment: function (el) {
        // 创建空的fragment
        var fragment = document.createDocumentFragment(),
            child;

        // 将原生节点拷贝到fragment
        // 将el中所有子节点转移到fragment
        // while(child = el.firstChild)相当于 child = el.firstChild; while(child);先将el的附一个节点赋给child，如果el有firstChild表示el内部还有元素节点，需要全部放到fragment中
        // 注意这种写法不是child === el.firstChild这种判断，而是=先赋值，然后对赋值后的child进行true/false判断，循环
        while (child = el.firstChild) {
            fragment.appendChild(child);
        }
        // 返回fragment
        return fragment;
    },

    init: function () {
        // 编译指定元素（所有层次的子节点）
        this.compileElement(this.$fragment);
    },

    // 编译所有层次的节点
    compileElement: function (el) {
        // 取出最外层所有子节点
        var childNodes = el.childNodes,
        // 保存compile对象
            me = this;
        // 遍历所有子节点（text/element）
        // [].slice().call(childNodes)将类数组对象childNodes转成真正的数组，然后调用数组的forEach方法进行遍历
        [].slice.call(childNodes).forEach(function (node) {
            // 得到节点的文本内容
            var text = node.textContent;
            // 创建正则对象（匹配大括号表达式）
            // .表示除换行符（\n）以外的任意字符，*表示0~多次
            var reg = /\{\{(.*)\}\}/; // {{name}}
            // 判断节点是否是一个元素节点
            if (me.isElementNode(node)) {
                // 编译它（解析指令）
                me.compile(node);
            // 判断节点是否是大括号格式的文本节点
            } else if (me.isTextNode(node) && reg.test(text)) {
                // 编译大括号表达式的文本节点
                me.compileText(node, RegExp.$1.trim());
            }
            // 如果当前节点还有子节点，通过递归调用实现所有层次节点的编译
            if (node.childNodes && node.childNodes.length) {
                me.compileElement(node);
            }
        });
    },

    // 编译元素节点
    compile: function (node) {
        // 得到标签的所有属性
        var nodeAttrs = node.attributes,
            me = this;
        // 遍历所有属性
        // [].slice().call(nodeAttrs)将类数组对象nodeAttrs转成真正的数组，然后调用数组的forEach方法进行遍历
        [].slice.call(nodeAttrs).forEach(function (attr) {
            // 得到属性名，如：v-on:click
            var attrName = attr.name;
            // 由于本demo中元素的普通属性节点不需要处理，故可以不写else
            // 判断是否是指令属性
            if (me.isDirective(attrName)) {
                // 得到属性值——表达式：show/getLists等
                var exp = attr.value;
                // 从属性名中得到指令名：on:click，'v-on'所以substring(2)从v-之后开始截取
                var dir = attrName.substring(2);
                // 判断是否是事件指令
                if (me.isEventDirective(dir)) {
                    // 解析处理事件指令
                    compileUtil.eventHandler(node, me.$vm, exp, dir);
                    // 普通指令
                } else {
                    // 编译指令属性
                    compileUtil[dir] && compileUtil[dir](node, me.$vm, exp);
                }
                // 移除指令属性，为什么要移除这个指令属性？便于下次进入的时候是个干净的属性？
                node.removeAttribute(attrName);
            }
        });
    },

    compileText: function (node, exp) {
        compileUtil.text(node, this.$vm, exp);
    },

    // 判断是否是指令属性，指令属性都是以v-开头的
    isDirective: function (attr) {
        return attr.indexOf('v-') === 0;
    },

    // 判断是否是事件指令，事件指令是有on的
    isEventDirective: function (dir) {
        // 传入的dir是截取的v-之后的内容，所以如果on的index是0的话就可以判断是事件指令
        return dir.indexOf('on') === 0;
    },

    isElementNode: function (node) {
        return node.nodeType === 1;
    },

    isTextNode: function (node) {
        return node.nodeType === 3;
    }
};

// 指令处理集合
// 包含多个解析指令的方法的工具对象
var compileUtil = {
    // 解析v-text/{{}}
    text: function (node, vm, exp) {
        this.bind(node, vm, exp, 'text');
    },
    // 解析v-html
    html: function (node, vm, exp) {
        this.bind(node, vm, exp, 'html');
    },
    // 解析v-modal，双向绑定的
    // 双向绑定的实现：model-view ——> 给元素添加input事件监听 ——> view-model（触发数据set，set的同时会触发页面的更新，即mode-view）
    model: function (node, vm, exp) {
        // 实现数据的初始化显示和创建对应的watcher
        this.bind(node, vm, exp, 'model');

        var me = this,
        // 得到表达式的值，旧值
        val = this._getVMVal(vm, exp);
        // 给节点绑定input事件监听（输入改变时）
        node.addEventListener('input', function (e) {
            // 得到输入的最新值
            var newValue = e.target.value;
            // 如果没有变化，直接结束
            if (val === newValue) {
                return;
            }

            // 将最新的value保存给表达式所对应的属性
            me._setVMVal(vm, exp, newValue);
            // 保存最新的值
            val = newValue;
        });
    },
    // 解析v-class 本质vue没有该语法
    class: function (node, vm, exp) {
        this.bind(node, vm, exp, 'class');
    },

    bind: function (node, vm, exp, dir) {
        // 得到更新节点的函数
        var updaterFn = updater [dir + 'Updater'];
        // 调用函数更新节点，this._getVMVal(vm, exp)获取到需要更新的值
        updaterFn && updaterFn(node, this._getVMVal(vm, exp));
        // 为表达式创建一个对应的watcher，实现节点的更新显示
        // 当表达式对应的一个属性值变化时回调
        new Watcher(vm, exp, function (value, oldValue) {
            // 更新界面中的指定节点
            updaterFn && updaterFn(node, value, oldValue);
        });
    },

    // 事件处理
    eventHandler: function (node, vm, exp, dir) {
        // 得到事件类型/名：click
        var eventType = dir.split(':')[1],
            // 从methods中得到表达式所对应的函数（事件回调函数）
            fn = vm.$options.methods && vm.$options.methods[exp];
        // 如果都存在
        if (eventType && fn) {
            // 给节点绑定指定事件名和回调函数（强制绑定this为vm）的DOM事件监听
            node.addEventListener(eventType, fn.bind(vm), false);
        }
    },

    // 从vm得到表达式对应的值
    _getVMVal: function (vm, exp) {
        var val = vm;
        exp = exp.split('.');
        exp.forEach(function (k) {
            val = val[k];
        });
        return val;
    },

    _setVMVal: function (vm, exp, value) {
        var val = vm;
        exp = exp.split('.');
        exp.forEach(function (k, i) {
            // 非最后一个key，更新val的值
            if (i < exp.length - 1) {
                val = val[k];
            } else {
                val[k] = value;
            }
        });
    }
};

// 包含多个更新节点的方法的工具对象
var updater = {
    // 更新节点的textContent属性值
    textUpdater: function (node, value) {
        node.textContent = typeof value === 'undefined' ? '' : value;
    },
    // 更新节点的innerHTML属性值
    htmlUpdater: function (node, value) {
        node.innerHTML = typeof value === 'undefined' ? '' : value;
    },
    // 更新节点的className属性值
    classUpdater: function (node, value, oldValue) {
        // 静态class属性的值
        var className = node.className;
        className = className.replace(oldValue, '').replace(/\s$/, '');

        var space = className && String(value) ? ' ' : '';
        // 上面那行代码可以不要，下面这行则可简单写成如下代码：className之间会有一个空格
        // node.className = className + (className ? ' ': '') + value;
        // 将静态class属性值与动态class值进行合并后设置为新的className属性值
        node.className = className + space + value;
    },
    // 更新节点的value属性值
    modelUpdater: function (node, value, oldValue) {
        node.value = typeof value === 'undefined' ? '' : value;
    }
};