---
title: Netty
categories: [Netty]
tags: [Netty]
date: 2017-07-24 17:22:10
description:
---

<!-- more -->

Netty

What is Netty?

Netty is an asynchronous event-driven network application framework for rapid development of maintainable high performance protocol servers & clients.

![image-20200721113424540](C:\Users\Administrator\AppData\Roaming\Typora\typora-user-images\image-20200721113424540.png)

Unix 提供的5种I/O模型：

- 阻塞I/O模型：
- 非阻塞I/O模型：
- I/O复用模型：
- 信号驱动模型：
- 异步I/O:



NIO服务端时序图

```sequence
NioServer->NioServer: 1.打开ServerSocketChannel 
NioServer->NioServer: 2.绑定监听地址InetSocketAddress
Reactor Thread->Reactor Thread: 3.创建Selector，启动线程
NioServer->Reactor Thread: 4.将ServerSocketChannel注册到Selector，监听SelectionKey.OP_ACCEPT
Reactor Thread->Reactor Thread:5.Selector轮询就绪的Key
IoHandler->Reactor Thread: 6.handlerAccept()处理新的客户端接入
IoHandler->IoHandler: 7.设置新客户端连接的Socket参数
IoHandler->Reactor Thread:8.向Selector注册监听读操作SelectionKey.OP_READ
Reactor Thread->IoHandler: 9.handleRead()异步读消息到ByteBuffer
IoHandler->IoHandler: 10.decode请求消息
IoHandler->Reactor Thread: 11.异步写ByteBuffer到SocketChannel
```


```java
//第一步：打开ServerSocketChannel，用于监听客户端的连接，它是所有客户端的父管道
ServerSocketChannel acceptorSvr = ServerSocketChannel.open();
//第二步，绑定监听端口，设置连接为非阻塞模式
acceptorSvr.socket().bind(new InetSocketAddress(InetAddress.getByName("IP"),port));
acceptorSvr.configureBlocking(false);
//第三步,创建Reactor线程，创建多路复用器并启动线程
Selector selector = Selector.open();
New Thread(new ReactorTask()).start();
//第四步，将ServerSocketChannel注册到Reactor线程的多路复用器Selector上，监听ACCEPT事件
SelectionKey key = acceptorSvr.register(selector,SelectionKey.OP_ACCEPt,ioHandler);
//第五步，多路复用器在线程run方法的无限循环体内轮询准备就绪的key
int num = selector.select();
Set selectedKeys = selector.selectedKeys();
Iterator it = selectedKeys.iterator();
while(it.hasNext()){
    SelectionKey key = (SelectionKey)it.next();
    // ... deal with I/O event ...
}
//第六步，多路复用器监听到有新的客户端接入，处理新的接入请求，完成TCP三次握手，建立物理链路
SocketChannel channel = svrChannel.accept();
//第七步，设置客户端链路为非阻塞模式
channel.configureBlocking(false);
channel.socket().setReuseAddress(true);
//第八步，将新接入的客户端连接注册到Reactor线程的多路复用器上，监听读操作，用来读取客户端发送的网络消息
SelectionKey key = socketChannel.register(selector,SelectionKey.OP_READ,ioHandler);
//第九步，异步读取客户端请求消息到缓冲区
int readNumber = channel.read(receivedBuffer);
//第十步，对ByteBuffer进行编码，如果有半包消息指针reset，继续读取后续的报文，将解码成功的消息封装成Task，投递到业务线程池中，进行业务逻辑编排
Object message = null;
while(buffer.hasRemain()){
    byteBuffer.mark();
    Object message = decode(byteBuffer);
    if(message == null){
        byteBuffer.reset();
        break;
    }
    messageList.add(message);
}
if(!byteBuffer.hasRemain()){
    byteBuffer.clear();
}else{
    byteBuffer.compact();
}
if(messageList !=null &!messageList.isEmpty()){
    for(Object messageE : messageList){
        handlerTask(messageE);
    }
}
//第十一步，将POJO对象encode成ByteBuffer，调用SocketChannel的异步write接口，将消息异步发送给客户端
socketChannel.write(buffer);


```



NIO客户端时序图

```sequence
NioClient->NioClient:1.打开SocketChannel
NioClient->NioClient:2.设置SocketChannel为非阻塞模式，同时设置TCP参数
NioClient->server:3.异步连接服务端
NioClient->NioClient:4.判断连接结果，如果连接成功，调到步骤10，否则执行步骤5
NioClient->Reactor Thread:5.向Reactor线程的多路复用器注册OP CONNECT事件
Reactor Thread->Reactor Thread:6.创建Selector，启动线程
Reactor Thread->Reactor Thread:7.Selector轮询就绪的Key
Reactor Thread->IoHandler:8.handerConnect()
IoHandler->IoHandler:9.判断连接是否完成，完成执行步骤10
IoHandler->Reactor Thread:10.向多路复用器注册读事件OP_READ
Reactor Thread->IoHandler:11.handleRead()异步读请求消息到ByteBuffer
IoHandler->IoHandler:12.decode请求消息
IoHandler->Reactor Thread:13.异步写ByteBuffer到SocketChannel
```





