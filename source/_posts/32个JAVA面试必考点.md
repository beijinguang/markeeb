# 32个JAVA面试必考点

## 一.操作系统与计算机网络

### 1.进程与线程的区别和联系

​	进程是系统资源分配的最小单位，线程是程序执行的最小单位；

​	进程使用独立的数据空间，而线程共享进程的数据空间。比如java启动时，本事就是一个进程，其中用多个线程在工作。

### 2.简单介绍一下进程的切换过程



### 3.你经常用哪些linux命令，用来解决哪些问题？



### 4.为什么tcp建立连接需要3次握手而断连需要4次？

<img src="https://gitee.com/idea4j/image4md/raw/master/images/image-20201004213552815.png" alt="image-20201004213552815" style="zoom:50%;" />

三次握手

第一次握手：客户端将标志位SYN（同步序列编号Synchronize Sequence Numbers）置为1，随机产生一个值seq=J，并将该数据包发送给服务器端，客户端进入SYN_SENT状态，等待服务端确认。

第二次握手：服务器端收到数据包后由标志位SYN=1知道客户端请求建立连接，服务端将标志位SYN和ACK都置为1，ack=J+1，随机产生一个值seq=k，并将该数据包发送给客户端已确认连接请求，服务端进入SYN_RCVD状态。

第三次握手：客户端收到确认后，检查ack是否为J+1，ACK是否为1，如果正确就把标志位ACK置为1，ack=K+1，并将数据包发给服务器端，服务器端检查ack是否为K+1，ACK是否为1，如果正确，则连接建立成功。客户端和服务器端进入ESTABLISHED状态，完成三次握手，两端就可以传输数据了。

注意：可以设置 tcp_synack_retries = 0 加快半链接的回收速度，或者调大 tcp_max_syn_backlog 来应对少量的 SYN 洪水攻击

<img src="https://gitee.com/idea4j/image4md/raw/master/images/image-20201004215013835.png" alt="image-20201004215013835" style="zoom:50%;" />

四次挥手

中断的可以是服务端也可以是客户端。

第一次挥手：客户端发送一个FIN=M，用来关闭客户端到服务端的数据传送，客户端进入FIN_WAIT_1状态，意思是说"我客户端没有数据要发给你了"，但是如果你服务器端还有数据没有发送完成，则不必急着关闭连接，可以继续发送数据。

第二次挥手：服务器端收到FIN后，先发送ack=M+1，告诉客户端，你的请求我收到了，但我还没准备好，请你继续等我的消息。这个时候客户端就进入FIN_WAIT_2状态，继续等待服务端的FIN报文。

第三次挥手：当服务器端确定数据已经传输完成，则向客户端发送FIN=N的报文，告诉客户端，数据发送完毕了，准备好关闭连接了，服务器端进入LAST_ACK状态。

第四次挥手：客户端收到FIN=N时，就知道要关闭连接了，通知服务器端自己要关闭了，发送ack=N+1后进入TIME_WAIT状态，如果服务器端没有收到ACK则可以重传。服务器收到ACK后，就知道断开连接了。客户端等待了2MSL后依然没有收到回复，则证明服务器端已正常关闭，那好，我客户端也可以关闭连接了。最终完成了四次握手。

可以提到实际应用中有可能遇到大量 Socket 处在 TIME_WAIT 或者 CLOSE_WAIT 状态的问题。一般开启 **tcp_tw_reuse** 和 **tcp_tw_recycle** 能够加快 TIME-WAIT 的 Sockets 回收；而大量 CLOSE_WAIT 可能是被动关闭的一方存在代码 bug，没有正确关闭链接导致的。

### 5.为什么tcp关闭连接时需要TIME_WAIT状态，为什么要等2MSL?

为什么需要等待 2 倍最大报文段生存时间之后再关闭链接，原因有两个：

保证 TCP 协议的全双工连接能够可靠关闭；

保证这次连接的重复数据段从网络中消失，防止端口被重用时可能产生数据混淆。

### 6.一次完整的http请求是怎样的？

**1.解析URL**

  首先浏览器会检测这个url是否正确存在，如果不合法，将会返回一个默认的搜索引擎。

  如果存在并合法，那么可以解析得到协议（http或者https）、域名（baidu）、资源（首页）等信息。

**2.DNS查询**

- 浏览器会先检查域名信息是否在缓存中。
- 再检查域名是否在本地的Hosts文件中。
- 如果还不在，那么浏览器会向DNS服务器发送一个查询请求，获得目标服务器的IP地址。



**3.TCP传输及运输**

这时候浏览器获得了目标服务器的IP（DNS返回）、端口（URL中包含，没有就使用默认（HTTP默认80端口）），浏览器会调用库函数socket，生成一个TCP流套接字，也就是完成了TCP的封包。

TCP封包完成之后，就可以传输了，浏览器和服务器就完成了TCP的三次握手，建立了连接，后面就可以请求服务器资源了。

**4.服务器接收请求并响应**

- HTTP有很多请求方法，比如：GET/POST/PUT/DELETE等等，我们浏览器输入URL这种，是GET方法。
- 服务器接收到GET请求，服务器根据请求信息，获得相应的相应内容。例如我们输入的是：\www.baidu.com\，那么意味着访问百度的首页文件

**5.浏览器解析并渲染**

浏览器从服务器拿到了想要访问的资源，大多数时候，这个资源就是HTML页面，当然也可能是一个其他类型的文件。

- 浏览器先对HTML文档进行解析，生成解析树（以DOM元素为节点的树）。
- 加载页面的外部资源，比如JS、CSS、图片。
- 遍历DOM树，并计算每个节点的样式，最终完成渲染，变成我们看到的页面。



### 7.http，https，http2的区别有哪些？

### 8.在你的项目中你使用过哪些设计模式，主要解决哪些问题？

### 9.Object中的equals和hashcode的作用是什么？

### 10.java的异常机制



### 11.网络的 4/7 层模型

应表会传网数物（应表回传王树屋）

![image-20201004213213211](/Users/wangjinguang/Library/Application Support/typora-user-images/image-20201004213213211.png)

## 二.JVM相关

### 1.jvm内存模型

jvm分为程序技术器、堆、栈、元空间、直接内存；

**栈**，虚拟机栈和本地方法栈

**栈**，也叫方法栈是线程私有的，线程执行每一个方法时都会创建一个栈帧，用来存储局部变量表，操作栈，动态链接，方法出口等信息。调用方法时执行入栈，方法返回时执行出栈。

**本地方法栈**，与栈类似，也是保存线程执行方法时的信息，不同的是执行java方法使用栈，而执行native方法使用本地方法栈。

**程序计数器**保存着当前线程所执行字节码的位置，每个线程都有独立的计数器。

**堆**是jvm最大的一块，堆被所有的线程共享，目的是为了存储对象实例，几乎所有对象的实例都在堆上分配，当堆内存没有空间时，会OOM异常。

**方法区**也是各个线程共享的区域，也叫非堆区。用于存储已被虚拟机加载的类信息、常量、静态变量、及时编译器编译后的代码等数据。jdk1.7在永久代，jdk1.8在元空间。

**直接内存**，bytebuffer创建的内存

### 2.什么情况下会触发FullGC？

1. 老年代空间不足时
2. 主动调用System.gc()时
3. 方法区空间不足时，或 Metaspace Space 使用达到 MetaspaceSize 但未达到 MaxMetaspaceSize 阈值；大多情况下扩容都会触发；
4. concurrent mode failure ；



### 3.java的类加载器有哪几种？关系是怎样的？

BootstrapClassLoader启动类加载器（<JAVA_HOME>/lib）

ExtClassLoader扩展类加载器（<JAVA_HOME>/lib/ext）

AppClassLoader应用加载器(classpath)

CustomClassLoader自定义加载器

### 4.双亲委派机制的加载流程是怎样的，有什么好处？

双亲委派模式，一个类加载器在加载类时，首先会把这个请求委托给父类去执行，如果父类加载器还存在父类再继续向上委托，直到顶层就是启动类加载器。如果父类加载器能够完成类加载，就成功返回，如果父类加载器无法完成加载，那么子加载器才会尝试自己去加载。双亲委派模式避免了类的重复加载，也避免了核心api被篡改。

### 5.jdk1.8为什么用metaspace替换掉permGen？metaspace保存在哪里？

1. 移除永久代是为融合HotSpot JVM与JRockit VM而做出的努力，因为JRockit没有永久代，不需要配置永久代。
2. 现实使用中，由于永久代内存占用堆内存，运行时生成大量类的造成经常 Full GC，爆出异常java.lang.OutOfMemoryError : PermGen.而元空间占用的是堆外内存。



### 6.编译期会对哪些治指令进行优化？

jvm在编译代码的时候 ，为了提高程序运行效率，在不影响单线程程序执行结果的前提下，对指令进行的排序

前端编译器 javac 的编译过程、AST 抽象语法树、编译期优化和运行期优化。编译优化的常用技术包括公共子表达式的消除、方法内联、逃逸分析、栈上分配、同步消除等。明白了这些才能写出对编译器友好的代码。



### 7.volatile可以解决什么问题？是如何做到的？

volatile主要解决内存可见性的问题。jmm中，主内存有一个数据，每个线程都有自己的内存副本（工作内存），单个线程修改主内存的过程是先修改自己的内存副本再刷新到主内存中，这样就会出现线程安全问题。加上volatile关键字，线程修改volatile变量时，会强制刷新修改后的值到主内存中，并其他线程工作内存中的引用值失效，再读取该变量就必须重新从主内存中读取。

有序性，被volatile修饰的，会禁止指令重排；

### 8.GC的分代回收

垃圾回收算法：标记清除法，复制算法，标记整理法，分代算法；

为了高效率的进行内存回收。堆内存就划分成了几个区域：

年轻代，用来存放新创建的对象实例，年轻代有划分为eden和两个survivor空间，年轻代采用复制算法，效率高，这也是minorGC使用时间短的原因之一。

老年代，用来存放放年轻代晋升来存放时间长的对象。老年代采用标记清理法或者标志整理法。



### 9.G1回收算法和CMS的区别有哪些？

cms回收器执行步骤

1、初始标记：GC roots 可以理解为对象指向的标记

2、并发标记： GC roots Tracing 可以理解为 通过初始标记找到了要删除的对象 也就是堆中的指向对象

3、重新标记： 可以理解为重新执行了一遍 初始标记 和 并行标记 产生标记记录

4、删除标记：标记删除发进行并发删除

**优点**：并行执行，低停顿

**缺点**：

1、不停顿耗线程，耗内存，整体效率低

2、标记清除法会产生垃圾碎片 容易FGC

3、会产生浮动垃圾容易FGC

 

g1回收器：

1、初始标识：GC roots 可以理解为对象指向的标记 并且更改tame值出发并发标记

2、并发标记：GC roots Tracing 可以理解为 通过初始标记找到了要删除的对象 也就是堆中的指向对象

3、最终标记： 可以理解为重新执行了一遍 初始标记 和 并行标记 产生标记记录 将标记记录存到remember set log中，然后在合并到 remember set中，通过remember set 来管理对象的引用

4、筛选回收：通过Region区块对回收价值和成本进行排序，根据用户所希望的GC时间进行回收。

**优点**：

1、空间整合：g1使用Region独立区域概念，g1利用的是标记复制法，不会产生垃圾碎片

2、分代收集：g1可以自己管理新生代和老年代

3、并行于并发：g1可以通过机器的多核来并发处理 stop - The - world停顿，减少停顿时间，并且可不停顿java线程执行GC动作，可通过并发方式让GC和java程序同时执行。

4、可预测停顿：g1除了追求停顿时间，还建立了可预测停顿时间模型，能让制定的M毫秒时间片段内，消耗在垃圾回收器上的时间不超过N毫秒

最大的区别是出现了Region区块概念，可对回收价值和成本进行排序回收，根据GC期望时间回收，还出现了member set概念，

将回收对象放入其中，避免全堆扫描



### 10.对象引用有哪几种方式，有什么特点？

强引用：如果一个对象具有强引用，那么垃圾回收器绝不会回收他，当内存不足时，Java虚拟机宁愿抛出OutOfMemoryError错误，也不会回收强引用。

软引用：如果一个对象只具有软引用，则内存空间足够，垃圾回收器就不会回收它；如果内存空间不足了，就会回收这些对象的内存。只要垃圾回收器没有回收它，该对象就可以被程序使用。

弱引用：弱引用与软引用的区别在于：只具有弱引用的对象拥有更短暂的生命周期。在垃圾回收器线程扫描它所管辖的内存区域的过程中，一旦发现了只具有弱引用的对象，不管当前内存空间足够与否，都会回收它的内存。不过，由于垃圾回收器是一个优先级很低的线程，因此不一定会很快发现那些只具有弱引用的对象。

虚引用：“虚引用”顾名思义，就是形同虚设，与其他几种引用都不同，虚引用并不会决定对象的生命周期。如果一个对象仅持有虚引用，那么它就和没有任何引用一样，在任何时候都可能被垃圾回收器回收。

虚引用主要用来跟踪对象被垃圾回收器回收的活动。虚引用与软引用和弱引用的一个区别在于：虚引用必须和引用队列 （ReferenceQueue）联合使用。当垃圾回收器准备回收一个对象时，如果发现它还有虚引用，就会在回收对象的内存之前，把这个虚引用加入到与之 关联的引用队列中。

### 11.使用过哪些jvm调试工具，主要分析哪些内容？

MAT：查看内存泄露，看镜像内堆内存的组成，查看对象的深堆和浅堆等

visualVm：查看jvm各个分区的占用情况，查看各个分区的时间曲线

jstack -l 查看死锁，jps等



## 三、并发与多线程

### 1.如何实现一个生产者消费者模型？

```java
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;

/**
 * 用 BlockingQueue 实现生产者消费者模式
 */
public class Demo {

    public static void main(String[] args) {
        BlockingQueue blockingQueue = new ArrayBlockingQueue(20);

        Runnable producer = () -> {
            while (true) {
                try {

                    blockingQueue.put(new Object());
                    System.out.println("producor:" + blockingQueue.size());
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        };

        new Thread(producer).start();
        new Thread(producer).start();

        Runnable consumer = () -> {
            while (true) {
                try {
                    System.out.println("consumer:" + blockingQueue.size());
                    blockingQueue.take();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        };
        new Thread(consumer).start();
        new Thread(consumer).start();

    }

}

```

### 2.如何理解线程的同步和异步，阻塞和非阻塞？



### 3.线程池处理任务的流程是怎么样的？

1. 向线程池提交任务时，会首先判断线程池中的线程数是否大于设置的核心线程数，如果不大于，就创建一个核心线程来执行任务。

2. 如果大于核心线程数，就会判断缓冲队列是否满了，如果没有满，则放入队列，等待线程空闲时执行任务。

3. 如果队列已经满了，则判断是否达到了线程池设置的最大线程数，如果没有达到，就创建新线程来执行任务。

4. 如果已经达到了最大线程数，则执行指定的拒绝策略。

### 4.wait和sleep有什么不同？

wait 属于 Object 类，sleep 属于 Thread 类；

wait 会释放锁对象，而 sleep 不会；

使用的位置不同，wait 需要在同步块中使用，sleep 可以在任意地方；

sleep 需要捕获异常，而 wait 不需要。

### 5.Synchronized和ReentrantLock有什么不同，各适用于什么场景？

**1** 两者都是可重入锁

两者都是可重入锁。“可重入锁”概念是:自己可以再次获取自己的内部锁。比如一个线程获得了某个对 象的锁，此时这个对象锁还没有释放，当其再次想要获取这个对象的锁的时候还是可以获取的，如果不 可锁重入的话，就会造成死锁。同一个线程每次获取锁，锁的计数器都自增1，所以要等到锁的计数器 下降为0时才能释放锁。

**2 synchronized** 依赖于 **JVM** 而 **ReentrantLock** 依赖于 **API**

synchronized 是依赖于 JVM 实现的，前面我们也讲到了 虚拟机团队在 JDK1.6 为 synchronized 关 键字进行了很多优化，但是这些优化都是在虚拟机层面实现的，并没有直接暴露给我们。 ReentrantLock 是 JDK 层面实现的(也就是 API 层面，需要 lock() 和 unlock() 方法配合 try/finally 语句块来完成)，所以我们可以通过查看它的源代码，来看它是如何实现的。

**3 ReentrantLock** 比 **synchronized** 增加了一些高级功能 相比synchronized，ReentrantLock增加了一些高级功能。主要来说主要有三点:**1**等待可中断;**2**可实现公平锁;**3**可实现选择性通知(锁可以绑定多个条件) **ReentrantLock**提供了一种能够中断等待锁的线程的机制，通过lock.lockInterruptibly()来实现这个机制。也就是说正在等待的线程可以选择放弃等待，改为处理其他事情。

**ReentrantLock**可以指定是公平锁还是非公平锁。而**synchronized**只能是非公平锁。所谓的公平锁就是先等待的线程先获得锁。 ReentrantLock默认情况是非公平的，可以通过 ReentrantLock 类的 ReentrantLock(boolean fair) 构造方法来制定是否是公平的。 

synchronized关键字与wait()和notify()/notifyAll()方法相结合可以实现等待/通知机制， ReentrantLock类当然也可以实现，但是需要借助于Condition接口与newCondition() 方法。 Condition是JDK1.5之后才有的，它具有很好的灵活性，比如可以实现多路通知功能也就是在一 个Lock对象中可以创建多个Condition实例(即对象监视器)，线程对象可以注册在指定的 **Condition**中，从而可以有选择性的进行线程通知，在调度线程上更加灵活。 在使用 **notify()/notifyAll()**方法进行通知时，被通知的线程是由 **JVM** 选择的，用**ReentrantLock**类结 合**Condition**实例可以实现**“**选择性通知**”** ，这个功能非常重要，而且是Condition接口默认提供 的。而synchronized关键字就相当于整个Lock对象中只有一个Condition实例，所有的线程都注 册在它一个身上。如果执行notifyAll()方法的话就会通知所有处于等待状态的线程这样会造成 很大的效率问题，而Condition实例的signalAll()方法 只会唤醒注册在该Condition实例中的所有等待线程。



### 6.读写锁适用于什么场景？ReentrantReadWriteLock是如何实现的？

适用于读多写少的场景。

整体思路是它有两把锁，第 1 把锁是写锁，获得写锁之后，既可以读数据又可以修改数据，而第 2 把锁是读锁，获得读锁之后，只能查看数据，不能修改数据。读锁可以被多个线程同时持有，所以多个线程可以同时查看数据。

在读的地方合理使用读锁，在写的地方合理使用写锁，灵活控制，可以提高程序的执行效率。

读写锁的获取规则
我们在使用读写锁时遵守下面的获取规则：

如果有一个线程已经占用了读锁，则此时其他线程如果要申请读锁，可以申请成功。

如果有一个线程已经占用了读锁，则此时其他线程如果要申请写锁，则申请写锁的线程会一直等待释放读锁，因为读写不能同时操作。

如果有一个线程已经占用了写锁，则此时其他线程如果申请写锁或者读锁，都必须等待之前的线程释放写锁，同样也因为读写不能同时，并且两个线程不应该同时写。

所以我们用一句话总结：要么是一个或多个线程同时有读锁，要么是一个线程有写锁，但是两者不会同时出现。也可以总结为：读读共享、其他都互斥（写写互斥、读写互斥、写读互斥）。

### 7.线程之间如何通信？

利用线程唤醒机制wait()、notify()、notifyAll()；

wait()方法：线程调用wait()方法，**释放**它对锁的拥有权，同时他会在等待的位置加一个标志，为了以后使用notify()或者notifyAll()方法 唤醒它时，它好能从当前位置获得锁的拥有权，变成就绪状态，要确保调用wait()方法的时候**拥有锁**，即，wait()方法的调用必须放在**synchronized**方法或**synchronized**块中。 **在哪里等待被唤醒时，就在那里开始执行。**

notify/notifyAll()方法：**notify()方法：**`**notify()方法会唤醒一个等待当前对象的锁的线程。唤醒在此对象监视器上等待的单个线程。**`

`　***\*notifyAll\**()方法：**`*` **notifyAll（）方法会唤醒在此对象监视器上等待的所有线程。**`*

 **当执行notify/notifyAll方法时，会唤醒一个处于等待该 对象锁 的线程，然后继续往下执行，直到执行完退出对象锁锁住的区域（synchronized修饰的代码块）后再释放锁。**

### 8.保证线程安全的方法有哪些？

CAS、synchronized、Lock，以及 ThreadLocal 等机制。

### 9.如何尽可能提高多线程并发性能？

### 10.ThreadLocal用来解决什么问题？ThreadLocal是如何实现的？

ThreadLocal 不是用来解决多线程共享变量的问题，而是用来解决线程数据隔离的问题。

**底层实现主要是存有一个map，以线程作为key，泛型作为value，可以理解为线程级别的缓存。每一个线程都会获得一个单独的map。**



### 11.死锁产生的条件？如何分析线程是否有死锁？

jstack l

### 12.在实际工作中遇到过什么并发问题，如何发现排查解决的？

提现不能多提

前端按钮，不能重复提交，后端加锁验证



## 四、数据结构与算法

### 1.各种排序算法实现、复杂度和稳定性

<img src="https://gitee.com/idea4j/image4md/raw/master/images/image-20201005131112030.png" alt="image-20201005131112030" style="zoom:50%;" />

### 2.二叉树的前中后序遍历

前序遍历：前序遍历首先访问根节点，然后遍历左子树，最后遍历右子树。（根左右）

递归：

```java
public List<Integer> preorderTraversal(TreeNode root) {
        List<Integer> res = new ArrayList<>();
        preorder(root,res);
        return res;
    }

private void preorder(TreeNode root,List<Integer> res){
  if(root!=null){
    res.add(root.val);
  	preorder(root.left,res);
  	preorder(root.left,res);
  }
}
```

迭代：
```java
public List<Integer> preorderTraversal(TreeNode root) {
        LinkedList<TreeNode> stack = new LinkedList<>();
        LinkedList<Integer> output = new LinkedList<>();
        if(root==null){
            return output;
        }
        stack.add(root);
        while(!stack.isEmpty()){
            TreeNode node = stack.pollLast();
            output.add(node.val);
            if(node.left!=null){
                stack.add(node.left);
            }
            if(node.right!=null){
                stack.add(node.right);
            }
            
        }
        return output;
    }

```

中序遍历：先遍历左子树，然后访问根节点，然后遍历右子树。（左根右）

递归：

```java
public List<Integer> inorderTraversal(TreeNode root) {
  List<Integer> res = new ArrayList<>();
  inorder(root,res);
  return res;
}

private List<Integer> inorder(TreeNode root,List<Integer> res){
  if(root != null){
  	inorder(root.left,res);
    res.add(root.val);
    inorder(root.right,res);
  }
}
```

迭代：

```java
public List<Integer> inorderTraversal(TreeNode root) {
        Stack<TreeNode> stack = new Stack<>();
        List<Integer> output = new ArrayList<>();
        if(root==null){
            return output;
        }
        TreeNode cur = root;
        while(cur!=null||!stack.isEmpty()){
            if(cur!=null){
                stack.add(cur);
                cur = cur.left;
            }else{
                cur = stack.pop();
                output.add(cur.val);
                cur = cur.right;
            }
        }
        return output;   
    }
```

后序遍历：先遍历左子树，然后遍历右子树，最后访问树的根节点。（左右根）

递归：

```java
public List<Integer> postorderTraversal(TreeNode root) {
  List<Integer> res = new ArrayList<>();
  inorder(root,res);
  return res;
}

private List<Integer> postorder(TreeNode root,List<Integer> res){
  if(root != null){
  	postorder(root.left,res);
    postorder(root.right,res);
    res.add(root.val);
  }
}
```

迭代：

```java
public List<Integer> postorderTraversal(TreeNode root) {
        List<Integer> res = new ArrayList<Integer>();
        if(root == null)return res;
        Stack<TreeNode> stack = new Stack<TreeNode>();
        stack.push(root);
        while(!stack.isEmpty()){
            TreeNode node = stack.pop();
            if(node.left != null) stack.push(node.left);//和传统先序遍历不一样，先将左结点入栈
            if(node.right != null) stack.push(node.right);//后将右结点入栈
            res.add(0,node.val);                        //逆序添加结点值
        }     
        return res;
    }
```

### 3.翻转句子中单词的顺序

```

```



### 4.用栈模拟队列（或用队列模拟栈）

### 5.对10亿个数进行排序，限制内存为1G

### 6.去掉找出两个数组中重复的数字



### 7.将一个二叉树转换成其镜像

### 8.确定一个字符串中的符号是否匹配

### 9.给定一个开始词，一个结束词，一个字典，如何找到从开始词到结束词的最短单词接龙路径



### 10.如何查找两个二叉树节点的最近公共祖先

```java
public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
         /**
        注意p,q必然存在树内, 且所有节点的值唯一!!!
        递归思想, 对以root为根的(子)树进行查找p和q, 如果root == null || p || q 直接返回root
        表示对于当前树的查找已经完毕, 否则对左右子树进行查找, 根据左右子树的返回值判断:
        1. 左右子树的返回值都不为null, 由于值唯一左右子树的返回值就是p和q, 此时root为LCA
        2. 如果左右子树返回值只有一个不为null, 说明只有p和q存在与左或右子树中, 最先找到的那个节点为LCA
        3. 左右子树返回值均为null, p和q均不在树中, 返回null
        **/
        if(root == null || root == p || root == q) return root;
        TreeNode left = lowestCommonAncestor(root.left, p, q);
        TreeNode right = lowestCommonAncestor(root.right, p, q);
        if(left == null && right == null) return null;
        else if(left != null && right != null) return root;
  			//3. 左右子树返回值均为null, p和q均不在树中, 返回null
        else return left == null ? right : left;
    }
```

### 不用加减乘除做加法

<img src="https://gitee.com/idea4j/image4md/raw/master/images/image-20201006203307755.png" alt="image-20201006203307755" style="zoom:50%;" />

```java
public int add(int a,int b){
  while(b!=0){
    int c = (a&b)<<1;
    a^=b;
    b=c;
  }
  return a;
}
```



## 字节跳动校招题

### 挑战字符串

无重复字符的最长子串

```java
//滑动窗口法
public int lengthOfLongestSubstring(String s) {
	Set<Character> set = new HashSet<>();
  int length = s.length();
  int i=0,j=0;
  int max = 0;
  
  while (j<length){
    if(!set.contains(s.charAt(j))){
      set.add(s.charAt(j));
      j++;
    }else{
      while(set.contains(s.charAt(j))){
        set.remove(s.charAt(i));
        i++;
      }
    }
    max = Math.max(max,j-i)
  }
  return max;
	
}
```

最长公共前缀

```java
 public String longestCommonPrefix(String[] strs) {
   //如果str[]是空或者null,没有共同前缀
   if (strs == null || strs.length == 0) {
       return "";
   }
   //拿到第一个字符串的长度
   int length = strs[0].length();
   //拿到字符串的数量
   int count = strs.length;
   for (int i = 0; i < length; i++) {
     	 //第一个字符串的首字母
       char c = strs[0].charAt(i);
       for (int j = 1; j < count; j++) {
         //如果第j个字符串的长度等于当前前缀长度，或者字符串的字符与前面的字符不相等
         //则返回前一个字符
         if (i == strs[j].length() || strs[j].charAt(i) != c) {
             return strs[0].substring(0, i);
         }
       }
   }
   return strs[0];
 }
```

字符串的排列

```java
class Solution{
 		List<String> res = new LinkedList<>();
    char[] c;
    public String[] permutation(String s) {
        c = s.toCharArray();
        dfs(0);
        return res.toArray(new String[res.size()]);
       
    }
    void dfs(int x){
        if(x==c.length-1){
          res.add(String.valueOf(c));
          return;
        }
        HashSet<Character> set = new HashSet<>();
        for(int i = x; i < c.length; i++){
          if(set.contains(c[i]))continue;
          set.add(c[i]);
          swap(i,x);
          dfs(x+1);
          swap(i,x);
        }
    }
    void swap(int a,int b){
      char tmp = c[a];
      c[a] = c[b];
      c[b] = tmp;
    }
}
```

字符串相乘

```java
public static final String ZERO = "0";
public String multiply(String num1, String num2) {
  if (num1.equals("0") || num2.equals("0")) {
    return "0";
  }
  int[] res = new int[num1.length() + num2.length()];
  for (int i = num1.length() - 1; i >= 0; i--) {
    int n1 = num1.charAt(i) - '0';
    for (int j = num2.length() - 1; j >= 0; j--) {
      int n2 = num2.charAt(j) - '0';
      int sum = (res[i + j + 1] + n1 * n2);
      res[i + j + 1] = sum % 10;
      res[i + j] += sum / 10;
    }
  }

  StringBuilder result = new StringBuilder();
  for (int i = 0; i < res.length; i++) {
    if (i == 0 && res[i] == 0) continue;
    result.append(res[i]);
  }
  return result.toString();
    
}
```



翻转字符串里的单词

```java

```

简化路径

复原ip地址

#### 数组与排序

三数之和

岛屿的最大面积

搜索旋转排列数组

最长连续递增序列

数组中的第K个最大元素

最长连续序列

第K个排列

朋友圈

合并区间

接雨水

### 链表与数

合并两个有序链表

```

```

翻转链表

```java
public ListNode reverseList(ListNode head) {
	ListNode prev = null;
  ListNode next = null;
  ListNode curr = head;
  while(curr!=null){
    next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  return prev;
}
```

两数相加

```

```

排序链表

```java

```

环形链表II

```java

```

相交链表

```java

```

合并k个升序链表

```java

```

二叉树的最近公共祖先

```java
public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
  	//如果root==null,或者p为root,q为root则最近公共祖先为root
    if(root==null||root==p||root==q)return root;
  	
  	TreeNode left = lowestCommonAncestor(root.left,p,q);
  	TreeNode right = lowestCommonAncestor(root.right,p,q);
  
  	if(left==null&&right==null){
      return null;
    }else if(left!=null&&right!=null){
      return root;
    }else{
      return left==null?right:left;
    }
}
```

二叉树的锯齿形层次遍历

### 动态或贪心

买卖股票的最佳时机

```java
public int maxProfit(int[] prices) {
  int maxProfit = 0;
  int minPrice = Integer.MAX_VALUE;
  for(int i = 0; i < prices.length; i++){
     minPrice = Math.min(minPrice, prices[i]);
     maxProfit = Math.max(maxProfit, prices[i] - minPrice);
  }
  return maxProfit;
}
```

买卖股票的最佳时机II

```java
public int maxProfit(int[] prices) {
  int sum = 0;
  for(int i =1; i < prices.length; i++){
    int profit = prices[i]-prices[i-1];
    if(profit>0) sum+=profit;
  }
  return sum;
}
```

最大正方形

最大子序和

三角形最小路径和

俄罗斯套娃信封问题

### 数据结构

最小栈

LRU缓存机制

全 O(1) 的数据结构

### 拓展练习

#### x 的平方根

##### 方法一：袖珍计算器算法

「袖珍计算器算法」是一种用指数函数 $\exp$ 和对数函数 $\ln$代替平方根函数的方法。我们通过有限的可以使用的数学函数，得到我们想要计算的结果。

我们将 $\sqrt{x}$ 写成幂的形式  $x^{1/2}$ ，再使用自然对数$e$进行换底，即可得到$\sqrt{x}=x^{1/2}=(e^{lnx})^{1/2}=e^{\frac{1}{2}lnx} $，这样我们就可以得到$\sqrt{x}$的值了

```java
public int mySqrt(int x) {
  if(x==0)return 0;
  int ans = Math.exp(0.5*Math.log(x));
  return (ans+1)*(ans+1)<=x?(ans+1):ans;
}
```





#### UTF-8 编码验证

第二高的薪水







## 五、必会框架



