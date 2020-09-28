---
title: Class文件格式
date: 2020-05-28 20:10:32
categories: [字节码]
tags: [字节码]
---

## Class文件格式

| 类型 | 名称                | 数量                  |
| ---- | ------------------- | --------------------- |
| u4   | magic               | 1                     |
| u2    | minor_version       | 1                     |
| u2    | major_version       | 1                     |
| u2    | constant_pool_count | 1                     |
| cp_info | constant_pool       | constant_pool_count-1 |
| u2    | access_flag         | 1                     |
| u2    | this_class          | 1                     |
| u2    | super_class         | 1                     |
| u2    | interfaces_count    | 1                     |
| u2    | interfaces          | interfaces_count      |
| u2    | fields_count        | 1                     |
| field_info | fields              | fields_count          |
| u2    | methods_count       | 1                     |
| method_info | methods             | methods_count         |
| u2    | attributes_count    | 1                     |
| attribute_info | attributes          | attributes_count      |



字节码的组成：

- 魔数（magic）+最小版本号（monir_version）+最大版本号(major_version)
- 常量池大小+常量池
- 访问标志
- 类索引，父类索引，接口索引集合
- 字段表集合
- 方法表集合
- 属性表集合