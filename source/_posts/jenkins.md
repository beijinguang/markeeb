---
title: jenkins 安装
categories: [CI]
tags: [CI]
date: 2016-12-21 20:42:02
description: jenkins 安装
---
安装jenkins稳定版本

sudo wget -O /etc/yum.repos.d/jenkins.repo http://pkg.jenkins-ci.org/redhat-stable/jenkins.repo 
sudo rpm --import http://pkg.jenkins-ci.org/redhat-stable/jenkins-ci.org.key 
sudo yum install jenkins


进入jenkins的系统配置文件并修改相关端口号
vi /etc/sysconfig/jenkins
jenkins的默认JENKINS_PORT是8080，这同tomcat的默认端口冲突,改为9099。

service jenkins start

访问地址
会提示输入密码  copy提示中文件里的密码提交
安装插件

