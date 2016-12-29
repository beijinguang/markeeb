---
title: Boot2Docker 启动闪退
categories: [docker]
tags: [docker]
date: 2016-12-26 10:10:28
description: boot2docker 启动问题解决
---

windows 安装了个Boot2Docker来玩玩，结果安装完，一点启动出现个对话框就闪退了，百度了下也有人出现同样的问题
http://blog.csdn.net/freeape/article/details/51173258

按照上面的方法试了下出现了一下问题：

uxtheme.dll 这个文件得取的权限才能替换。关闭主题服务，重命名，什么的，replace.exe都试了个遍，不好使。修改了权限
好不容易替换了这个文件，结果重新启动的时候，屏幕就灰屏了，悲剧了，只好找人做了U盘，用PE把文件换回来，电脑才活了过来


------------------------悲惨的经历，系统文件最好还是不要轻易替换，即使替换也得保存个备份-----------------------------

机器活过来后，又重新看了下上面网址说的原因：闪退是跟Oracle VM VirtualBox有关，于是换了个思路，下了个最新版Oracle VM VirtualBox

重新打开Boot2Docker start 启动成功了。

额，替换文件，用PE恢复电脑这个过程是一个痛苦的过程。

所以，Boot2Docker 启动闪退 ，*更新下Oracle VM VirtualBox就好了*，不要替换啥dll文件了
