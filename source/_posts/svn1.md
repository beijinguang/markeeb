---
title: linux下svn安装
categories: [svn]
tags: [svn]
date: 2016-12-21 11:15:45
description: linux下svn安装
---
安装步骤如下：
1. yum install subversion
2. 查看安装版本 svnserve --version
3. 创建SVN版本库目录 mkdir -p /var/svn/idea4j
4. 创建版本库  svnadmin create /var/svn/idea4j
  执行了这个命令之后会在/var/svn/idea4j目录下生成如下这些文件:conf  db  format  hooks  locks  README.txt
5. 进入conf目录（该svn版本库配置文件）cd conf/
  authz文件是权限控制文件
  passwd是帐号密码文件
  svnserve.conf SVN服务配置文件
6. 设置帐号密码 vi passwd
  在[users]块中添加用户和密码，格式：帐号=密码，如markee=guagua99
7. 设置权限 vim authz 
```txt
[groups]
#增加组
developers = markee
product = markee
[idea4j:/]
#组权限
@developers=rw
* =
``` 
8. 修改svnserve.conf文件  vi svnserve.conf
  打开下面的几个注释：
  anon-access = read #匿名用户可读
  auth-access = write #授权用户可写
  password-db = passwd #使用哪个文件作为账号文件
  authz-db = authz #使用哪个文件作为权限文件
  realm = /var/svn/idea4j # 认证空间名，版本库所在目录
  
9. 启动svn版本库  svnserve -d -r /var/svn/idea4j（停止SVN命令  killall svnserve）


10. 验证svn
mkdir test
svn import test svn://192.168.152.128/zd/svn/project/ -m "zhudan"