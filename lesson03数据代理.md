## 数据代理
1）数据代理：通过一个对象代理另一个对象中属性的操作（读/写）
2）vue数据代理：通过vm对象来代理data对象中所有属性的操作
3）好处：更方便的操作data中的数据
4）基本实现流程：
a 通过Object.defineProperty()给vm添加与data对象的属性对应的属性描述符
b 所有添加的属性都包含getter/setter
c getter/setter内部去操作data中对象的属性数据


```javascript
// 实现指定属性代理的方法（核心）
_proxy: function (key) {
    // 保存vm
    var me = this;
    // 给vm添加指定属性名的属性（使用的属性描述符）
    Object.defineProperty(me, key, {
        // 不能重新定义
        configurable: false, 
        // 可以枚举遍历
        enumerable: true,
        // 当通过vm.xxx读取属性值时调用，从data中获取对应的属性值返回     代理读操作
        get: fucntion proxyGetter() {
            return me._data[key];
        },
        // 当通过vm.xxx = value时，value被保存到data中对应的属性上        代理写操作
        set: function proxySetter(newVal) {
            me._data[key] = newVal;
        }
    })
}
```

## vue中`数据代理`和`数据绑定`都是基于`Object.defineProperty()`方法实现的。

## vue支持到最低的IE版本是多少：
由于IE8不支持`Object.defineProperty()`这个语法，所以vue不支持IE8，只支持到IE9及以上。

## vue3.0为什么用Proxy不用Object.defineProperty()?
https://mp.weixin.qq.com/s?__biz=Mzg2NTA4NTIwNA==&mid=2247485104&idx=1&sn=648f1850fb59f04c6ca52cdd794013b5&chksm=ce5e34cbf929bddd4325de7f78dc4ad5822cddff69c999d1225f860e917dfd3d6eea43527c56&token=1424393752&lang=zh_CN#rd