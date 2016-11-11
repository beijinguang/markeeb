---
title: 一行配置文件引发的“血案”
categories: [java]
tags: [java,servlet]
date: 2016-11-02 17:14:32
description: servlet3.0 的metadata-complete 属性
---

有点空闲看了看servlet3.0规范，就想着要不来个“hello world”玩玩。
马上开干，首先maven生成工程的文件结构。然后找个3.0的web.xml，记得tomcat7下有这样的文件，于是找到tomcat7下的manager复制
了一下，去掉中间部分结果如下：
```xml
<?xml version="1.0" encoding="utf-8"?>
<web-app xmlns="http://java.sun.com/xml/ns/javaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://java.sun.com/xml/ns/javaee
                      http://java.sun.com/xml/ns/javaee/web-app_3_0.xsd"
         version="3.0"
         metadata-complete="true">
    <display-name>idea4j</display-name>
    <description></description>
</web-app>
```
new 一个servlet，代码自动加入了doGet，doPost方法，并且智能的加上了@WebServlet注解(窃喜中，可以不要在web.xml添加
servlet的配置了)，再添加代码如下:
```java
@WebServlet("/hello")
public class Servlet extends HttpServlet {
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.setAttribute("now", new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));
        request.getRequestDispatcher("/WEB-INF/jsp/hello.jsp").forward(request,response);
    }
}
```
new hello.jsp
```html
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <title>Title</title>
</head>
<body>
<h1>hello</h1>
<h2>当前时间：${now}</h2>
</body>
</html>
```  
部署启动tomcat，浏览器输入localhost:8080/hello/ ,nonono！不是我希望的页面啊，什么情况？竟然是404？
不是应用名的问题，也不是编译目录的问题，不是maven的tomcat插件问题...
额，我想静静！
。。。。。。。。
还是给我找到了web.xml，有这么一个属性metadata-complete="true"，貌似没怎么见过啊，我去掉它试试呢？
终于出现了我要的hello页面。

于是，查到了如下解释：
metadata-complete 属性，该属性指定当前的部署描述文件是否是完全的。如果设置为 true，则容器在部署时将只依赖部署描述文件，
*忽略所有的注解*（同时也会跳过 web-fragment.xml 的扫描）；如果不配置该属性，或者将其设置为 false，则表示启用注解支持。

忽略所有注解，忽略所有... 

ok，that's all
