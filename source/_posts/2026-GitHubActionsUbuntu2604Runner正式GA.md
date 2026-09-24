---
title: GitHub Actions Ubuntu 26.04 Runner 正式 GA：ubuntu-latest 迁移前如何守住构建可重复性
date: 2026-09-20 08:01:00
categories: [软件工程, DevOps]
tags: [GitHub Actions, Ubuntu, CI/CD, Runner, Linux, 可重复构建]
description: GitHub Actions 的 Ubuntu 26.04 hosted runner 已正式可用，并开始成为 ubuntu-latest 的迁移目标。本文解释镜像标签、运行环境和自托管 Runner 的差异，并给出一套低风险迁移与验证方法。
---

GitHub Actions 的 Ubuntu 26.04 runner 已经结束 Public Preview，进入 General Availability。与此同时，`ubuntu-latest` 将迁移到 Ubuntu 26.04。对很多工作流来说，配置文件可能一行都不用改，但实际运行环境已经发生变化：系统库、预装工具、编译器、容器运行时和默认语言版本都可能跟着镜像更新。

这次变化值得关注的地方，不是“Ubuntu 又升级了一个版本”，而是 CI 中最常见的一个便利标签开始指向新的操作系统。只要工作流仍然使用 `runs-on: ubuntu-latest`，构建环境就不是完全固定的。开发者现在需要做的，是决定哪些流水线可以跟随迁移，哪些流水线必须先固定版本，并用一次可重复的探测和回归测试把差异找出来。

<!-- more -->

## 背景：`ubuntu-latest` 本质上是一个会移动的别名

GitHub-hosted runner 通常通过 `runs-on` 选择运行环境。最省事的写法是：

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
```

它表达的是“使用 GitHub 当前推荐的 Ubuntu 镜像”，而不是“永远使用某一个 Ubuntu 版本”。当 GitHub 将别名从一个长期支持版本迁移到另一个版本时，工作流文件不变，底层执行环境却会改变。

这种设计对大多数项目很方便。团队可以自动获得新的系统补丁、工具链和硬件支持，不必手动维护每一台构建机。但它也带来一个容易被忽略的事实：`ubuntu-latest` 更像一个发布通道，而不是一个版本锁。

一个依赖系统环境的构建可能同时受到这些变化影响：

- C/C++、Rust 或 Node.js 原生扩展使用的编译器、链接器和系统库；
- Python、Node.js、Java 等预装运行时及其默认路径；
- OpenSSL、libffi、图形库和数据库客户端等动态依赖；
- Docker、缓存 Action 和包管理器对目录、权限或文件系统行为的假设；
- ARM64 与 x64 架构下的二进制依赖、预编译包和测试结果。

因此，“工作流没有改动”不等于“构建输入没有改动”。

## Ubuntu 26.04 runner 这次改变了什么

GitHub 在 2026 年 9 月 17 日的 Changelog 中宣布 Ubuntu 26.04 runner 正式可用，并将其纳入 `ubuntu-latest` 的迁移计划。对使用 GitHub-hosted runner 的项目，可以把变化拆成三层理解。

### 1. `ubuntu-26.04` 从预览能力变成可用于生产的标签

Public Preview 阶段适合验证兼容性，但不应该被当作稳定的生产基线。现在 `ubuntu-26.04` 已经进入 GA，意味着团队可以把它写进明确的测试或生产工作流，并按照 GitHub-hosted runner 的镜像发布节奏进行维护。

这里的“正式可用”不代表镜像中的每个预装软件版本永远不变。Runner image 仍会持续更新补丁和工具版本。它解决的是操作系统标签和服务可用性的问题，不是替应用锁定完整的软件供应链。

### 2. `ubuntu-latest` 会发生迁移，而不是新增一个静态别名

如果工作流使用 `ubuntu-latest`，它会随着 GitHub 的迁移计划转向 Ubuntu 26.04。这个别名适合愿意持续跟进平台变化、并且已经有充分回归测试的项目；对于发布库、构建桌面安装包或编译大量原生依赖的项目，不能只依赖“最新”二字来保证可重复构建。

迁移期间还要注意一个工程现实：标签切换通常是一个发布过程，不应假设所有任务在同一时刻、以完全相同的环境完成切换。只要一个项目的测试和发布链路跨越了迁移窗口，就应该把操作系统版本作为诊断信息记录下来。

### 3. hosted runner 与自托管 Runner 是两条不同的迁移路径

`ubuntu-26.04` 是 GitHub-hosted runner 的镜像标签。使用自托管 Runner 的团队，不会因为把 GitHub Actions 的标签写成某个版本，就自动得到一台 Ubuntu 26.04 主机。

自托管环境仍然由团队负责操作系统升级、Runner 软件版本、工具链安装、缓存清理和回滚策略。如果工作流使用的是自定义标签，例如 `self-hosted`、`linux` 或 `arm64`，迁移时应先盘点这些标签背后到底有哪些机器，避免把 GitHub-hosted 的镜像公告误当作自有基础设施已经升级。

## 不要只比较 Ubuntu 版本号，要比较构建输入

操作系统迁移最容易出现的误区，是只在日志里找一行 `Ubuntu 26.04`，然后认为兼容性检查已经完成。真正有价值的比较应该覆盖构建实际使用的输入。

可以至少检查以下几类信息：

| 类别 | 建议记录的内容 | 常见风险 |
| --- | --- | --- |
| 操作系统 | `/etc/os-release`、内核、架构 | 包名称、默认行为或架构分支变化 |
| 编译工具 | GCC/Clang、Make、CMake、Rust | 原生扩展编译失败或警告变成错误 |
| 语言运行时 | Node.js、Python、Java、Go | 默认版本改变导致依赖解析或语法行为变化 |
| 系统库 | OpenSSL、glibc、libstdc++、图形库 | 动态链接失败、ABI 或 TLS 行为差异 |
| 容器环境 | Docker Engine、Buildx、Compose | 构建缓存、权限和多架构构建差异 |
| Action 与缓存 | Action 版本、缓存键、路径 | 缓存命中但内容不兼容，或旧 Action 行为异常 |

GitHub 提供的 runner image 仓库会公开镜像内容和变更记录。排查问题时，应该把失败任务对应的镜像版本、工作流提交和依赖锁文件一起保存，而不是只保留最后一段报错。

## 一套低风险的迁移方法

### 第一步：先找出所有使用移动标签的工作流

不要只搜索默认分支。工作流可能位于复用工作流、发布分支和示例目录中，可以先做一次仓库级盘点：

```bash
rg -n "runs-on:|ubuntu-latest|ubuntu-[0-9]+\.[0-9]+" \
  .github/workflows .github/actions 2>/dev/null
```

将结果分成三类：可以直接跟随迁移的普通测试、对原生依赖敏感的构建，以及发布或生产部署任务。第三类不应该因为标签方便就自动升级。

### 第二步：用矩阵同时比较旧版和新版

在独立的验证工作流中，让相同的步骤分别运行在 `ubuntu-24.04` 和 `ubuntu-26.04`。下面的例子只探测关键环境，实际项目还应接上完整的编译、测试和打包步骤：

```yaml
name: runner-compatibility

on:
  workflow_dispatch:

jobs:
  probe:
    strategy:
      fail-fast: false
      matrix:
        os: [ubuntu-24.04, ubuntu-26.04]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v5

      - name: Inspect runner
        run: |
          set -eux
          echo "runner=${{ matrix.os }}"
          cat /etc/os-release
          uname -a
          uname -m
          node --version || true
          python3 --version || true
          gcc --version | head -n 1 || true
          docker version || true

      - name: Run project verification
        run: ./ci/verify.sh
```

`actions/checkout` 的版本只是示例，团队应按自己的 Action 维护策略选择版本。更重要的是，验证矩阵中的两条路径必须运行同一套脚本，不能为了让新版“通过”而悄悄跳过测试。

### 第三步：把容易漂移的依赖显式化

Runner 版本固定后，仍然有很多输入可能漂移。迁移时可以顺便检查：

- 使用 `package-lock.json`、`poetry.lock`、`Cargo.lock` 等锁文件；
- 对 `setup-node`、`setup-python`、`setup-java` 等 Action 明确指定运行时版本；
- 固定 Docker 基础镜像的 digest，至少为发布构建保留可追溯版本；
- 为缓存键加入操作系统和架构，例如 `ubuntu-26.04-arm64`；
- 把生成物中的编译器、系统版本和 Git 提交写进构建元数据；
- 将发布构建与普通 PR 构建分开，给发布链路更长的验证窗口。

尤其要小心缓存。缓存命中会让一次不兼容的旧产物继续参与构建，从而把“镜像升级造成的问题”伪装成随机失败。迁移初期宁可使用带新版本标识的缓存键，也不要让旧系统生成的二进制产物直接复用到新系统。

### 第四步：决定哪些工作流应该固定版本

并不是所有任务都需要同一种策略：

| 工作流类型 | 建议 |
| --- | --- |
| 纯脚本、无原生依赖的快速检查 | 可以继续使用 `ubuntu-latest`，但保留失败诊断信息 |
| 编译原生扩展、生成安装包 | 在完成回归前使用显式版本标签 |
| 面向多个发行版的兼容性测试 | 把 `ubuntu-24.04` 和 `ubuntu-26.04` 都纳入矩阵 |
| 正式发布、合规构建、需要复现历史产物 | 固定版本，并记录镜像与工具链信息 |
| 自托管 Runner | 单独维护操作系统、Runner 和工具链升级流程 |

固定 `ubuntu-24.04` 不是拒绝升级，而是把升级从一次隐式漂移改成一次可以安排、评审和回滚的变更。等新版验证完成后，再由平台团队主动切换到 `ubuntu-26.04`，通常比等发布流水线突然失败更容易控制。

## 对团队 CI 治理的启示

这次迁移再次说明，CI Runner 不是一个透明的执行盒子，而是软件供应链的一部分。编译器、系统库、容器运行时和预装命令都会影响最终产物；只要它们没有被记录，构建就很难真正复现。

对于平台团队，比较实用的做法是建立一张 Runner 清单，至少包括工作流文件、操作系统标签、架构、语言运行时、缓存策略和升级负责人。对于应用团队，则应把“升级 Runner 后重新跑一次完整验证”写进变更流程，而不是把所有兼容性问题归结为某个依赖包偶发失效。

还要把日志可观测性提前做好。每次构建输出操作系统、架构、主要工具版本和工作流提交后，排查“同一个提交为什么今天失败”会简单很多。对于正式发布，最好把这些信息作为构建证明或制品元数据的一部分保存下来。

## 结语

Ubuntu 26.04 runner 正式 GA 是一个值得采用的新基线，但 `ubuntu-latest` 的迁移也提醒我们：方便的别名不等于稳定的版本契约。短期内最稳妥的动作，是盘点移动标签、用矩阵比较新旧镜像、刷新缓存键，并把发布链路从隐式跟随迁移改成显式验证。

当 Runner 的操作系统、架构和工具链都能被记录，Ubuntu 26.04 就不再是一次不可预期的 CI 波动，而会成为一项可以测试、批准和回滚的基础设施升级。

## 参考来源

1. GitHub Changelog： [Ubuntu 26.04 now generally available and `ubuntu-latest` migration](https://github.blog/changelog/2026-09-17-ubuntu-26-generally-available-and-latest-migration)
2. GitHub Actions Runner Images： [官方镜像仓库与变更记录](https://github.com/actions/runner-images)
3. GitHub Docs： [GitHub-hosted runners](https://docs.github.com/en/actions/using-github-hosted-runners/about-github-hosted-runners)
