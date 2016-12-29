---
title: springbatch
categories: [spring]
tags: [spring batch]
date: 2016-12-27 14:29:23
description:
---

spring batch是用来处理大量数据操作的一个框架，主要用来读取大量数据，然后进行一定处理后的指定形式。

主要有以下7个部分组成

|名称|用途|
|:-|:-|
|JobReository|用来注册Job的容器|
|JobLauncher|用来启动Job的接口|
|Job|我们要实际执行的任务，包含一个或多个Step|
|Step|Step-步骤包含ItemReader,ItemProcessor和ItemWriter|
|ItemReader|用来读取数据的接口|
|ItemProcessor|用来处理数据的接口|
|ItemWriter|用来输出数据的接口|
