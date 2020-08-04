---
title: 汇编语言(一)
categories: [汇编语言]
tags: [汇编语言]
date: 2016-10-18 14:18:58
description: 汇编语言检测
---

汇编语言
（1）1个CPU的寻址能力为8KB，那么它的地址总线的宽度为 13位。
（2）1KB的存储器有 1024 个存储单元，存储单元的编号从 0 到 1023 。
（3）1KB的存储器可以存储 8192（2^13） 个bit， 1024个Byte。
（4）1GB是 1073741824 （2^30） 个Byte、1MB是 1048576（2^20） 个Byte、1KB是 1024（2^10）个Byte。
（5）8080、8088、80296、80386的地址总线宽度分别为16根、20根、24根、32根，则它们的寻址能力分别为:64 （KB）、 1 （MB）、 16 （MB）、 4 （GB）。
（6）8080、8088、8086、80286、80386的数据总线宽度分别为8根、8根、16根、16根、32根。则它们一次可以传送的数据为: 1 （B）、 1 （B）、 2 （B）、 2 （B）、 4 （B）。
（7）从内存中读取1024字节的数据，8086至少要读 512 次，80386至少要读 256 次。
（8）在存储器中，数据和程序以 二进制 形式存放

解题过程：
（1）1KB=1024B，8KB=1024B*8=2^N，N=13。
（2）存储器的容量是以字节为最小单位来计算的，1KB=1024B。
（3）8Bit=1Byte，1024Byte=1KB（1KB=1024B=1024B*8Bit）。
（4）1GB=1073741824B（即2^30）1MB=1048576B（即2^20）1KB=1024B（即2^10）。
（5）一个CPU有N根地址线，则可以说这个CPU的地址总线的宽度为N。这样的CPU最多可以寻找2的N次方个内存单元。（一个内存单元=1Byte）。
（6）8根数据总线一次可以传送8位二进制数据（即一个字节）。
（7）8086的数据总线宽度为16根（即一次传送的数据为2B）1024B/2B=512，同理1024B/4B=256。
（8）在存储器中指令和数据没有任何区别，都是二进制信息。

