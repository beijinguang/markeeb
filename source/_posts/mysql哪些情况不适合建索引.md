---
title: mysql哪些情况不适合建索引
categories: [mysql]
tags: [MySQL, 数据库]
date: 2018-05-19 21:21:11
description:
---

下面整理几类不适合建立索引的典型场景。

<!-- more -->

### mysql哪些情况不适合建索引

1. 记录太少
2. 经常增删改的表
3. 数据重复且分布平均的表字段：如性别等状态值
