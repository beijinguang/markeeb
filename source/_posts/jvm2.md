---
title: 堆分配参数
categories: [jvm]
tags: [jvm]
date: 2016-12-19 15:42:09
description: 与java程序堆内存相关的jvm参数
---

- -Xms:设置java应用程序启动时的初始堆大小。
- -Xmx:设置java应用程序能获得的最大堆大小。
- -Xss:设置java线程栈大小。
- -XX:MinHeapFreeRatio:设置堆空间最小空闲比例。JVM在堆空闲内存小于此值时会扩展空间。
- -XX:MaxHeapFreeRatio:设置堆空间最大空闲比例。JVM在堆空闲内存大于此值时会压缩空间。。
- -XX:NewSize:设置新生代大小。
- -XX:NewRatio:设置新生代和老年代的比例，它等于老年代/新生代大小。
- -XX:SurviorRatio:新生代中eden区与survivior区的比例。
- -XX:MaxPermSize:设置最大持久区堆大小。
- -XX:PermSize:设置永久区的初始值。
- -XX:TargetSurvivorRatio:设置survivior区的可使用率。当survivior区的空间使用率达到这个值是，会将对象送到老年代。


