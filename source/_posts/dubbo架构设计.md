### dubbo架构设计



![image-20200821100631881](https://gitee.com/idea4j/imagerep/raw/master/images/image-20200821100631881.png)



淡蓝色是服务提供者使用到的接口，淡绿色是服务消费者使用接口，中轴线上是双方都用到的接口。

从下至上分为十层，各层均为单向依赖，右边的黑色箭头代表之间的依赖关系，每一层都可以剥离上层被复用，其中，Service和Config层为API，其他各层均为SPI。

绿色小块的为扩展接口，蓝色小块为实现类

蓝色虚线为初始化过程，即启动时组装链，红色实线为方法调用过程，即运行是调用链，紫色三角箭头为继承



config配置层：对外配置接口，以ServiceConfig,ReferenceConfig为中心，可以直接初始化配置类，也可以通过spring解析配置生成配置类

proxy服务代理层

registry注册中心层

cluster路由层

monitor监控层

ptotocol远程调用层

exchange信息交换层

transport网络传输层

serialize 数据序列化层