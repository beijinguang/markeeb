---
title: 创建自己maven archetype
categories: [maven]
tags: [maven]
date: 2016-10-11 12:43:48
description: 创建自己maven archetype
---
创建自己maven archetype

maven archetype  是一个原型构建框架，这样可以把一些重复性的配置代码放到archetype里，就不用每次都从头去搭建项目。

1.创建一个maven项目mvn-archetyp-demo，添加自己想要重复利用的元素，如一些配置，通用代码等

2.在工程下执行：
mvn-archetyp-demo> mvn clean
mvn-archetyp-demo> mvn archetype:create-from-project
mvn-archetyp-demo> cd target/generated-sources/archetype
mvn-archetyp-demo/target/generated-sources/archetype> mvn clean install

这样通过IDE就可以选择自己生成的archetype了。