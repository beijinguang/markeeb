---
title: Node.js 创建第一个应用
date: 2016-08-14 17:21:33
categories: [node]
tags: [node]
---
node第一个应用
<!-- more -->
## 步骤一、引入 required 模块
使用 require 指令来载入 http 模块，并将实例化的 HTTP 赋值给变量 http，实例如下:
```javascript
var http = require("http");
```
## 步骤二、创建服务器
使用 http.createServer() 方法创建服务器，并使用 listen 方法绑定 8888 端口。 函数通过 request, response 参数来接收和响应数据。
```javascript
var http = require("http");

http.createServer(function(request,response) {
    response.writeHead(200,{'Content-Type':'text/plain'});
    response.end('Hello World\n');
  
}).listen(8888);
console.log("Server running at http://localhost:8888/");
```
使用 node 命令执行以上的代码：
```
node server.js
```
## gif实例

![node1实例](node1.gif)