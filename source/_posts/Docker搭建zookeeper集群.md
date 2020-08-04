---
title: Docker搭建zookeeper集群
date: 2020-05-28 20:10:32
categories: [docker]
tags: [docker,zookeeper]
---


## Docker搭建zookeeper集群

准备在3台虚拟机上搭建zookeeper集群

#### 创建挂载目录

用于存储配置文件和数据，使用docker数据和配置文件等需要放在自己的宿主机，而不是容器内，特别是数据

`mkdir -p zookeeper/conf`

`mkdir -p zookeeper/data`

#### 创建配置文件

在zookeeper/data下创建zoo.cfg

touch `zoo.cfg`

clientPort=2181 
dataDir=/data 
dataLogDir=/data/log 
tickTime=2000 
initLimit=5 
syncLimit=2 
autopurge.snapRetainCount=3 
autopurge.purgeInterval=0 
maxClientCnxns=60 
server.111=10.255.200.168:2888:3888
server.222=10.255.200.174:2888:3888
server.233=10.255.200.172:2888:3888

#### 配置myid

在zookeeper/data目录下创建**myid**，并配置id，里面的**id一定要和上面配置的server.id一致**

`touch myid`

`echo 111 > myid`

#### 启动容器

docker run  --network host -v /usr/local/zookeeper/data:/data -v  /usr/local/zookeeper/conf:/conf --name zookeeper-2181 -d zookeeper:3.4.13

