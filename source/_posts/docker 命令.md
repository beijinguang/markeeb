---
title: docker 命令
date: 2020-05-29 19:10:32
categories: [docker]
tags: [docker]
---

## docker 命令

docker search

### docker pull tomcat

命令格式：`docker run [OPTIONS] IMAGE [COMMAND] [ARG...]`

### docker run  --name  mytomcat -d tomcat:latest 

### docker ps

docker stop

docker ps a

docker start

docker rm

docker run -d -p 8888:8080 tomcat

docker images [name]

docker build -f /usr/local/dockerfile -t [name] path

docker build -t saleorder:1.0 . 

docker exec 