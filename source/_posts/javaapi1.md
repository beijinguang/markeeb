---
title: Java API 学习之ClassLoader
categories: [java]
tags: [java]
date: 2016-12-08 10:13:42
description:
---

### 基本信息
- 包：java.lang
- 父类：java.lang.Object
- 类属性：抽象类
- 定义语句：public abstract class ClassLoader extends Object

### 概念和用途
类加载器是负责加载类的对象。如果给定类的二进制名称，那么类加载器会试图查找或生成构成类定义的数据。一般策略是将名称转换
为某个文件名，然后从文件系统读取该名称的“类文件”。
每个 Class 对象都包含一个对定义它的 ClassLoader 的引用。每个Class有一个getClassLoader()
数组类的 Class 对象不是由类加载器创建的，而是由 Java 运行时根据需要自动创建。数组类的类加载器由 Class.getClassLoader() 
返回，该加载器与其元素类型的类加载器是相同的；如果该元素类型是基本类型，则该数组类没有类加载器。