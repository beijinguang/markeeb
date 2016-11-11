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
用途：监视虚拟机各种运行状态信息（显示本地或远程虚拟机进程中的类加载、内存、垃圾收集、JIT编译等运行数据）。
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

执行结果表头含义

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

### jinfo：java配置信息工具
全称：Configuration Info for java 
用途：实时地查看和调整虚拟机各项参数。
命令格式：*jinfo [option] pid*

### jmap:java内存映像工具
全称：Memory Map for Java 
用途：生成堆转储快照（heapdump或dump文件）
命令格式：*jmap [option] vmid*

jmap工具主要选项

|选项|作用|
|:-:|:-|
|-dump|生成Java堆转储快照。格式为：-dump:[live,] fomat=b,file=<filename>,其中live子参数说明是否只dump出存活的对象|
|-finalizerinfo|显示子F-Queue中等待Finalizer线程执行finalize方法的对象，只在Linux/Solaris平台下有效|
|-heap|显示javja堆详细信息，如使用哪种回收器，参考配置，分代状况等，只在Linux/Solaris平台下有效|
|-histo|显示堆中对象统计信息，包括类、实例数量、合计容量|
|-permstat|以ClassLoader为统计口径显示永久代内存状态，只在Linux/Solaris平台下有效|
|-F|当虚拟机进程对-dump选项没有响应时，可使用这个选项强制生成dump快照，只在Linux/Solaris平台下有效|


### jhat：虚拟机堆转储快照分析工具

全称：JVM Heap Analysis Tool
用途：分析jmap生成的快照
命令格式：*jhat filename*


### jstack：java堆栈跟踪工具
全称：Stack Trace for Java
用途：用于生成虚拟机当前时刻的线程快照。
命令格式：*jstack [option] vmid*

jstack工具主要选项

|选项|作用|
|:-:|:-|
|-F|当正常输出的请求不被响应是，强制输出线程堆栈|
|-l|除堆栈外，显示关于锁的附加信息|
|-m|如果调用到本地方法的话，可以显示c/c++的堆栈|













