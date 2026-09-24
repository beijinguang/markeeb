---
title: Kubernetes 1.37 给容器卷挂载加上 noexec：可写目录终于有了原生安全边界
date: 2026-09-18 08:01:00
categories: [云原生, 安全]
tags: [Kubernetes, 容器, 存储, emptyDir, Linux, 云原生, 安全]
description: Kubernetes 1.37 引入 VolumeBindMountOptions 和 EmptyDirVolumeMode 两个 Alpha 能力，为卷挂载增加 noexec、nosuid、nodev 和 Unix 权限模式。本文分析它们解决的问题、兼容条件和落地注意事项。
---

Kubernetes 官方在 9 月 16 日介绍了 1.37 中两项面向容器存储安全的能力：卷挂载可以设置 `noexec`、`nosuid`、`nodev` 等 bind mount 选项，`emptyDir` 也可以指定创建时的 Unix 权限模式。两项能力目前都是 Alpha，需要分别打开 `VolumeBindMountOptions` 和 `EmptyDirVolumeMode` 特性门控。

这次更新没有改变默认行为。省略新字段时，现有 Pod 仍按原来的方式工作；只有显式配置并满足节点、容器运行时和特性门控条件时，新的限制才会生效。它的价值在于，平台团队终于可以把“这个可写卷能不能执行程序、能不能解释设备文件、共享目录谁能删除谁的文件”写进 Pod 配置，而不必依赖 init container 里的 `chmod` 或节点上的手工挂载脚本。

<!-- more -->

## 为什么可写卷是一个容易被忽略的安全边界

很多容器安全基线会设置 `readOnlyRootFilesystem: true`，但应用通常仍需要一个可写目录存放临时文件、构建产物、缓存或日志。这个目录可能来自 `emptyDir`、PersistentVolume、CSI 卷或其他投影卷。

如果可写卷默认允许执行文件，一个已经被入侵的进程就可能下载二进制文件、修改权限，然后从卷挂载点直接运行它。根文件系统只读，并不能阻止这条路径。类似地，如果挂载没有 `nosuid` 或 `nodev`，某些特殊文件和权限位也可能扩大进程能够利用的内核接口。

Linux 的三个挂载标志各自限制不同的行为：

| 选项 | 作用 | 典型用途 |
| --- | --- | --- |
| `noexec` | 不允许直接执行挂载点上的二进制文件 | 临时目录、上传目录、缓存目录 |
| `nosuid` | 不让 set-user-ID 或 set-group-ID 位生效 | 不信任的共享卷 |
| `nodev` | 不把设备文件解释为字符或块设备 | 应用数据卷、临时工作区 |

这些限制并不是完整的沙箱。比如 `noexec` 主要阻止直接执行文件，不能替代 seccomp、Linux capabilities、用户命名空间或网络隔离。攻击者仍可能把脚本交给解释器运行，所以它应该被当成缩小攻击面的一层，而不是“一开就安全”的总开关。

## Kubernetes 1.37 新增了什么

### 1. 在卷挂载上声明 bind mount 选项

新的 `bindMountOptions` 字段位于 `volumeMounts` 中，可以把挂载时的安全选项和具体容器路径绑定起来：

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: hardened-volume
spec:
  containers:
    - name: app
      image: example/app:1.0
      volumeMounts:
        - name: scratch
          mountPath: /tmp
          bindMountOptions:
            - noexec
            - nosuid
            - nodev
  volumes:
    - name: scratch
      emptyDir: {}
```

官方说明称，这个能力可以用于 `emptyDir`、PersistentVolume、CSI 卷、ConfigMap、Secret 和其他卷类型，镜像卷是明确不支持的例外。它解决的是“卷被怎样 bind mount 到容器里”，和 PersistentVolume 的 `mountOptions` 不是同一层：后者通常由 CSI 驱动在节点上设置文件系统级选项，不一定能传递到容器内实际看到的 bind mount。

### 2. 为 `emptyDir` 指定创建权限

`emptyDir` 过去默认以 `0777` 创建目录。应用可以通过 init container 再执行一次 `chmod`，但这种方式增加了启动步骤，也不容易被策略系统稳定检查。现在可以直接在 `emptyDir` 上声明模式：

```yaml
volumes:
  - name: shared-workspace
    emptyDir:
      mode: 01777
```

`01777` 中多出来的最高位是 sticky bit。它适合多个容器共享临时目录的场景：每个容器都可以写入自己的文件，但不能随意删除其他用户创建的文件。对于只需要某个用户和组访问的临时数据，也可以考虑更窄的模式，例如 `0750`。

这个字段支持普通磁盘、`Memory` 和 `HugePages` 等 `emptyDir` medium。需要注意的是，如果 Pod 的安全上下文配置了 `fsGroup`，组权限可能会覆盖 `mode` 中对应的设置，最终权限仍应在实际节点上用 `ls -ld` 验证。

## Alpha 能力不是打开字段就够了

两项功能都需要在 API Server 和 kubelet 上打开对应特性门控：

```text
VolumeBindMountOptions
EmptyDirVolumeMode
```

此外，`bindMountOptions` 依赖容器运行时支持 CRI 的 `mount_options` 字段，并且能够通过 `runtimeFeatures` 对外声明能力。Kubernetes 会利用节点声明的功能来避免把 Pod 调度到不支持的节点；如果 Pod 最终到达了不兼容的节点，kubelet 应拒绝它，而不是悄悄忽略挂载选项。

`emptyDir.mode` 的版本偏差行为则更容易让人误判：如果 API Server 已打开特性门控，但 kubelet 没有打开，API 对象可能被接受，kubelet 却会忽略这个字段并回退到 `0777`。这意味着“对象成功写进 API Server”不等于“目录已经按预期加固”。

因此，启用前至少要同时确认：

- API Server 和 kubelet 使用的是预期的 1.37 配置；
- 所有可能承载目标 Pod 的节点运行时支持 CRI 挂载选项；
- 节点池没有混用会静默忽略 `emptyDir.mode` 的旧 kubelet；
- Windows 节点不会被误当成 Linux 挂载能力的等价环境。

这些标志和 Unix 权限是 Linux 概念。官方文档明确说明，Windows 节点不会应用 `bindMountOptions`，`emptyDir` 的 `mode` 在 Windows 上也会跳过。

## 对哪些工作负载最有帮助

### 临时工作目录和上传目录

编译缓存、解压目录和用户上传目录往往需要写权限，却没有理由允许直接运行其中的程序。对这些挂载使用 `noexec`、`nosuid`，通常比依赖应用代码“记得不要执行上传文件”更容易形成基础约束。

### 多容器 Pod 共享工作区

CI/CD Pod 经常让构建容器、日志 sidecar 和产物收集容器共享一个 `emptyDir`。如果所有容器都能删除任意文件，一个被攻破的 sidecar 就可能破坏构建产物，甚至干扰其他容器的工作。`01777` 可以提供更接近传统 `/tmp` 的 sticky bit 语义，但仍应结合用户、组和容器之间的实际协作关系来设计。

### 需要较强数据隔离的临时存储

数据库、编译器或数据处理任务有时会创建只供特定用户和组访问的临时目录。把权限模式写在 Pod 规格中，比让每个镜像自己执行一套不一致的初始化脚本更容易审查，也更适合通过准入策略检查。

## 上线前不要直接对全局工作负载放行

新能力仍在 Alpha 阶段，最稳妥的做法是从一个可回滚的节点池和少量工作负载开始：

1. **先盘点卷用途**：列出所有 `emptyDir` 和其他可写卷，区分临时文件、构建产物、上传内容和确实需要执行文件的目录。
2. **先做兼容测试**：在测试节点上验证二进制是否仍从预期路径运行，尤其关注 JIT、构建系统、脚本解释器和 sidecar。
3. **再启用特性门控**：让 API Server、kubelet 和运行时配置保持一致，确认节点功能声明已被集群识别。
4. **检查失败方式**：观察不支持节点上的调度、kubelet 事件和工作负载重启，不要只看 Pod 对象是否被接受。
5. **建立逐步策略**：先保护上传目录和普通临时目录，再根据应用证据扩大范围；确实需要执行文件的卷不要强行套用 `noexec`。

还要把它和其他防护组合起来。只读根文件系统、非 root 用户、seccomp、AppArmor/SELinux、最小 capabilities、网络策略和镜像供应链检查，解决的是不同层次的问题。卷挂载选项能减少一条利用路径，却不能替代这些基础控制。

## 结语

Kubernetes 1.37 的这两项 Alpha 能力，补上了容器卷安全中一个长期不够顺手的缺口：平台终于可以直接声明挂载的执行和设备语义，也可以在创建 `emptyDir` 时给出明确的 Unix 权限，而不必把安全要求藏在 init container 和节点脚本里。

对开发者而言，最值得先做的不是马上给所有卷加上 `noexec`，而是弄清每个可写目录的真实用途。能写不等于能执行，能共享也不等于任何容器都能删除彼此的文件。把这些边界写进 Pod 配置，再用运行时能力、版本偏差和实际测试验证它们，才是这次更新真正适合落地的方式。

## 参考来源

- [Kubernetes Blog：Kubernetes v1.37—Hardening Container Storage with Bind Mount Options and EmptyDir Permissions](https://kubernetes.io/blog/2026/09/16/kubernetes-v1-37-hardening-container-storage/)
- [Kubernetes Docs：Configure bind mount options](https://kubernetes.io/docs/tasks/configure-pod-container/configure-bind-mount-options/)
- [Kubernetes Docs：Volumes—emptyDir](https://kubernetes.io/docs/concepts/storage/volumes/#emptydir)
