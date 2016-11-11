---
title: Class类文件的结构
categories: [jvm]
tags: [java,jvm]
date: 2016-10-27 10:07:36
description: Class类文件解析
---

Class 文件是一组以8位字节为基础单位的二进制流，各个数据项目严格按照顺序紧凑地排列在Class文件中，中间没有任何分隔符，这
使得整个Class文件之中存储的内容几乎全部是程序运行的必要数据，没有空隙存在。当遇到需要占用8位字节以上空间的数据项是，则会
按照高位在前的方式分割成若干个8位字节进行存储。

Class结构中只有两种数据类型：无符号数和表

### 无符号数
属于基本数据类型，以u1、u2、u4、u8来分别代表1个字节、2个字节、4个字节、8个字节的无符号数，无符号数可以用来描述数字、
索引引用、数量值或者按照编码构成的字符串。

### 表
表是由多个无符号数或者其他表作为数据项构成的复合数据类型，所有表都习惯性地以“_info” 结尾。表用于描述有层次关系的复
合结构数据，整个Class文件本质上就是一张表,由下列数据项构成。

|类型|名称|数量|
|:-:|:-|:-|
|u4|magic|1|
|u2|minor_version|1|
|u2|major_version|1|
|u2|constant_pool_count|1|
|cp_info|constant_pool|constant_pool_count-1|
|u2|access_flags|1|
|u2|this_class|1|
|u2|super_class|1|
|u2|interfaces_count|1|
|u2|interface|interfaces_count|
|u2|fields_count|1|
|field_info|fields|fields_count|
|u2|methods_count|1|
|method_info|methods|methods_count|
|u2|attributes_count|1|
|attribute_info|attributes|attributes_count|

### 魔数
每个Class文件的头4个字节称为魔数（Magic Number），它的唯一作用是确定这个文件是否是一个能被虚拟机接受的Class
文件。Class文件的魔数值为：0xCAFEBABE（咖啡宝贝）。
紧接着魔数的4个字节存储的是Class文件的版本号，：第5和第6个字节是次版本号（Minor Version），第7和第8个字节是
主版本号（Majer Version）。

Class 文件版本号

|编译器版本|-target参数|十六进制版本号|十进制版本号|
|:-:|:-|:-:|:-:|
|JDK1.1.8|不带target参数|00 03 00 2D|45.3|
|JDK1.2.2|不带（默认为-target1.1）|00 03 00 2D|45.3|
|JDK1.2.2|-target1.2|00 00 00 2E|46.0|
|JDK1.3.1_19|不带（默认为-target1.1）|00 03 00 2D|45.3|
|JDK1.3.1_19|-target1.3|00 00 00 2F|47.0|
|JDK1.4.2_10|不带（默认为-target1.2）|00 00 00 2E|46.0|
|JDK1.4.2_10|-target1.4|00 00 00 30|48.0|
|JDK1.5.0_11|不带（默认为-target1.5）|00 00 00 31|49.0|
|JDK1.5.0_11|-target1.4 -source 1.4|00 00 00 30|48.0|
|JDK1.6.0_01|不带（默认为-target1.6）|00 00 00 32|50.0|
|JDK1.6.0_01|-target1.5|00 00 00 31|49.0|
|JDK1.6.0_01|-target1.4 -source 1.4|00 00 00 30|48.0|
|JDK1.7.0|不带（默认为-target1.7）|00 00 00 33|51.0|
|JDK1.7.0|-target1.6|00 00 00 32|50.0|
|JDK1.7.0|-target1.4 -source 1.4|00 00 00 30|48.0|

### 常量池
紧接着主次版本号之后的是常量池入口，常量池可以理解为Class文件的资源仓库。
常量池中主要有两大类常量：字面量（Literal）和符号引用（Symbolic References)
字面量接近于java语言层面的常量概念，如文本字符串、声明为final的常量等。

符号引用属于编译原理方面的概念，包括了三类常量：
- 类和接口的全限定名（Fully Qualifide Name）
- 字段的名称和描述符（Descriper）
- 方法的名称和描述符


常量池中每一个常量都是一个表，JDK1.7之前有11种，JDK1.7为了更好地支持动态语言调用，又增加了3种（下表后3种）
这14种表有一个共同点：第一位是一个u1类型的标识位（tag），代表当前这个常量属于哪个类型的常量类型。

常量池的项目类型

|类型|标志（tag）|描述|
|:-|:-:|:-|
|CONSTANT_Utf8_info|1|UTF-8编码的字符串|
|CONSTANT_Integer_info|3|整型字面量|
|CONSTANT_Float_info|4|浮点型字面量|
|CONSTANT_Long_info|5|长整型字面量|
|CONSTANT_Double_info|6|双精度浮点型字面量|
|CONSTANT_Class_info|7|类或接口的符号引用|
|CONSTANT_String_info|8|字符串类型字面量|
|CONSTANT_Fieldref_info|9|字段的符号引用|
|CONSTANT_Methodref_info|10|类中方法的符号引用|
|CONSTANT_InterfaceMethodref_info|11|接口中方法的符号引用|
|CONSTANT_NameAndType_info|12|字段或方法的部分符号引用|
|CONSTANT_MethodHandle_info|15|表示方法句柄|
|CONSTANT_MethodType_info|16|标识方法类型|
|CONSTANT_InvokDynamic_info|18|表示一个动态方法调用点|




