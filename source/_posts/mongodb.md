---
title: mongodb
categories: [mongodb]
tags: [mongodb]
date: 2016-10-09 16:28:41
description: MongoDB 积累
---

<!-- more -->
将MongoDB服务器设置成Windows启动服务（win10）
mongod.exe --logpath "D:\data\dbConf\mongodb.log" --logappend --dbpath "D:\data\db" --serviceName "MongoDB" 
--serviceDisplayName "MongoDB" --install

|SQL术语/概念|MongoDB术语/概念|解释说明|
|:----:|:----:|:---:|
|database|	database|	数据库|
|table	|collection	|数据库表/集合|
|row	|document	|数据记录行/文档|
|column|	field	|数据字段/域|
|index|	index	|索引|
|table |joins	| 	表连接,MongoDB不支持|
|primary key|	primary key	|主键,MongoDB自动将_id字段设置为主键|
