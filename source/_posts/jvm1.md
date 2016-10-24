---
title: java虚拟机性能监控与故障管理工具
categories: [jvm]
tags: [jvm]
date: 2016-10-24 16:52:59
description: jps，jstat
---

### jps：虚拟机进程状况工具
全称：JVM Process Status Tool
用途：列出正在运行的虚拟机进程，并显示虚拟机执行主类（Main Class，main()函数所在类）名称以及这些进程的本地
虚拟机唯一ID（Local Virtual Machine Identifier,LVMID）
命令格式：*jps [option] [hostid]*
|选项|作用|
|:-:|:-|
|-q|只输出省略主类的名称|
|-m|输出虚拟机进程启动时传递给主类main()函数的参数|
|-l|输出主类的全名，如果进程执行的是jar包，输出jar路径|
|-v|输出虚拟机进程启动时JVM参数|

### jstat:虚拟机统计信息监视工具
全称：JVM Statistics Monitoring Tool
用途：
命令格式：*jstat [option vmid[interval[s|ms][count]]]*
栗子：jstat -gc 2092 300 10 //每300毫秒查询一次进程2092垃圾收集情况

|选项|作用|
|:-:|:-|
|-class|监视类装载、卸载数量、总空间以及类装载所耗费的时间|
|-gc|监视堆状况，包括Eden区、两个survivor区、老年代、永久代等的容量、已用空间、GC时间合计等信息|
|-gccapacity|监视内容与-gc基本相同，但输出主要关注java堆各个区域使用到的最大、最小空间|
|-gcutil|监视内容与-gc基本相同，但输出主要关注已使用空间占总空间的百分比|
|-gccause|与-gcutil功能一样，但是会额外输出导致上一次GC产生的原因|
|-gcnew|监视新生代GC状况|
|-gcnewcapacity|监视内容与-gcnew基本相同，但输出主要关注使用到的最大、最小空间|
|-gcold|监视老年代GC状况|
|-gcoldcapacity|监视内容与-gcold基本相同，但输出主要关注使用到的最大、最小空间|
|-gcpermcapacity|输出永久代使用到的最大、最小空间|
|-complier|输出JIT编译器编译过的方法、耗时等信息|
|-printcompilation|输出已经被JIT编译的方法|

|字母|含义|
|:-:|:-|
|E|Eden新生代|
|S0|Survivor0|
|S1|Survivor1|
|O|Old老年代|
|P|Permanent永久代|
|YGC|Young GC|
|FGC|Full GC|
|YGCT|Young GC Time|
|FGCT|Full GC Time|
|GCT|GC Time|

