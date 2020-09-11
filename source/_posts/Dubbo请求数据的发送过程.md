### Dubbo请求数据的发送过程

调用过程（IMAF FLADR HHAANN） （3invoke + doInvoke）*2+3request+3send+write

Proxy0#sayHello(String)

​	->InvokerInvocationHandle#invoke

​		->MockClusterInvoker#invoke

​			->AbstractClusterInvoker#invoke

​				->FailoverClusterInvoker#doInvoke

​					->Filter#invoke

​						->ListenerInvokerWrapper#invoke

​							->AbstractInvoker#invoke

​								->DubboInvoker#doInvoke

​									->ReferenceCountExchangeClient#request

​										->HeadExchangeClient#request

​											->HeadExchangeChannel#request

​												->AbstractPeer#send

​													->AbstractClient#send

​														->NettyChannel#send

​															->NioClientSocketChannel#write





调用服务(NAMHAE)  messageReceved+receved*4+execute

NettyHandler#messageReceived(ChannelHandlerContext, MessageEvent)  

​	—> AbstractPeer#received(Channel, Object)    

​		—> MultiMessageHandler#received(Channel, Object)      

​			—> HeartbeatHandler#received(Channel, Object)        

​				—> AllChannelHandler#received(Channel, Object)          

​					—> ExecutorService#execute(Runnable)    // 由线程池执行后续的调用逻辑