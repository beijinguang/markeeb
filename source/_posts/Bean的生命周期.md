---
title: Bean的生命周期
categories: [spring]
tags: [spring]
date: 2020-01-17 11:11:07
description:
---

Bean的生命周期

1.调用Bean的构造方法创建Bean；

2.通过反射调用setter方法进行属性的依赖注入；

3.如果bean实现了BeanNameAware，则为bean设置名称；

4.如果bean实现了BeanFactoryAware，会把 BeanFactory 设置给 Bean；

5.如果bean实现了ApplicationContextAware，，会给 Bean 设置 ApplictionContext；

6.如果实现了BeanPostProcessor接口，则执行前置处理方法；

7.实现了InitializingBean接口的话，执行afterPropertiesSet方法

8.执行自定义的init方法；

9.执行BeanPostProcessor接口的后置处理方法；

