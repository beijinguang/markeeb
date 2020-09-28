---
title: Appollo配置中心原理
categories: [Appollo]
tags: [Appollo]
date: 2019-08-17 11:11:07
description:
---

## Appollo配置中心原理



总体设计图：

![image-20200825134410863](https://gitee.com/idea4j/imagerep/raw/master/images/image-20200825134410863.png)

Apollo的总体设计，自下而上看：

- Config Service 提供配置的读取、推送等功能，服务对象是Apollo客户端
- Admin Service 提供配置的修改、发布等功能，服务对象是Apollo Portal（管理界面）
- Config Service 和 Admin Service 都是多实例、无状态部署，所以需要将自己注册到 Eureka 中并保持心跳
- 在Eureka之上架了一层 Meta Server 用于封装 Eureka 的服务发现接口
- Client 通过域名访问 Meta Server 获取 Config Service 服务列表（IP+Port），而后直接通过 IP+Port 访问服务，同时在 Client 侧会做 load balance、错误重试
- Portal 通过域名访问 Meta Server 获取 Admin Service 服务列表（IP+Port），而后直接通过 IP+Port 访问服务，同时在 Portal 侧会做 load balance、错误重试
- 为了简化部署，实际上会把 Config Service、Eureka 和 Meta Server 三个逻辑角色部署在同一个JVM进程中





#### 四个核心模块及其主要功能

1. **ConfigService**

2. - 提供配置获取接口
   - 提供配置推送接口
   - 服务于Apollo客户端

3. **AdminService**

4. - 提供配置管理接口
   - 提供配置修改发布接口
   - 服务于管理界面Portal

5. **Client**

6. - 为应用获取配置，支持实时更新
   - 通过MetaServer获取ConfigService的服务列表
   - 使用客户端软负载SLB方式调用ConfigService

7. **Portal**

8. - 配置管理界面
   - 通过MetaServer获取AdminService的服务列表
   - 使用客户端软负载SLB方式调用AdminService

#### 三个辅助服务发现模块

1. **Eureka**

2. - 用于服务发现和注册
   - Config/AdminService注册实例并定期报心跳
   - 和ConfigService住在一起部署

3. **MetaServer**

4. - Portal通过域名访问MetaServer获取AdminService的地址列表
   - Client通过域名访问MetaServer获取ConfigService的地址列表
   - 相当于一个Eureka Proxy
   - 逻辑角色，和ConfigService住在一起部署

5. **NginxLB**

6. - 和域名系统配合，协助Portal访问MetaServer获取AdminService地址列表
   - 和域名系统配合，协助Client访问MetaServer获取ConfigService地址列表
   - 和域名系统配合，协助用户访问Portal进行配置管理



## Apollo客户端设计

![image-20200825140157084](https://gitee.com/idea4j/imagerep/raw/master/images/image-20200825140157084.png)

上图简要描述了Apollo客户端的实现原理：

1. 客户端和服务端保持了一个长连接，从而能第一时间获得配置更新的推送。（通过Http Long Polling实现）
2. 客户端还会定时从Apollo配置中心服务端拉取应用的最新配置。

- 这是一个fallback机制，为了防止推送机制失效导致配置不更新
- 客户端定时拉取会上报本地版本，所以一般情况下，对于定时拉取的操作，服务端都会返回304 - Not Modified
- 定时频率默认为每5分钟拉取一次，客户端也可以通过在运行时指定System Property: apollo.refreshInterval来覆盖，单位为分钟。

1. 客户端从Apollo配置中心服务端获取到应用的最新配置后，会保存在内存中
2. 客户端会把从服务端获取到的配置在本地文件系统缓存一份

- 在遇到服务不可用，或网络不通的时候，依然能从本地恢复配置

1. 应用程序从Apollo客户端获取最新的配置、订阅配置更新通知



## 配置更新推送实现

### 配置发送后的实时推送设计

![image-20200825141138936](https://gitee.com/idea4j/imagerep/raw/master/images/image-20200825141138936.png)

上图简要描述了配置发布的大致过程：

1. 用户在Portal操作配置发布
2. Portal调用Admin Service的接口操作发布
3. Admin Service发布配置后，发送ReleaseMessage给各个Config Service
4. Config Service收到ReleaseMessage后，通知对应的客户端

之前提到了Apollo客户端和服务端保持了一个长连接，从而能第一时间获得配置更新的推送。长连接实际上是通过Http Long Polling实现的，具体而言：

- 客户端发起一个Http请求到服务端
- 服务端会保持住这个连接60秒
- 如果在60秒内有客户端关心的配置变化，被保持住的客户端请求会立即返回，并告知客户端有配置变化的namespace信息，客户端会据此拉取对应namespace的最新配置
- 如果在60秒内没有客户端关心的配置变化，那么会返回Http状态码304给客户端
- 客户端在收到服务端请求后会立即重新发起连接，回到第一步

考虑到会有数万客户端向服务端发起长连，在服务端使用了async servlet(Spring DeferredResult)来服务Http Long Polling请求。

