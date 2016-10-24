---
title: Maven 打包实现环境配置分离
categories: [maven]
tags: [maven]
date: 2016-10-21 10:16:09
description: 使用maven实现环境配置分离
---

主要是通过打包时传递不同的参数来实现不同的环境产生不同的配置文件（如数据库连接等），从而实现同一版本代码不同部署环境。

废话不多说，直接上干货，进行以下步骤就可以改造你的工程了

### 先修改pom.xml
build下配置
```xml
<resources>
    <resource>
        <directory>${basedir}/src/main/resources</directory>
        <includes>
            <include>**/*</include>
        </includes>
    </resource>
    <!--设置自动替换-->
    <resource>
        <directory>${basedir}/src/main/resources</directory>
        <includes>
            <include>conf/config.properties</include>
        </includes>
        <!--也可以用排除标签-->
        <!--<excludes></excludes>-->
        <!--开启过滤-->
        <filtering>true</filtering>
    </resource>
</resources>
   ```
profiles配置
```xml
<profiles>
   <profile>
       <id>product</id>
       <build>
           <filters>
               <filter>${basedir}/src/main/resources/environments/config-product.properties</filter>
           </filters>
       </build>
   </profile>
   <profile>
       <id>test</id>
       <build>
           <filters>
               <filter>${basedir}/src/main/resources/environments/config-test.properties</filter>
           </filters>
       </build>
   </profile>
   <profile>
       <id>dev</id>
       <activation>
           <activeByDefault>true</activeByDefault>
       </activation>
       <build>
           <filters>
               <filter>${basedir}/src/main/resources/environments/config-dev.properties</filter>
           </filters>
       </build>
   </profile>
</profiles>
```

### 修改配置文件config.properties
```properties
jdbc.driver=${db.driver}
jdbc.url=${db.url}
jdbc.username=${db.username}
jdbc.password=${db.password}
```
添加特定环境的配置文件
开发环境config-dev.properties
```properties
db.driver=com.mysql.jdbc.Driver
db.url=jdbc:mysql://127.0.0.1:3306/blog?useUnicode=true&amp;characterEncoding=utf-8
db.username=root
db.password=root
```
测试环境config-test.properties
```properties
db.driver=com.mysql.jdbc.Driver
db.url=jdbc:mysql://127.0.0.1:3306/blog?useUnicode=true&amp;characterEncoding=utf-8
db.username=root
db.password=root
```

其他环境的文件（略）
*<font color="red">注意</font>*：
- 配置文件名称与pom.xml中profiles节点中一致
- 文件的key（如db.driver）与config.properties中的${db.driver}对应

### maven打包命令
mvn clean install -Pdev
mvn clean install -product
mvn clean install -Ptest

Intellij IDEA  maven打包设置
![](maven2.jpg)

### 部署war包

代码地址：https://github.com/beijinguang/ssm 
欢迎大家fork，star

安利下微信公众号:
![](code.jpg)



