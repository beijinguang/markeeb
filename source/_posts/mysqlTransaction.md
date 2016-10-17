---
title: 更改MySQL的默认事务隔离级别
categories: [mysql]
tags: [mysql,Transaction]
date: 2016-10-13 13:19:03
description: 事务隔离级别
---

## MySQL的事务隔离级别
|隔离级别|脏读|不可重复读|幻读|
|:-|:-|:-|:-|
|读未提交 Read uncommitted|O|O|O|
|读已提交 Read committed|X|O|O|
|可重复读 Repeatableread|X|X|O|
|可串行化 |X|X|X|

大多数的数据库系统的默认事务隔离级别都是：Read committed
而MySQL的默认事务隔离级别是：Repeatable Read

## 查询
SELECT @@global.tx_isolation; 
SELECT @@session.tx_isolation; 
SELECT @@tx_isolation;// 缺省是session

## 修改
用户可以用SET TRANSACTION语句改变单个会话或者所有新进连接的隔离级别。它的语法如下：
*SET [SESSION | GLOBAL] TRANSACTION ISOLATION LEVEL {READ UNCOMMITTED | READ COMMITTED | REPEATABLE READ | SERIALIZABLE}*
例如：
```sql
SET GLOBAL TRANSACTION ISOLATION LEVEL READ COMMITTED;
```
```sql
set tx_isolation='read-committed';
```

*注意*：默认的行为（不带session和global）是为下一个（未开始）事务设置隔离级别。如果你使用GLOBAL关键字，语句在全局
对从那点开始创建的所有新连接（除了不存在的连接）设置默认事务级别。你需要SUPER权限来做这个。使用SESSION 关键字为
将来在当前连接上执行的事务设置默认事务级别。 任何客户端都能自由改变会话隔离级别（甚至在事务的中间），或者为下一
个事务设置隔离级别。