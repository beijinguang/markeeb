网关



作用：可以实现





### Zuul与GateWay有什么区别

Zuul网关属于Nettfix公司开源框架，需要第一代微服务网关

GateWay属于SpringCloud自己研发的网关框架，属于第二代网关



相比来说GateWay比Zuul网关性能好

Zuul网关底层基于Servlet实现的，阻塞式api，不支持长连接

SpringCloudGateWay基于Spring5构建，能够实现响应式非阻塞式api，支持长连接，更好的支持Spring系列产品，依赖Springboot-webflux。





### 网关与Nginx的区别

相同点：都可以实现api拦截，负载均衡，反向代理，请求过滤等



不同点：Nginx采用c语言

