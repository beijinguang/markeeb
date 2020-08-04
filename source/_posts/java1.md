---
title: pacakge-info.java
categories: [java]
tags: [java]
date: 2017-01-06 16:34:00
description: 包注释
---
### pacakge-info.java介绍
pacakge-info.java是一个Java文件，可以添加到任何的Java源码包中。pacakge-info.java的目标是提供一个包级的文档说明或者是包级的注释。

pacakge-info.java文件中，唯一要求包含的内容是包的声明语句，比如：

package edu.jiangxin.tools;
包文档
在Java 5之前，包级的文档是package.html，是通过JavaDoc生成的。而在Java 5以上版本，包的描述以及相关的文档都可以写入pacakge-info.java文件，它也用于JavaDoc的生成。比如：
```java
    /**
     * 超卡-app接口控制器包
     */
    package com.sc.controller;
```

### 生成javadoc
IntelliJ IDEA 生成javadoc时，在＂Tools->Gerenate JavaDoc"面版的 

＂Other command line arguments:"栏里输入＂-encoding utf-8 -charset utf-8＂, 

就是以utf-8编码读取文件和生成javadoc
