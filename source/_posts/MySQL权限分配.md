---
title: MySQL权限分配
categories: [mysql]
tags: [mysql]
date: 2018-05-27 18:12:11
description:
---

<!-- more -->

## MySQL权限分配

### 创建用户

```
use mysql;

语法：create user 'username'[@'host'] identified by 'password';

如：someuser 用户可以在所有主机登录，密码为 123456

CREATE USER 'someuser' IDENTIFIED BY '654321'

如：someuser 用户只能在本地登录

CREATE USER 'someuser'@'localhost' IDENTIFIED BY '654321'
```



### 查看用户权限

```
语法：SELECT  privileges|* FROM user WHERE `user` = 'username';

如：查看someuser的权限

SELECT * FROM user WHERE `user` = 'someuser'; 

也可以用 SHOW GRANTS 查看 SHOW GRANTS FOR 'username' [@host];

 SHOW GRANTS FOR someuser;
```



### 赋予用户权限

```
语法：GRANT privileges ON database.table TO 'username'@'host' [IDENTIFIED BY 'password'];

如：赋予 someuser在所有主机的所有权限，但不包含给其他账号赋予权限的权限（如果出现 Access denied for user 'root'@'localhost' to database 'newdatabase'，需要退出当前用户，重新登录）

GRANT all ON *.* TO 'local_user'@'%';

FLUSH PRIVILEGES;
```



- GRANT命令说明：
  - *priveleges* (权限列表),可以是`all`, 表示所有权限，也可以是`select,update`等权限，多个权限的名词,相互之间用逗号分开。
  - ON 用来指定权限针对哪些库和表。格式为`数据库 .表名` ，点号前面用来指定数据库名，点号后面用来指定表名，`*.*` 表示所有数据库所有表。
  - TO 表示将权限赋予某个用户, 格式为`username@host`，@前面为用户名，@后面接限制的主机，可以是IP、IP段、域名以及%，%表示任何地方。*注意：这里%有的版本不包括本地，以前碰到过给某个用户设置了%允许任何地方登录，但是在本地登录不了，这个和版本有关系，遇到这个问题再加一个localhost的用户就可以了*。
  - IDENTIFIED BY 指定用户的登录密码,该项可以省略(某些版本下回报错，必须省略)。
  - WITH GRANT OPTION 这个选项表示该用户可以将自己拥有的权限授权给别人。注意：经常有人在创建操作用户的时候不指定WITH GRANT OPTION选项导致后来该用户不能使用GRANT命令创建用户或者给其它用户授权。
    *备注：可以使用GRANT重复给用户添加权限，权限叠加，比如你先给用户添加一个select权限，然后又给用户添加一个insert权限，那么该用户就同时拥有了select和insert权限。*
- 授权原则说明：
  - 只授予能满足需要的最小权限，防止用户干坏事。比如用户只是需要查询，那就只给select权限就可以了，不要给用户赋予update、insert或者delete权限。
  - 创建用户的时候限制用户的登录主机，一般是限制成指定IP或者内网IP段。
  - 初始化数据库的时候删除没有密码的用户。安装完数据库的时候会自动创建一些用户，这些用户默认没有密码。
  - 为每个用户设置满足密码复杂度的密码。
  - 定期清理不需要的用户。回收权限或者删除用户。

### 收回用户权限

```
语法：REVOKE privileges ON database.table FROM 'username'@'host';
如：收回 someuser 的写入和更新权限
REVOKE insert,update ON *.* FROM 'someuser'@'%';
```

### 删除用户

```
语法:DROP USER 'username'@'host';
如：删除本地用户 local_user
DROP USER 'local_user'@'localhost';
```