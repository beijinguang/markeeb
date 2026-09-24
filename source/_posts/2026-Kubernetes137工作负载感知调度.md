---
title: Kubernetes v1.37：工作负载感知调度进入 Beta，AI 批处理开始拥有原生编排入口
date: 2026-09-09 08:01:00
categories: [云原生, Kubernetes]
tags: [Kubernetes, 调度, AI, 批处理, Gang Scheduling, PodGroup]
description: Kubernetes v1.37 将 Workload、PodGroup、工作负载感知抢占和 PodGroup 共享 DRA 资源声明推进到 Beta，并引入层级化的 CompositePodGroup。本文梳理 API 关系、特性门控和升级时需要注意的边界。
---

Kubernetes 官方在 2026 年 9 月 8 日发布文章，介绍 v1.37 在 Workload-Aware Scheduling（工作负载感知调度）上的进展。Workload、PodGroup、工作负载感知抢占，以及 PodGroup 共享 DRA ResourceClaim 都进入 Beta；同时新增的 CompositePodGroup API 让一个分布式任务可以用树形结构表达多层拓扑、成组调度和抢占策略。

这组变化和普通的调度器参数调整不太一样。它试图解决的是：一个 AI 训练任务或批处理任务由多个 Pod 组成时，如何把这些 Pod 当成一个有约束的工作负载来排队、放置和驱逐。对已经使用 JobSet、LeaderWorkerSet 或自定义控制器的团队来说，v1.37 值得先在测试集群里验证，但不能把 Beta 和 Alpha API 直接当成生产默认能力。

<!-- more -->

## 为什么单个 Pod 调度不够用了

Kubernetes 的基础调度单位是 Pod。这个模型对 Web 服务很自然：每个副本可以独立启动，先到的 Pod 先占用资源通常也没有问题。

AI 训练、分布式计算和一部分批处理任务则不同。一个任务可能包含 driver、worker 和参数服务器，只有当足够数量的 worker 同时就绪时，任务才有意义。如果调度器先放置了少量 worker，剩余 Pod 长时间排队，已经运行的部分只是在占用资源，并不能让任务真正开始。

Gang scheduling 的思路是把一组 Pod 当成一个整体，只有同时满足最低数量时才允许这组 Pod 被调度。Kubernetes v1.37 把 Workload 和 PodGroup API 推进到 `scheduling.k8s.io/v1beta1`，并让它们与 gang scheduling 一起进入 Beta。它不保证所有复杂调度问题都被解决，但至少把“这几个 Pod 属于同一个调度单元”提升成了 Kubernetes API 能理解的对象。

## v1.37 的核心对象如何配合

可以把这条链路理解成三层：

```text
Workload：描述长期有效的调度模板
    ↓
PodGroup：描述一次运行实例的调度策略和状态
    ↓
Pods：由工作负载控制器创建，并引用叶子 PodGroup
```

`Workload` 保存的是策略模板，例如 worker 至少需要 4 个 Pod 一起就绪；`PodGroup` 是某一次任务对应的运行时调度单元，记录调度策略和状态；Job 等工作负载控制器负责把模板转换成实际的 PodGroup 和 Pod。

一个最小的 PodGroup 示例是：

```yaml
apiVersion: scheduling.k8s.io/v1beta1
kind: PodGroup
metadata:
  name: training-workers
  namespace: default
spec:
  schedulingPolicy:
    gang:
      minCount: 4
```

这个示例只表达了最低同时调度数量。实际接入时，Pod 还需要通过调度组字段引用 PodGroup，工作负载控制器也要负责维护这组对象。Kubernetes 文档目前明确说明，Workload/PodGroup 功能默认关闭，集群管理员需要在相关组件上启用 `GenericWorkload` feature gate，并确保 `scheduling.k8s.io/v1beta1` API 可用。

因此，Beta 的含义是 API 和实现已经进入更适合试用的阶段，不代表升级集群后所有 Job 会自动获得 gang scheduling。是否启用、由哪个控制器创建 Workload，以及失败后的重试和清理逻辑，仍然属于平台团队需要负责的部分。

## PodGroup 进入调度队列，改变了什么

v1.37 的一个实现层变化是，PodGroup 不再只是 Pod 旁边的描述对象。以前，即使多个 Pod 属于同一个 PodGroup，调度队列仍然会把它们分别排队；现在，顶层 PodGroup 会成为队列中的对象，组内 Pod 共享队列行为。

这个变化的价值在于，调度器有了更明确的机会去回答“整组工作负载什么时候有资格尝试调度”。如果仍然把成员 Pod 分开排队，队列顺序和资源碎片会很容易把一个本来可以运行的任务拆散。把组放进队列后，后续的队列策略也有了稳定的扩展点。

v1.37 还允许修改 gang 的 `minCount`。这为弹性批处理留下了空间：集群资源紧张时，控制器可以降低最低可运行数量；资源恢复后，再把任务规模扩展回来。这里要特别注意，修改 `minCount` 只改变调度约束，不会自动为业务完成数据一致性、检查点恢复或 worker 数量伸缩。控制器需要把调度状态和任务本身的容错机制连接起来。

## 工作负载感知抢占不再只看单个 Pod

工作负载感知抢占（Workload-Aware Preemption，WAP）解决的是另一类问题：当一个高优先级工作负载无法放入集群时，调度器应该如何选择低优先级工作负载作为牺牲者，才能为整个任务腾出空间。

Kubernetes v1.37 将单独的 `WorkloadAwarePreemption` feature gate 合并进 `GenericWorkload`。官方文章还提到两项值得关注的调整：

- 评估抢占后能否容纳新工作负载时，调度算法不再为每个被恢复的牺牲者重复完整运行一次，而是先完成一次调度，再检查哪些牺牲者可以保留。
- 默认抢占开始理解 PodGroup 的 `disruptionMode`。当工作负载声明 `all` 时，调度器不会只驱逐组内一个 Pod，破坏这个工作负载的完整性。

v1.37 同时调整了 `disruptionMode` 的字段命名，让 PodGroup 与 CompositePodGroup 使用一致的 `all` 和 `single` 表达。早期试用过 alpha API 的团队，需要认真核对从 `v1alpha2` 到 `v1alpha3` 的迁移变化，不能只替换 `apiVersion` 后直接应用旧清单。

## CompositePodGroup：从平面分组走向层级调度

扁平的 PodGroup 可以表达“4 个 worker 一起调度”，但复杂任务常常还有更高一层的约束。例如，一个训练任务需要同时包含两个 worker 组；整个任务要放在同一个可用区，每个 worker 组又要尽量放在同一个机架。此时只有一层 PodGroup 不够表达。

Kubernetes v1.37 引入 `CompositePodGroup`，它把工作负载组织成树形结构：非叶子节点是 CompositePodGroup，叶子节点是 PodGroup。父节点可以约束子组的成组调度和拓扑，子节点继续表达各自的 Pod 数量和策略。调度器会把这棵层级结构当成一个有整体约束的工作负载来处理。

一个两层结构可以抽象成：

```text
训练任务
└── CompositePodGroup：至少两个子组同时可运行
    ├── PodGroup：worker-a，至少 4 个 Pod
    └── PodGroup：worker-b，至少 4 个 Pod
```

CompositePodGroup 在 v1.37 仍是 Alpha，API 位于 `scheduling.k8s.io/v1alpha3`，默认关闭，需要单独启用 `CompositePodGroup` feature gate。它适合在专门的调度测试集群里验证，不适合在没有回滚方案的生产集群中直接扩大使用范围。

## DRA 资源也可以按工作负载共享

对于 GPU、网络设备或其他由 Dynamic Resource Allocation（DRA）管理的设备，资源申请以前更容易落在单个 Pod 上。v1.37 将 PodGroup 共享 DRA ResourceClaim 推进到 Beta，PodGroup 可以引用一个 ResourceClaim，让组内多个 Pod 共享这项资源声明。

这和简单地给每个 Pod 都写一份设备申请不同。共享的资源生命周期与调度组绑定，更符合某些需要共同使用设备或设备分区的工作负载。平台团队仍然需要验证 DRA 驱动、设备分配策略和 PodGroup 的实际行为，尤其要确认失败重试、驱逐和任务清理时资源是否按预期释放。

## 给平台团队的升级清单

### 先确认 feature gate 和 API 版本

Workload 和 PodGroup 的文档状态是 Beta，但默认关闭；CompositePodGroup 是 Alpha，也默认关闭。升级前应明确由谁为 `kube-apiserver`、`kube-scheduler` 和相关控制器配置 feature gate，并在测试集群确认所有组件看到的是同一组能力。

### 把调度失败当成正常路径测试

至少准备三类场景：资源足够时整组同时运行，资源不足时整组保持等待，以及高优先级工作负载触发抢占。检查 PodGroup 的状态、事件、队列行为和被驱逐工作负载，不要只观察最终有没有 Pod 进入 Running。

### 评估控制器接入成本

Kubernetes v1.37 同时提供新的控制器集成 API 和 `workloadbuilder` Go 库，帮助集群外部控制器接入 Workload-Aware Scheduling。对于已经维护 JobSet、LeaderWorkerSet 或自定义 CRD 的团队，这比每个控制器单独复制一套调度逻辑更容易长期维护，但接入前仍要用自己的工作负载做兼容性和性能测试。

### 设计好弹性和中断策略

`minCount` 可变并不等于任务可以无损缩容，`disruptionMode: all` 也不等于任务永远不会被抢占。应该把检查点、重试、优先级、抢占策略和拓扑约束放到同一份运行手册里，避免调度器的决定与应用的恢复能力互相冲突。

## 结语

Kubernetes v1.37 的重点，是让调度器开始理解“一个任务由多组相互依赖的 Pod 组成”。Workload 和 PodGroup 进入 Beta，为常见的成组调度提供了更稳定的 API；CompositePodGroup 则把层级化拓扑和策略带进了 Alpha 阶段。它们能减少自定义调度控制器需要承担的基础工作，但也把队列、公平性、抢占和失败恢复这些问题更明确地暴露出来。

对使用 Kubernetes 承载 AI 训练和复杂批处理的团队来说，合适的下一步是建立一个小型验证集群，围绕 API 版本、feature gate、调度队列和抢占行为做可重复测试。等这些基础行为稳定后，再决定哪些工作负载值得迁移到原生 Workload-Aware Scheduling 上。

## 参考来源

- [Kubernetes v1.37: Advancing Workload-Aware Scheduling](https://kubernetes.io/blog/2026/09/08/kubernetes-v1-37-advancing-workload-aware-scheduling/)
- [Kubernetes 1.37 Release History](https://kubernetes.io/releases/1.37/)
- [Workload API](https://kubernetes.io/docs/concepts/workloads/workload-api/)
- [PodGroup API](https://kubernetes.io/docs/concepts/workloads/podgroup-api/)
- [CompositePodGroup API](https://kubernetes.io/docs/concepts/workloads/compositepodgroup-api/)
