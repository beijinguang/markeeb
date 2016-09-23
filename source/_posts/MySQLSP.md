---
title: MySQL 存储过程的使用
date: 2016-08-08 17:27:18
categories: [database]
tags: [Stored Procedure] 
---

存储过程的使用
<!-- more -->

## MySQL存储过程的创建
### 格式
  ***CREATE PROCEDURE 过程名 ([过程参数[,...]])[特性 ...] 过程体***
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
   
```sql
DELIMITER //
CREATE PROCEDURE demo_in_parameter(IN p_in INT)
BEGIN
UPDATE sys_user SET login_name='test' WHERE id = p_in ;
END ;
//
DELIMITER ;

CALL demo_in_parameter(1)
```
    
```SQL
DELIMITER //
 CREATE PROCEDURE demo_out_parameter(OUT s INT)  
 BEGIN 
 SELECT COUNT(*) INTO s FROM sys_user;  
 END 
 //
 DELIMITER ;
 
 SET @p_out=1;
 CALL demo_out_parameter(@p_out);
 SELECT @p_out;
 ```
 
 ```sql
 DELIMITER //
 CREATE PROCEDURE demo_inout_paramter(INOUT p_inout INT)
 BEGIN
 SELECT p_inout;
 SET p_inout=2;
 SELECT p_inout;
 END
 //
 DELIMITER ;
 
 SET @p_inout=1;
 CALL demo_inout_paramter(@p_inout);
 SELECT @p_inout
 ```
### 变量
Ⅰ. 变量定义
***DECLARE variable_name [,variable_name...] datatype [DEFAULT value];***
其中，datatype为MySQL的数据类型，如:int, float, date, varchar(length)
例如:
```sql
DECLARE l_int int unsigned default 4000000;  
DECLARE l_numeric number(8,2) DEFAULT 9.95;  
DECLARE l_date date DEFAULT '1999-12-31';  
DECLARE l_datetime datetime DEFAULT '1999-12-31 23:59:59';  
DECLARE l_varchar varchar(255) DEFAULT 'This will not be padded';   
 ```
 
Ⅱ. 变量赋值
***SET 变量名 = 表达式值 [,variable_name = expression ...]***
 
Ⅲ. 用户变量
①在MySQL客户端使用用户变量
```sql
SELECT COUNT(*) INTO @countuser FROM sys_user; -- 将count(*) 的值赋给 @countuser
SELECT @countuser;

set @greeting = "hello";
select @greeting; -- hello

SET @result = 25*4;
select @result; -- 100
```
②在存储过程中使用用户变量
```sql
CREATE PROCEDURE GreetWorld() SELECT CONCAT(@greeting,' World');  
SET @greeting='Hello';  
CALL GreetWorld(); --Hello World
```

③在存储过程间传递全局范围的用户变量
```sql
CREATE PROCEDURE p1()   SET @last_procedure='p1';  
CREATE PROCEDURE p2() SELECT CONCAT('Last procedure was ',@last_procedure);  
CALL p1( );  
CALL p2( ); -- Last procedure was p1
```
注意:
用户变量名一般以@开头,滥用用户变量会导致程序难以理解及管理

## MySQL存储过程的查询、删除
```sql
select name from mysql.proc where db='数据库名';
select routine_name from information_schema.routines where routine_schema='数据库名';
show procedure status where db='数据库名';
SHOW CREATE PROCEDURE 数据库.存储过程名;

-- 删除
DROP PROCEDURE  '存储过程名'
```
##  MySQL存储过程的控制语句
### 变量作用域
内部的变量在其作用域范围内享有更高的优先权，当执行到end。变量时，内部变量消失，此时已经在其作用域外，变量不再可见了，
应为在存储过程外再也不能找到这个申明的变量，但是你可以通过out参数或者将其值指派给会话变量来保存其值。
```sql
DELIMITER //
CREATE PROCEDURE pro_variable_field()
BEGIN
DECLARE var1 VARCHAR(5) DEFAULT 'outer';
BEGIN
DECLARE var1 VARCHAR(5) DEFAULT 'inner';
SELECT var1;
END;
SELECT var1;
END;
//
DELIMITER ;
```
### 条件语句
Ⅰ. if-then -else语句
```sql
DELIMITER //
CREATE PROCEDURE ifthenelse(IN parameter INT)
BEGIN
DECLARE var INT ;
SET var = parameter + 1;
IF var=0 THEN
INSERT INTO sys_log VALUE(1,1,1,NULL,1,1,1,1,1,1);
END IF;
IF parameter=0 THEN
UPDATE sys_log SET id=id+1;
ELSE
UPDATE sys_log SET id=id+1;
END IF;
END;
//
DELIMITER ;
```
Ⅱ. case语句： 
```sql
DELIMITER $$
CREATE PROCEDURE casewhenthen(IN caseparameter INT)
BEGIN
DECLARE var INT ;
SET var = caseparameter+1;
CASE var
WHEN 0 THEN
SELECT var+1;
WHEN 1 THEN 
SELECT var+2;
ELSE
SELECT var+8;
END CASE;
END;
$$
DELIMITER ;

CALL casewhenthen(0);

```
### 循环语句
Ⅰ. while ···· end while：
```sql
DELIMITER !!
CREATE PROCEDURE whileloop()
BEGIN
DECLARE var INT;
SET var = 0;
WHILE var<6 DO 
SELECT var;
SET var = var+1;
END WHILE;
END;
!!
DELIMITER ;

CALL whileloop();
```
Ⅱ. repeat···· end repeat：
它在执行操作后检查结果，而while则是执行前进行检查。
```sql
DELIMITER **
CREATE PROCEDURE repeatuntil()
BEGIN
DECLARE var INT;
SET var = 0;
REPEAT 
SELECT var;
SET var = var+1;
UNTIL var>=5
END REPEAT;
END;
**
DELIMITER ;

CALL repeatuntil();
```
Ⅲ. loop ·····end loop:
loop循环不需要初始条件，这点和while 循环相似，同时和repeat循环一样不需要结束条件, leave语句的意义是离开循环。
```sql
DELIMITER **
CREATE PROCEDURE loopdemo()
BEGIN
DECLARE var INT;
SET var = 4;
LOOP_LABLE:LOOP
SELECT var;
SET var = var+1;
IF var>=8 THEN
LEAVE LOOP_LABLE;
END IF;
END LOOP;
END;
**
DELIMITER ;

CALL loopdemo();
```
### ITERATE迭代
Ⅰ. ITERATE:
通过引用复合语句的标号,来从新开始复合语句


## MySQL存储过程的基本函数
 
### 字符串类
CHARSET(str) //返回字串字符集
CONCAT (string2 [,... ]) //连接字串
INSTR (string ,substring ) //返回substring首次在string中出现的位置,不存在返回0
LCASE (string2 ) //转换成小写
LEFT (string2 ,length ) //从string2中的左边起取length个字符
LENGTH (string ) //string长度
LOAD_FILE (file_name ) //从文件读取内容
LOCATE (substring , string [,start_position ] ) 同INSTR,但可指定开始位置
LPAD (string2 ,length ,pad ) //重复用pad加在string开头,直到字串长度为length
LTRIM (string2 ) //去除前端空格
REPEAT (string2 ,count ) //重复count次
REPLACE (str ,search_str ,replace_str ) //在str中用replace_str替换search_str
RPAD (string2 ,length ,pad) //在str后用pad补充,直到长度为length
RTRIM (string2 ) //去除后端空格
STRCMP (string1 ,string2 ) //逐字符比较两字串大小,
SUBSTRING (str , position [,length ]) //从str的position开始,取length个字符,
注：mysql中处理字符串时，默认第一个字符下标为1，即参数position必须大于等于1 
 

TRIM([[BOTH|LEADING|TRAILING] [padding] FROM]string2) //去除指定位置的指定字符
UCASE (string2 ) //转换成大写
RIGHT(string2,length) //取string2最后length个字符
SPACE(count) //生成count个空格
### 数学类
ABS (number2 ) //绝对值
BIN (decimal_number ) //十进制转二进制
CEILING (number2 ) //向上取整
CONV(number2,from_base,to_base) //进制转换
FLOOR (number2 ) //向下取整
FORMAT (number,decimal_places ) //保留小数位数
HEX (DecimalNumber ) //转十六进制
注：HEX()中可传入字符串，则返回其ASC-11码，如HEX('DEF')返回4142143
也可以传入十进制整数，返回其十六进制编码，如HEX(25)返回19
LEAST (number , number2 [,..]) //求最小值
MOD (numerator ,denominator ) //求余
POWER (number ,power ) //求指数
RAND([seed]) //随机数
ROUND (number [,decimals ]) //四舍五入,decimals为小数位数]
注：返回类型并非均为整数，如：
(1)默认变为整形值
(2)可以设定小数位数，返回浮点型数据
### 日期时间类
ADDTIME (date2 ,time_interval ) //将time_interval加到date2
CONVERT_TZ (datetime2 ,fromTZ ,toTZ ) //转换时区
CURRENT_DATE ( ) //当前日期
CURRENT_TIME ( ) //当前时间
CURRENT_TIMESTAMP ( ) //当前时间戳
DATE (datetime ) //返回datetime的日期部分
DATE_ADD (date2 , INTERVAL d_value d_type ) //在date2中加上日期或时间
DATE_FORMAT (datetime ,FormatCodes ) //使用formatcodes格式显示datetime
DATE_SUB (date2 , INTERVAL d_value d_type ) //在date2上减去一个时间
DATEDIFF (date1 ,date2 ) //两个日期差
DAY (date ) //返回日期的天
DAYNAME (date ) //英文星期
DAYOFWEEK (date ) //星期(1-7) ,1为星期天
DAYOFYEAR (date ) //一年中的第几天
EXTRACT (interval_name FROM date ) //从date中提取日期的指定部分
MAKEDATE (year ,day ) //给出年及年中的第几天,生成日期串
MAKETIME (hour ,minute ,second ) //生成时间串
MONTHNAME (date ) //英文月份名
NOW ( ) //当前时间
SEC_TO_TIME (seconds ) //秒数转成时间
STR_TO_DATE (string ,format ) //字串转成时间,以format格式显示
TIMEDIFF (datetime1 ,datetime2 ) //两个时间差
TIME_TO_SEC (time ) //时间转秒数]
WEEK (date_time [,start_of_week ]) //第几周
YEAR (datetime ) //年份
DAYOFMONTH(datetime) //月的第几天
HOUR(datetime) //小时
LAST_DAY(date) //date的月的最后日期
MICROSECOND(datetime) //微秒
MONTH(datetime) //月
MINUTE(datetime) //分返回符号,正负或0
SQRT(number2) //开平方