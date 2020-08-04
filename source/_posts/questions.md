---
title: 开发中遇到的异常
categories: [异常]
tags: [异常]
date: 2016-12-16 11:04:21
description: 开发中遇到的异常
---

1.异常中出现Mapped Statements collection does not contain value for
mybatis mapper.xml 和 实体Mapper (即Dao) 不对应 ，检查namespace是否对应

2.svnserve.conf:12: Option expected的问题解决方法
subversion读取配置文件svnserve.conf时，无法识别有前置空格的配置文件

3.Error assembling WAR:webxml attribute is required
原因：maven的web项目默认的webroot是在src\main\webapp。如果在此目录下找不到web.xml就抛出以上的异常。
