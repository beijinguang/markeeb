---
title: linux 端口查看
categories: [Linux]
tags: [Linux]
date: 2016-12-21 13:39:06
description: linux 端口查看
---
linux开启允许外网访问的端口
 
LINUX开启允许对外访问的网络端口 
 
LINUX通过下面的命令可以开启允许对外访问的网络端口： 
 
/sbin/iptables -I INPUT -p tcp --dport 8000 -j ACCEPT #开启8000端口 
 
/etc/rc.d/init.d/iptables save #保存配置 
 
/etc/rc.d/init.d/iptables restart #重启服务 
 
查看端口是否已经开放 
 
/etc/init.d/iptables status