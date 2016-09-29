---
title: Node.js模块系统
categories: [node]
tags: [node]
date: 2016-08-16 17:23:32
---
为了让Node.js的文件可以相互调用，Node.js提供了一个简单的模块系统。
模块是Node.js 应用程序的基本组成部分，文件和模块是一一对应的。换言之，一个 Node.js 文件就是一个模块，这个文件可能
是JavaScript 代码、JSON 或者编译过的C/C++ 扩展。
<!-- more -->
### 创建模块
在 Node.js 中，创建一个模块非常简单，如下我们创建一个 'module1.js' 文件，代码如下:
```js
var hello = require('./hello')
hello.world();
```
以上实例中，代码 require('./hello') 引入了当前目录下的hello.js文件（./ 为当前目录，node.js默认后缀为js）。
Node.js 提供了exports 和 require 两个对象，其中 exports 是模块公开的接口，require 用于从外部获取一个模块的接口，即所
获取模块的 exports 对象。接下来我们就来创建hello.js文件，代码如下：
```js
exports.world = function() {
  console.log('Hello World');
}
```
在以上示例中，hello.js 通过 exports 对象把 world 作为模块的访问接口，在 main.js 中通过 require('./hello') 加载这个模
块，然后就可以直接访 问 hello.js 中 exports 对象的成员函数了。
有时候我们只是想把一个对象封装到模块中，格式如下：
**module.exports = function(){}**
```js
//hello.js 
function Hello() { 
	var name; 
	this.setName = function(thyName) { 
		name = thyName; 
	}; 
	this.sayHello = function() { 
		console.log('Hello ' + name); 
	}; 
}; 
module.exports = Hello;
```
这样就可以直接获得这个对象了：
```js
//module1.js 
var Hello = require('./hello'); 
hello = new Hello(); 
hello.setName('BYVoid'); 
hello.sayHello(); 
```
模块接口的唯一变化是使用 module.exports = Hello 代替了exports.world = function(){}。 在外部引用该模块时，其接口对象
就是要输出的 Hello 对象本身，而不是原先的 exports.