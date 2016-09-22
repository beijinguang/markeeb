---
title: MySQL 存储过程
date: 2016-08-08 17:27:18
categories: [database]
tags: [Stored Procedure],[MySQL]
---
<!-- more -->
#
### 格式
  **CREATE PROCEDURE 过程名 ([过程参数[,...]])[特性 ...] 过程体**
### 声明分隔符
DELIMITER //和DELIMITER ;
    因为MySQL默认以";"为分隔符，如果我们没有声明分割符，那么编译器会把存储过程当成SQL语句进行处理，
则存储过程的编译过程会报错，所以要事先用DELIMITER关键字申明当前段分隔符，这样MySQL才会将";"当做存储
过程中的代码，不会执行这些代码，用完了之后要把分隔符还原。
### 参数 
MySQL存储过程的参数用在存储过程的定义，共有三种参数类型,IN,OUT,INOUT,形式如：
***CREATE PROCEDURE([[IN |OUT |INOUT ] 参数名 数据类形...])***  
IN 输入参数:表示该参数的值必须在调用存储过程时指定，在存储过程中修改该参数的值不能被返回，为默认值
OUT 输出参数:该值可在存储过程内部被改变，并可返回
INOUT 输入输出参数:调用时指定，并且可被改变和返回
    
    
```SQL
DELIMITER //
 CREATE PROCEDURE proc1(OUT s INT)  
 BEGIN 
 SELECT COUNT(*) INTO s FROM sys_user;  
 END 
 //
 DELIMITER ;
 
 SET @p_out=1;
 CALL proc1(@p_out);
 SELECT @p_out;
 ```
