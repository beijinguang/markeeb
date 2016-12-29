---
title: MyBatis Generator配置文件详解
categories: [mybatis]
tags: [mybatis]
date: 2016-12-28 15:30:03
description: MyBatis Generator配置文件的标签
---

## &lt;classPathEntry&gt;
驱动文件指定配置项

<classPathEntry location="/Program Files/IBM/SQLLIB/java/db2java.zip" />

## &lt;columnOverride&gt;
将数据库中的字段重命名为实体类的属性

column 数据库中字段名

property POJO属性名

javaType POJO类型

jdbcType 数据库字段类型
```xml
<table schema="DB2ADMIN" tableName="ALLTYPES" domainObjectName="Customer" >
  <property name="useActualColumnNames" value="true"/>
  <generatedKey column="ID" sqlStatement="DB2" identity="true" />
  <columnOverride column="DATE_FIELD" property="startDate" />
  <ignoreColumn column="FRED" />
  <columnOverride column="LONG_VARCHAR_FIELD" jdbcType="VARCHAR" />
</table>
```
 

##  &lt;columnRenamingRule&gt;
按规则将数据库中的字段重命名为实体类的属性
```xml
<table schema="DB2ADMIN" tableName="ALLTYPES" domainObjectName="Customer" >
  <columnRenamingRule searchString="^CUST_" replaceString="" />
  ..
</table>
```
## &lt;commentGenerator&gt;
代码上面的注释规则

子属性：property
porperties：
suppressAllComments  false时打开注释，true时关闭注释
suppressDate  false时打开时间标志，true时关闭...真是反人类啊
```xml
<commentGenerator>
  <property name="suppressDate" value="true" />
</commentGenerator>
```
## &lt;context&gt;
这个实在不知道怎么解释，反正就是大环境

targetRuntime 可选项，可填值为MyBatis3，MyBatis3Simple（默认的），Ibatis2Java2，Ibatis2Java5
```xml
<context id="DB2Tables" targetRuntime="MyBatis3">
    ...
</context>
```
## &lt;generatedKey&gt;
指定自增加以及Id
column 字段
sqlStatement 数据库语句，可以为MySql，DB2,SqlServer,SyBase等http://mybatis.github.io/generator/configreference/generatedKey.html
identity true为id，false不为id
```xml
<table schema="DB2ADMIN" tableName="ALLTYPES" domainObjectName="Customer" >
  <property name="useActualColumnNames" value="true"/>
  <generatedKey column="ID" sqlStatement="DB2" identity="true" />
  <columnOverride column="DATE_FIELD" property="startDate" />
  <ignoreColumn column="FRED" />
  <columnOverride column="LONG_VARCHAR_FIELD" jdbcType="VARCHAR" />
</table>
```

## &lt;ignoreColumn&gt;
忽略字段

column 字段名
```xml
<table schema="DB2ADMIN" tableName="ALLTYPES" domainObjectName="Customer" >
  <ignoreColumn column="FRED" />
  ..
</table>
```
## &lt;javaClientGenerator&gt;
Mapper生成配置

type XMLMAPPER配置文件方式，ANNOTATEDMAPPER注解方式

http://mybatis.github.io/generator/configreference/javaClientGenerator.html
```xml
<javaClientGenerator type="XMLMAPPER"
    targetPackage="dao.mapper" targetProject="app">
    <property name="enableSubPackages" value="true" />
</javaClientGenerator>
```
## &lt;javaModelGenerator&gt;
实体类生成配置

http://mybatis.github.io/generator/configreference/javaModelGenerator.html
```xml
<javaModelGenerator targetPackage="domain"
    targetProject="app">
    <property name="enableSubPackages" value="true" />
    <property name="trimStrings" value="false" />
</javaModelGenerator>
```
## &lt;javaTypeResolver&gt;
mybatis里专门用来处理NUMERIC和DECIMAL类型的策略
```xml
<javaTypeResolver>
  <property name="forceBigDecimals" value="true" />
</javaTypeResolver>
```

## &lt;jdbcConnection&gt;
jdbc配置，不解释了哈
```xml
<jdbcConnection driverClass="COM.ibm.db2.jdbc.app.DB2Driver"
    connectionURL="jdbc:db2:MBGTEST"
    userId="db2admin"
    password="db2admin">
</jdbcConnection>
```
## &lt;sqlMapGenerator&gt;
生成sql语句的xml文件
在mybatis2里是必须的，在mybatis3中，只有用XML方式的时候才是需要的。
```xml
<sqlMapGenerator targetPackage="test.model"
     targetProject="\MyProject\src">
  <property name="enableSubPackages" value="true" />
</sqlMapGenerator>
```