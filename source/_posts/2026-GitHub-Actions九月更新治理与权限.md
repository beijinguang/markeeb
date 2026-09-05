---
title: GitHub Actions 九月更新：Runner 弃用可查询，CI 权限和复用工作流更容易收紧
date: 2026-09-05 08:01:00
categories: [软件工程, DevOps, 安全]
tags: [GitHub Actions, CI/CD, DevOps, Runner, Dependabot, 可复用工作流, 软件供应链]
description: GitHub Actions 新增 Runner 版本生命周期 API、vulnerability-alerts 最小权限和可复用工作流来源上下文。本文分析三项更新如何帮助团队安排 Runner 升级、收紧 GITHUB_TOKEN，并追踪真正定义作业的工作流。
---

CI 出问题时，团队经常要回答三个看似简单的问题：某个 Runner 什么时候不能再接任务，工作流到底读了哪些安全信息，这个作业究竟由哪一个工作流文件定义。9 月 3 日，GitHub 为 Actions 发布了一组集中更新，分别给出了这三个问题更明确的接口：可以查询 Runner 版本的两个弃用时间，可以只授予工作流读取 Dependabot 警报的权限，也可以在可复用工作流中直接取得定义当前作业的仓库、提交和文件路径。

这些变化没有增加一个新的编程框架，却把 CI 从“能跑起来”往“能计划、能限权、能追溯”推进了一步。对使用自托管 Runner、自动处理依赖告警，或把发布流程封装成可复用工作流的团队来说，今天就可以开始改造，而不必等一次事故来暴露这些信息缺口。

## 背景：CI 的复杂度正在从脚本里长出来

早期的流水线通常只服务一个仓库，Runner 版本也由维护者手动升级。随着团队把构建、发布、Dependabot 处理和部署流程拆成可复用组件，CI 的运行时关系变得更长：调用者触发一个工作流，工作流调用另一个仓库里的工作流，后者再使用组织级 Runner 和 `GITHUB_TOKEN` 访问安全接口。

链路一长，三个问题就会变得具体起来：

- Runner 仍然能注册，不代表它还能在未来接收作业；
- 能读取仓库 API，不代表工作流只获得了它真正需要的那一类数据；
- 调用工作流的仓库，不一定是实际定义当前作业的仓库。

GitHub 这次把对应信息补到了 API、权限模型和上下文对象里。它们适合被纳入现有的 CI 管理脚本和审计记录，不适合被当作“打开一个新开关就自动安全”的产品功能。

## 一、Runner 弃用 API：把升级计划从猜测变成查询

GitHub Actions 新增了 Runner 版本生命周期查询 API。针对仓库、组织或企业，可以用 Runner 版本查询它的注册和运行时弃用时间。仓库级接口的形式是：

```http
GET /repos/OWNER/REPO/actions/runners/deprecations/VERSION
```

组织级接口是：

```http
GET /orgs/ORG/actions/runners/deprecations/VERSION
```

返回结果包含三个关键字段。下面是字段示意，具体日期由 GitHub 按 Runner 版本返回：

```json
{
  "runner_version": "2.x.y",
  "registration_deprecates_at": "ISO 8601 时间或 null",
  "runtime_deprecates_at": "ISO 8601 时间或 null"
}
```

两个日期代表不同的风险窗口。`registration_deprecates_at` 之后，使用该版本的 Runner 不能再注册；`runtime_deprecates_at` 之后，GitHub 不再把新的作业派发给该版本的 Runner。它们不一定同时发生，所以只监控“还能不能注册”会漏掉真正影响构建的运行时截止时间。

这对自托管 Runner 尤其有用。团队可以定期收集在线 Runner 的版本，调用接口计算剩余时间，再把结果写入内部资产清单或告警系统。升级策略也可以从“每隔几个月集中处理一次”改为“按版本和截止日期分批滚动升级”。

需要留意的是，这个 API 查询的是某个具体版本的生命周期，不是返回所有 Runner 的升级列表。实际接入时仍要先完成 Runner 资产盘点，再逐个查询版本；接口访问也需要与仓库、组织或企业范围对应的读取权限。

## 二、`vulnerability-alerts`：给 Dependabot 一把更窄的钥匙

很多自动化工具会读取 Dependabot 警报，生成摘要、创建任务，或者根据漏洞严重程度安排升级。过去，工作流为了调用相关 API，容易直接使用较宽的 `GITHUB_TOKEN` 权限。现在可以单独声明：

```yaml
permissions:
  contents: read
  vulnerability-alerts: read
```

`vulnerability-alerts` 只支持 `read` 和 `none`，不支持 `write`。当工作流只需要读取 Dependabot 警报时，这个权限把意图写在了配置里，也把误授予写权限的可能性压低了。GitHub 文档还说明，如果在工作流中显式设置了部分权限，没有列出的权限会被设为 `none`，所以团队应把任务真正需要的权限一起写清楚。

这里有一个容易混淆的边界：`vulnerability-alerts` 用于读取 Dependabot 警报，不负责读取 Secret Scanning 警报。后者需要使用 GitHub App 或个人访问令牌等其他授权方式。把两个“安全告警”混成一个权限，往往会导致工作流权限过宽，或者排查时误以为 API 出错。

这个变化适合放进依赖维护工作流。例如，工作流可以读取 Dependabot 警报并生成一份摘要，但不需要获得写代码、合并拉取请求或修改仓库设置的能力。权限越接近具体任务，审查 `permissions` 块时就越容易发现异常。

## 三、可复用工作流新增 `job.workflow_*` 上下文

可复用工作流解决了流程共享问题，却也带来一个身份判断问题：一个作业是被哪个仓库调用的，和它实际由哪个工作流文件定义，可能不是同一件事。

GitHub Actions 现在为 `job` 上下文增加了四个属性：

| 属性 | 含义 |
| --- | --- |
| `job.workflow_ref` | 定义当前作业的工作流文件完整引用，包含仓库和 ref |
| `job.workflow_sha` | 定义该工作流文件的提交 SHA |
| `job.workflow_repository` | 存放工作流定义文件的 `owner/repo` |
| `job.workflow_file_path` | 相对于仓库根目录的工作流文件路径 |

在普通工作流中，这些值与已有的 `github.workflow_ref`、`github.workflow_sha` 通常一致；当作业来自可复用工作流时，两组值可能出现差异。此时，`job.workflow_*` 才能回答“真正定义当前作业的文件在哪里”。

GitHub 文档给出的一个实际用途，是让可复用工作流检出自己的源代码，而不是误检出调用者仓库的代码：

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
        with:
          repository: ${{ job.workflow_repository }}
          ref: ${{ job.workflow_sha }}

      - run: echo "Deploying from ${{ job.workflow_ref }}"
      - run: echo "Workflow file: ${{ job.workflow_file_path }}"
```

这类信息也可以写入部署记录、审计日志或构建摘要。以后查看一次生产部署时，团队不必只依赖调用者提交的 SHA，还能确认实际执行的可复用工作流来自哪个仓库和哪个提交。

不过，这四个属性目前不适用于 GitHub Enterprise Server。使用 GitHub.com 和 GHES 的混合环境，不能假设同一份工作流在两边都有相同上下文；可以通过显式输入、固定引用或平台差异分支提供兼容路径。

## 三项更新放在一起，组成一条治理链

单独看，它们分别属于运行时、权限和上下文；放在一次 CI 执行里，关系会更清楚：

```text
Runner 版本与弃用日期
          │
          ▼
确定作业在哪个可用运行时执行
          │
          ├── vulnerability-alerts: read ──> 只读 Dependabot 信息
          │
          └── job.workflow_* ──> 记录真正定义作业的来源
```

这条链的价值在于把几个过去靠约定维持的事实变成了可查询数据。Runner 升级不再依赖一张过期日历，安全告警工作流不必借用宽泛权限，复用工作流也不再只能从调用者上下文推断来源。

它仍然不能解决所有 CI 风险。一个被篡改的工作流仍可能使用它被授予的合法权限，一个已经升级的 Runner 也可能运行了不安全的第三方 Action，来源信息能够被记录也不代表代码内容经过了人工审查。新增字段带来的是更好的证据，不是自动完成的安全结论。

## 团队可以怎么接入

### 1. 先建立 Runner 版本台账

把 Runner 名称、所属范围、操作系统、版本和最近活跃时间收集起来。对每个版本调用弃用 API，分别记录注册截止时间和运行时截止时间，并在更早的时间点触发升级提醒。不要把 `latest` 这种标签当成版本台账，它无法说明当前实例实际上运行了什么版本。

### 2. 把权限写到具体作业

需要读取 Dependabot 的作业才声明 `vulnerability-alerts: read`，其他作业保持 `none`。如果一个工作流既有构建作业又有安全摘要作业，可以在作业级别分别设置权限，避免把读取安全告警的能力扩散到整条流水线。

```yaml
jobs:
  dependency-report:
    permissions:
      contents: read
      vulnerability-alerts: read
    runs-on: ubuntu-latest
    steps:
      - run: echo "Read Dependabot alerts here"
```

示例只展示权限边界，具体读取接口和认证方式仍应按 GitHub API 文档配置。尤其不要为了读取一种告警而直接使用 `write-all` 或个人长期令牌。

### 3. 在可复用工作流中记录定义来源

发布、部署和修改基础设施的可复用工作流，建议把 `job.workflow_ref`、`job.workflow_sha` 和 `job.workflow_repository` 写入构建摘要或部署事件。对于安全敏感步骤，还可以使用 `job.workflow_sha` 固定检出的工作流源代码，减少“调用者上下文”和“工作流定义上下文”混在一起的机会。

### 4. 给 GHES 保留降级方案

如果工作流同时运行在 GitHub.com 和 GHES，先检查目标平台是否提供这些 `job` 上下文属性。对不支持的环境，可以通过 `workflow_call` 输入传入已知的工作流版本，或者把来源配置放在受保护的部署参数中。降级路径应该显式失败或留下标记，避免日志看起来完整、实际缺失关键字段。

## 结语

GitHub Actions 这次更新的共同方向很明确：让 CI 中容易被忽略的事实变成接口和配置。Runner 版本何时失效、工作流能读哪类安全数据、当前作业由谁定义，都会影响排障和供应链审计。

建议先从两个低风险动作开始：给 Dependabot 读取流程加上 `vulnerability-alerts: read`，再把自托管 Runner 的版本和两个弃用日期纳入台账。等这部分稳定后，再为可复用发布流程补充 `job.workflow_*` 来源记录。CI 的可靠性往往不是靠某一次大改造获得的，而是靠这些小而准确的事实逐渐沉淀出来。

## 参考来源

- [GitHub Changelog：GitHub Actions: Early September 2026 updates](https://github.blog/changelog/2026-09-03-github-actions-early-september-2026-updates/)
- [GitHub Docs：Get runner version end-of-life schedule for a repository](https://docs.github.com/en/rest/actions/self-hosted-runners#get-runner-version-end-of-life-schedule-for-a-repository)
- [GitHub Docs：Workflow syntax for GitHub Actions，permissions](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#permissions)
- [GitHub Docs：Contexts，job context](https://docs.github.com/en/actions/reference/workflows-and-actions/contexts#job-context)
- [GitHub Docs：Reuse workflows](https://docs.github.com/en/actions/how-tos/reuse-automations/reuse-workflows)
