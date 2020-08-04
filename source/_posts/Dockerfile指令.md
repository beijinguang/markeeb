---
title: docker 容器数据卷
date: 2020-05-28 23:10:32
categories: [docker]
tags: [docker]
---

## Dockerfile指令

#### FROM 

  基础镜像，当前镜像是基于哪个镜像的

#### MAINTAINER

  镜像维护者的姓名和邮箱地址等

#### WORKDIR

  指定创建容器后，终端默认位置（pwd的位置）

#### ENV 

  构建镜像过程中的环境变量

##### RUN

  构建容器过程中的执行的命令

#### EXPOSE

  当前容器对外暴露出的端口

#### VOLUME

  容器数据卷，用于数据保存和持久化

#### ADD

  将宿主机目录下的文件拷贝到镜像中，且会解压 tar包和自动处理URL

#### COPY

  

#### CMD

指定容器启动时要执行的命令

#### ENTRYPOINT



#### ONBUILD

