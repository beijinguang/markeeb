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
|可串行化 Serializable |X|X|X|

大多数的数据库系统的默认事务隔离级别都是：Read committed
而MySQL的默认事务隔离级别是：Repeatable Read

### READ UNCOMMITTED(未提交读)
这个级别事务中的修改，即使没有提交，对其他事务也都是可见的，事务可以读取未提交的数据，
这也被称为**脏读**,这个级别会导致许多问题，从性能上来说，READ UNCOMMITTED 级别不会比其他级别好太多，但却缺乏其他级别
的很多优点，除非真的非常有必要，在实际中一般很少使用。

### READ COMMITTED(提交读)
大多数数据库默认隔离级别都是READ COMMITTED（MySQL不是）。一个事务开始时，只能“看见”已经提交的事务所做的修改。就是
说，一个事务从开始到提交之前，所做的任何事，对其他事务都是不可见的。这个级别有时也叫*不可重复读*，因为两次查询执行的结
果可能是不一致的。

### REPEATABLE READ(可重复读)
可重复读解决了脏读的问题。它保证了同一个事务中多次读取同样的记录的结果是一致的。但是理论上却无法解决幻读的问题。所谓
**幻读**，指的是当某个事物在读取某个范围的记录时，另外一个事务又在该范围内插入了新的记录，当之前的事务再次读取该范围的
记录时，会产生幻行。

### SERIALIZABLE(可串行化)
通过事务强制串行执行，避免幻读问题。会在读取的每一行数据上加锁，可能导致大量的超时和锁争用的问题。只有在非常需要保证
数据一致性而且可以接受没有并发的情况下，才考虑使用。



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