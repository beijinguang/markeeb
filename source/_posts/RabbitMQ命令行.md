---
title: RabbitMQ命令行
categories: [RabbitMQ]
tags: [RabbitMQ,消息队列]
date: 2020-06-04 14:13:09
description:
---
<!-- more -->

## RabbitMQ命令行

RabbitMQ附带多个命令行工具：

- 用于服务管理和一般操作员任务的[ rabbitmqctl](https://www.rabbitmq.com/rabbitmqctl.8.html)
- 用于诊断和[健康检查的](https://www.rabbitmq.com/monitoring.html)[rabbitmq-diagnostics](https://www.rabbitmq.com/rabbitmq-diagnostics.8.html)
- 用于[插件管理的](https://www.rabbitmq.com/plugins.html)[rabbitmq-plugins](https://www.rabbitmq.com/rabbitmq-plugins.8.html)
- 用于[队列](https://www.rabbitmq.com/queues.html)（尤其是[仲裁队列）](https://www.rabbitmq.com/quorum-queues.html)维护任务的[ rabbitmq](https://www.rabbitmq.com/rabbitmq-queues.8.html)[队列](https://www.rabbitmq.com/quorum-queues.html)
- [rabbitmq-upgrade](https://www.rabbitmq.com/rabbitmq-upgrade.8.html)用于与[升级](https://www.rabbitmq.com/upgrade.html)相关的维护任务

它们可以在安装根目录的sbin目录下找到。

- 创建交换机

```sh
rabbitmqctl eval 'rabbit_exchange:declare({resource, <<"test">>, exchange, <<"ac.exchange.alarm">>}, direct, true, false, false, []).'
```

- 创建队列

```sh
rabbitmqctl eval 'rabbit_amqqueue:declare({resource, <<"test">>, queue, <<"ac.queue.alarm">>}, true, false, [], none).'
```

- 绑定队列和交换机

```sh
rabbitmqctl eval 'rabbit_binding:add({binding, {resource, <<"test">>, exchange, <<"ac.exchange.alarm">>}, <<"ac.routing.key.alarm">>, {resource, <<"test">>, queue, <<"ac.queue.alarm">>}, []}).'
```

这三条命令执行后的最终结果是：在 test 虚拟主机下创建了 direct 类型的，持久化的，名为 ac.exchange.alarm 的exchange，创建了持久化的，名为 ac.queue.alarm 的queue，该队列以 ac.routing.key.alarm 的routing key绑定到了 ac.exchange.alarm 这个exchange上。其他参数为默认值.
