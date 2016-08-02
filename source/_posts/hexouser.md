---
title: 在多台电脑上使用hexo
date: 2016-08-01 12:42:35
tags: hexo
---

家里和公司可以同时写了
<!-- more -->
### 1.上传初始电脑上的Hexo源文件到github的“hexo”仓库
    git init
    git add README.md
    git commit -m "first commit"
    git remote add origin git@github.com:beijinguang/hexo.git
    git push -u origin master
### 2.在其他电脑上安装hexo环境，gitclone “hexo”
    git clone git@github.com:beijinguang/hexo.git
### 3.所有电脑上都先检查更新再修改上传
    a.建议先检查更新git pull，将本地博客源文件更新至最新版本:git pull
    b.然后可以新建或修改博客内容，进行预览等操作
    c.新建博客后，先同步Hexo源文件，将修改后的源文件同步至github:
     git add . ,git commit -m "record", git push orign master
    d.然后再执行Hexo的生成文件和部署指令:hexo generate ,hexo deploy

