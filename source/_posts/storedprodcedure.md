---
title: 存储过程
date: 2016-08-08 16:24:05
categories: [database]
tags: [Stored Procedure]
---
why use Stored Procedure?
<!-- more -->
## 存储过程

### 概念
        存储过程（Stored Procedure）是在大型数据库系统中，一组为了完成特定功能的SQL 语句集，存储在数据库中，经过
    第一次编译后再次调用不需要再次编译，用户通过指定存储过程的名字并给出参数（如果该存储过程带有参数）来执行它。
    存储过程是数据库中的一个重要对象，任何一个设计良好的数据库应用程序都应该用到存储过程
### 优点
#### **存储过程的能力大大增强了SQL语言的功能和灵活性**
        存储过程可以用流控制语句编写，有很强的灵活性，可以完成复杂的判断和较复杂的运算。
#### **执行速度快**
        存储过程只在创造时进行编译，以后每次执行存储过程都不需再重新编译，而一般SQL语句每执行一次就编译一次,
    所以使用存储过程可提高数据库执行速度。
#### **减少网络通信量**
        当对数据库进行复杂操作时，（如对多个表进行insert、update、select、delete时）可将这些复杂操作用存储过程
    封装起来与数据库提供的事务处理结合一起使用。这些操作，如果用程序完成就是多条SQL语句，可能要多次连接数据库，
    而换成存储过程只需一次连接。
#### **更强的适应性与复用性**
        存储过程可以重复使用，减少数据库开发人员的工作量。
#### **可维护性高**
        更新存储过程通常比更改、测试以及重新部署程序集需要较少的时间和精力。
#### **安全性高**
        可设定只有某用户才能对指定存储过程的使用权，且存储过程比多条sql稳定，只要数据库不出现问题，基本上是不会
    出现什么问题的。
#### **分布式工作**
        应用程序和数据库的编码工作可以单独进行，减少耦合度。
        
### 缺点
#### **开发调试差** 
        无良好的IDE开发工具，存储过程的调试比一般SQL要复杂的多。（MySQL调试工具Debugger for MySQL）
#### **可移植性差** 
        由于存储过程将应用程序绑定到数据库上，因此使用存储过程封装业务逻辑将限制应用程序的可移植性。
#### **重新编译问题** 
        因为后端代码是运行前编译的，如果带有引用关系的对象发生改变时，受影响的存储过程、包将需要重新
    编译（不过也可以设置成运行时刻自动编译）。
#### **维护难** 
        如果在一个程序系统中大量的使用存储过程，到程序交付使用的时候随着用户需求的增加会导致数据结构的变化，
    接着就是系统的相关问题了，最后如果用户想维护该系统可以说是很难很难、而且代价是空前的，维护起来更麻烦。
    
### 参考链接
    http://blog.csdn.net/jesse621/article/details/9452049
    http://blog.csdn.net/u010796790/article/details/52194842
    http://baike.baidu.com/link?url=31ou9zns4zUnhs0gXjdjlWT8j-QvJ6QJqz5FYj6p_DM2TXYoLIYJgBsELDuXTcelRtm9Pk51O7FZcOVowd_YBq
        
        