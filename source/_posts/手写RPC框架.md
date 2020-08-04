---
title: 手写RPC框架
categories: [RPC]
tags: [RPC]
date: 2020-06-30 16:04:07
description:
---

##  手写RPC框架

### RPC是什么？

RPC(Remote Procedure Call Protocol)，远程过程调用

<!-- more -->

PRC调用过程：

1. 客户端调用客户端stub（client stub）。这个调用是在本地，并将调用参数push到[栈](https://zh.wikipedia.org/wiki/栈)（stack）中。
2. 客户端stub（client stub）将这些参数包装，并通过系统调用发送到服务端机器。打包的过程叫 [marshalling](https://zh.wikipedia.org/wiki/Marshalling_(计算机科学))。（常见方式：[XML](https://zh.wikipedia.org/wiki/XML)、[JSON](https://zh.wikipedia.org/wiki/JSON)、二进制编码）
3. 客户端本地操作系统发送信息至服务器。（可通过自定义[TCP协议](https://zh.wikipedia.org/wiki/传输控制协议)或[HTTP](https://zh.wikipedia.org/wiki/HTTP)传输）
4. 服务器系统将信息传送至服务端stub（server stub）。
5. 服务端stub（server stub）解析信息。该过程叫 [unmarshalling](https://zh.wikipedia.org/wiki/Unmarshalling_(计算机科学))。
6. 服务端stub（server stub）调用程序，并通过类似的方式返回给客户端。