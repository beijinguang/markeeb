---
title: Kubernetes 不再内置 Docker：真正被移除的到底是什么
date: 2021-02-18 20:21:00
updated: 2026-08-11 12:00:00
categories: [云原生]
tags: [Kubernetes, Docker, containerd, 云原生]
description: 回看 2021 年关于 Kubernetes 移除 dockershim 的争论：容器镜像没有失效，改变的是运行时边界和运维责任。
---

2021 年，云原生社区里最容易引发误读的一句话是：“Kubernetes 不支持 Docker 了。”不少团队第一反应是镜像要重做、Dockerfile 要废弃，甚至担心已有容器无法运行。

事情远没有这么戏剧化。Kubernetes 要移除的是 kubelet 内部为 Docker Engine 维护的适配层 `dockershim`，不是 OCI 镜像，也不是用 Docker 构建镜像的工作流。

<!-- more -->

## 先分清三个经常混在一起的概念

Docker 带给开发者的是一整套体验：构建镜像、管理镜像、运行容器、查看日志。Kubernetes 真正关心的只是“如何让节点启动和停止容器”，因此它通过 CRI（Container Runtime Interface）与运行时交互。

containerd 和 CRI-O 可以直接实现 CRI。Docker Engine 当时没有直接实现这一接口，Kubernetes 便在 kubelet 里维护了一层 dockershim 做翻译。随着 containerd 成熟，这层特殊兼容代码的收益越来越小，维护和测试成本却一直存在。

所以迁移后依然可以：

- 用 Dockerfile 描述构建过程；
- 用 Docker、BuildKit 或 CI 构建 OCI 镜像；
- 把镜像推送到原来的仓库；
- 在 Kubernetes 中拉取并运行这些镜像。

变化发生在节点内部：容器由 containerd 或 CRI-O 直接管理，不再绕过 Docker Engine。

## 为什么一个“内部实现”会影响运维

如果应用只是标准地读写 stdout、使用网络和挂载卷，切换往往没有感觉。真正需要检查的是那些穿透抽象层的做法，例如在宿主机挂载 `/var/run/docker.sock`、直接调用 Docker API、依赖特定日志路径，或者用 `docker ps` 当作节点诊断的唯一手段。

这类问题提醒我：平台提供了抽象，不代表我们天然就在抽象之内。日常操作越依赖某个具体实现，未来替换它时付出的成本越高。

迁移前更可靠的清单应该包括：确认节点运行时、盘点监控和安全代理、验证日志采集、测试镜像与存储、替换只认识 Docker 的脚本，并准备可以回退的节点池。对生产集群来说，“能启动 Pod”只是开始，能观测、能排障、能审计才算迁移完成。

## 我的理解：成熟平台会不断删除自己的特例

dockershim 的离场不是 Docker 的失败，而是云原生边界变得更清楚。早期生态为了快速普及，核心项目会吸收大量兼容逻辑；生态成熟后，则需要把通用接口留下，把厂商或产品特例移出去。

好的架构并不是永远兼容所有历史选择，而是给变化安排清晰的边界。CRI 的价值也不在于名字多漂亮，而在于 Kubernetes 可以专注编排，运行时可以独立演进，开发者仍然使用开放的镜像格式。

这件事还给团队一个很实际的提醒：不要把“行业标准”“产品品牌”和“当前实现”当成同一件事。掌握 Docker 命令很有用，理解 OCI、CRI、cgroup 和 namespace，才更接近容器技术不会过期的部分。

## 参考资料

- [Kubernetes Blog：Don't Panic—Kubernetes and Docker](https://kubernetes.io/blog/2020/12/02/dont-panic-kubernetes-and-docker/)
- [Kubernetes 文档：Container Runtimes](https://kubernetes.io/docs/setup/production-environment/container-runtimes/)

> 本文是 2026 年整理断更期时写下的回顾，发布日期按事件所处阶段归档。
