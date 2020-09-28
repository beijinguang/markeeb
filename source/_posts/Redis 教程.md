---
title: Redis
categories: [Redis]
tags: [Redis]
date: 2020-07-15 11:11:07
description:
---
# Redis 教程

redis（remote dictionary server）



### redis数据类型

redis支持5种数据类型：string（字符串）、hash（哈希）、list（列表）、set（集合）、zset（有序集合）



## Redis原理、协议及应用

### Redis是如何运行的？

#### Redis基本原理

##### Redis简介

Redis 是一款基于 ANSI C 语言编写的，BSD 许可的，日志型 key-value 存储组件，它的所有数据结构都存在内存中，可以用作缓存、数据库和消息中间件。

Redis 是 Remote dictionary server 即远程字典服务的缩写，一个 Redis 实例可以有多个存储数据的字典，客户端可以通过 select 来选择字典即 DB 进行数据存储。

### 如何理解、选择并使用Redis的核心数据类型？

### Redis协议的请求和响应有哪些“套路”可循？

## Redis进阶

### Redis系统架构中各个处理模块是干什么的？

### Redis如何处理文件事件和时间事件？

### Redis读取请求数据后，如何进行协议解析和处理？

### 怎么认识和应用Redis内部数据结构？

### Redis是如何淘汰key的？

### Redis崩溃后，是如何进行数据恢复的？

### Redis是如何处理容易超时的系统调用的？

### 如何大幅成倍提升Redis处理性能？

## 分布式Redis实战

### Redis是如何进行主从复制的？

### 如何构建一个高性能、易扩展的Redis集群？

### 从容应对亿级QPS访问，Redis还缺少什么？

## 深入分布式缓存

### 面对海量数据，为什么无法设计出完美的分布式缓存体系？

### 如何设计足够可靠的分布式缓存体系，以满足中型移动互联网系统的需要？

### 一个典型的分布式缓存系统是什么样的？

## 应用场景案例解析

### 如何为秒杀系统设计缓存体系？

### 如何为海量计数场景设计缓存体系？

### 如何为设计feed场景设计缓存体系？