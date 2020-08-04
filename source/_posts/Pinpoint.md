---
title: Pinpoint安装使用
categories: [Pinpoint]
tags: [Pinpoint,链路追踪]
date: 2020-06-09 11:02:09
description:
---

<!-- more -->
# Pinpoint安装使用

**Pinpoint**是用于用Java / PHP编写的大规模分布式系统的APM（应用程序性能管理）工具。受[Dapper的](http://research.google.com/pubs/pub36356.html)启发，Pinpoint提供了一种解决方案，可通过跟踪跨分布式应用程序的事务来帮助分析系统的整体结构以及其中的组件如何互连。

你一定要检查**精确定位**，如果你想

- 一目了然地了解您的[应用程序拓扑](http://naver.github.io/pinpoint/overview.html)
- 监控应用程序*的实时*
- 获得每笔交易的代码级可见性
- 安装APM代理而无需更改任何代码
- 对性能的影响最小（资源使用量增加约3％）

## 一、下载pinpoint包

从https://github.com/naver/pinpoint/releases 下载

1. pinpoint-agent.tar.gz
2. pinpoint-collector.war
3. pinpoint-web.war

## 二、安装 HBase

修改 hbase-site.xml 为

```
<configuration>
  <property>
    <name>hbase.rootdir</name>
    <value>file:///home/testuser/hbase</value>
  </property>
  <property>
    <name>hbase.zookeeper.property.dataDir</name>
    <value>/home/testuser/zookeeper</value>
  </property>
  <property>
    <name>hbase.unsafe.stream.capability.enforce</name>
    <value>false</value>
  </property>
</configuration>
```

执行 `bin/start-hbase.sh`启动 hbase

执行 ./hbase shell hbase-create.hbase 文件创建表等

## 三、启动 pinpoint-web

修改 pinpoint-web.war 包配置文件（默认）

```
修改 WEB-INF\classes\hbase.properties 文件
hbase.client.host 设置为 hbase 所用的 zk 地址

修改 WEB-INF\classes\pinpoint-web.properties 文件
cluster.zookeeper.address 修改为给 Pinpoint 准备的 zk 地址
```

将 war 包放到 tomcat 中启动

## 四、启动 pinpoint-collector

修改 pinpoint-collector.war 包配置文件（默认）

```
修改 WEB-INF\classes\hbase.properties 文件
hbase.client.host 设置为 hbase 所用的 zk 地址

修改 WEB-INF\classes\pinpoint-collector.properties 文件
cluster.zookeeper.address 修改为给 Pinpoint 准备的 zk 地址
```

可以将 pinpoint-web 和 pinpoint-collector 放到一个 tomcat 中启动

 

## 五、配置 Agent

解压 pinpoint-agent.tar.gz，修改 pinpoint.config 中的 profiler.collector.ip 改为部署 collector 的机器ip



## 六、启动应用服务

```
java -javaagent:/opt/agent/pinpoint-bootstrap-1.8.0-SNAPSHOT.jar  -Dpinpoint.agentId=dubbo-provider-id -Dpinpoint.applicationName=dubbo-provider -jar dubbo-provider-0.0.1-SNAPSHOT.jar

java -javaagent:/opt/agent/pinpoint-bootstrap-1.8.0-SNAPSHOT.jar  -Dpinpoint.agentId=dubbo-consumer-id -Dpinpoint.applicationName=dubbo-consumer -jar dubbo-consumer-0.0.1-SNAPSHOT.jar
```

如果是通过 tomcat 启动，则需要修改 bin/catalina.sh 文件

```
CATALINA_OPTS="$CATALINA_OPTS -javaagent:/opt/agent/pinpoint-bootstrap-1.8.0-SNAPSHOT.jar"
CATALINA_OPTS="$CATALINA_OPTS -Dpinpoint.agentId=AGENT_ID"
CATALINA_OPTS="$CATALINA_OPTS -Dpinpoint.applicationName=APPLICATION_TEST"
```