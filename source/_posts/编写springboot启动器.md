---
title: springboot启动器
categories: [springboot]
tags: [springboot]
date: 2020-06-28 11:09:07
description:
---
<!-- more -->
## 编写springboot启动器（starter）



### 命名规则

- 官方 spring-boot-starter-模块名
- 非官方（如我们自己编写的） 模块名-spring-boot-starter



### 模块结构

- Xxx-spring-boot-starter

  引如自动装配模块，一般是个空工程

- Xxx-spring-boot-autoconfigure

  核心代码中的类文件：
  1、XxxAutoConfiguration 自动配置类
  2、XxxProperties 属性文件加载类，通过@EnableConfigurationProperties({XxxProperties.class})注入到spring容器中，使得在XxxAutoConfiguration中可以直接注入使用配置属性



```
@Configuration：定义配置类

@EnableConfigurationProperties：属性类

@AutoConfigureAfter: 自动配置应在XXX的自动配置类之后应用。

@AutoConfigureBefore: 自动配置应在XXX的自动配置类之前应用

@AutoConfigureOrder：定义配置类执行的顺序

@ConditionalOnBean：当容器里有指定的Bean 时才生成

@ConditionalOnMissingBean：当容器里没有指定Bean 时才生成

@ConditionalOnClass：当类路径下有指定的类时才生成

@ConditionalOnMissingClass：当类路径下没有指定的类时才生成

@ConditionalOnExpression：基于SpEL 表达式作为判断条件。

@ConditionalOnJava：基于JVM 版本作为判断条件。

@ConditionalOnJndi：在JNDI存在的条件下查找指定的位置。

@ConditionalOnProperty：指定的属性是否有指定的值。

@ConditionalOnResource：类路径是否有指定的值。

@ConditionalOnSingleCandidate：当指定Bean 在容器中只有一个，或者虽然有多个但是指定首选的Bean。

@ConditionalOnWebApplication：当前项目是Web 项目的条件下。

@ConditionalOnNotWebApplication：当前项目不是Web 项目的条件下。

```

### spring.factories配置

在Xxx-spring-boot-autoconfigure模块下src/main/resources新建文件夹META-INF，然后新建一个spring.factories文件

```properties
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
com.xxx.xxx.XxxAutoConfiguration
```

### 为ConfigurationProperties类生成元信息.

在我们的autoconfiguration的模块中添加如下jar包依赖

```xml
<dependency>
   <groupId>org.springframework.boot</groupId>
   <artifactId>spring-boot-configuration-processor</artifactId>
   <optional>true</optional>
</dependency>
```


