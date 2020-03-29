## 类数组转成真数组
### 类数组：有length属性，可以通过下标取值，但是不具有数组类型的方法，如forEach()、slice()
* `Array.from(list)`;
* `Array.prototype.slice.call(list)`;
* `[].slice.call(list)`;
* 将类数组对象转换成真正的数组之后可以使用数组原型上的方法

## 获取节点类型(查阅MDN)
`Node.nodeType`: Docement\Element\Attr\Text

https://developer.mozilla.org/zh-CN/docs/Web/API/Node/nodeType

## 给对象添加属性（指定描述符）
* `Object.defineProperty(obj, propertyName, {})`
###### 属性描述符
**数据描述符**
  * configurable: 是否可以重新定义
  * enumerable：是否可以枚举
  * value：初始值
  * writable：是否可以修改属性值
**访问描述符**
  * get：回调函数，根据<font color="red">其它相关的属性</font>动态计算得到当前属性值。
  * set：回调函数，<font color="red">监视</font>当前属性值的变化，更新<font color="red">其它相关的属性</font>值。<font color="red">！！注意是监视不是设置。</font>

e.g:
```javascript
const obj = {
    firstName: 'A',
    lastName: 'B'
};
Object.defineProperty(obj, 'fullName', {
    get() {
        return this.firstName + '-' + this.lastName;
    },
    set(value) {
        const names = value.split('-');
        this.firstName = names[0];
        this.lastName = names[1];
    }
})
obj.firstName = 'Liu';
obj.lastName = 'Miao';
console.log(obj.fullName); // 'Liu-Miao'
```


## 得到对象自身可枚举属性组成的数组
`Object.keys(obj)`

## 判断prop是否是obj自身的属性
`obj.hasOwnProperty(prop)`

## 文档碎片（高效批量更新多个节点）(查阅MDN：Node)，可用于减少更新界面的次数
`DocumentFragment`
`document`：对应显示的页面，包含n个element，<font color="red">一旦更新document内部的某个元素，则界面更新</font>
`documentFragment`：内存中保存n个element的容器对象<font color="red">（不与界面关联）</font>，<font color="red">如果更新fragment中的某个element，界面不变</font>

```
    <ul id="fragment_test"> 
        <li>test1</li>
        <li>test2</li>
        <li>test3</li>
    </ul>
```

```javascript
    // 1.创建fragment
    const fragment = document.createDocumentFragment();
    // 2.取出ul中所有子节点取出保存到fragments
    let child;
    while(child=ul.firstChild) { // 一个节点只能有一个父节点
        fragment.appendChild(child); // 相当与先将child从ul中移除，添加为fragment的子节点
    }
    // 3.更新fragment中所有的li文本s
    // 将dom节点的伪数组转成真正的数组
    Array.prototype.slice.call(fragment.childNodes).forEach(node => {
        if (node.nodeType === 1) { // 元素节点的nodeType是1，即元素li
            node.textContent = 'changetext';
        }
    });
    // 4.将fragment插入uls
    // fragment也是节点类型
    // 为什么要用ul.appendChild()，由于fragment不与界面关联，如果更新fragment中的某个element，界面不变，所以需要通过给ul元素appendChild来更新界面。
    ul.appendChild(fragment);
```

## 判断一个对象是函数、数组、对象
* Object.prototype.toString.call(obj)
```javascript
    > Object.prototype.toString.call(() => {console.log(1);})
    '[object Function]'
    > Object.prototype.toString.call([1,2])
    '[object Array]'
    > Object.prototype.toString.call({11: 2})
    '[object Object]'

```