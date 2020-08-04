---
title: maven
categories: [maven]
tags: [maven]
date: 2016-08-20 11:37:33
---


mvn install:install-file -Dfile=jar包的位置 -DgroupId=上面的groupId -DartifactId=上面的artifactId -Dversion=上面的version -Dpackaging=jar

### aliyun阿里云Maven仓库地址——加速你的maven构建
修改setting.xml
```XML
<mirror>
    <id>nexus-aliyun</id>
    <mirrorOf>*</mirrorOf>
    <name>Nexus aliyun</name>
    <url>http://maven.aliyun.com/nexus/content/groups/public</url>
</mirror> 
```