---
title: js与jQuery 获取父窗、子窗的iframe
categories: [jQuery]
tags: [jQuery,iframe]
date: 2016-11-28 16:48:31
description: js与jQuery 获取父窗、子窗的iframe
---

今天爬取一个页面的时候，chrome开发着工具明明看到了一个input上的id，但是用jQuery 却得不到，仔细观察Dom才发现
此id是在一个iframe里面，于是查询以些资料总结如下：

## js
### 在父窗口中获取iframe中的元素
1、
格式：window.frames["iframe的name值"].document.getElementByIdx_x("iframe中控件的ID").click();
实例：window.frames["ifm"].document.getElementByIdx_x("btnOk").click();
2、
格式：
var obj=document.getElementByIdx_x("iframe的name").contentWindow;
var ifmObj=obj.document.getElementByIdx_x("iframe中控件的ID");
ifmObj.click();
实例：
var obj=document.getElementByIdx_x("ifm").contentWindow;
var ifmObj=obj.document.getElementByIdx_x("btnOk");
ifmObj.click();
### 在iframe中获取父窗口的元素
格式：window.parent.document.getElementByIdx_x("父窗口的元素ID").click();
实例：window.parent.document.getElementByIdx_x("btnOk").click();
## jquery
### 在父窗口中获取iframe中的元素
1、
格式：$("#iframe的ID").contents().find("#iframe中的控件ID").click();//jquery 方法1
实例：$("#ifm").contents().find("#btnOk").click();//jquery 方法1
2、
格式：$("#iframe中的控件ID",document.frames("frame的name").document).click();//jquery 方法2
实例：$("#btnOk",document.frames("ifm").document).click();//jquery 方法2
### 在iframe中获取父窗口的元素
格式：$('#父窗口中的元素ID', parent.document).click();
实例：$('#btnOk', parent.document).click();