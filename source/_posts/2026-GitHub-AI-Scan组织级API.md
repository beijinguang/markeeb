---
title: GitHub AI Scan 开放组织级 API：把 Pull Request 安全检测纳入平台治理
date: 2026-09-11 08:01:00
categories: [安全, 软件工程]
tags: [GitHub, AI Scan, Code Scanning, Pull Request, DevSecOps, API]
description: GitHub 为 AI Scan 开放组织级和仓库级 REST API，可以批量读取或更新 Pull Request 安全检测开关。本文梳理它与 CodeQL 的关系、权限边界和接入时的实践要点。
---

GitHub 在 2026 年 9 月 10 日宣布，AI Scan for pull requests 的组织级和仓库级 REST API 进入 Public Preview。团队现在可以用接口读取或更新 AI Scan 的启用状态，再把它接入内部的仓库治理、项目初始化和安全合规流程。

这项更新的价值不在于多了两个 API 路径，而在于安全检测的开关开始具备“平台配置”的形态。组织可以规定哪些仓库允许运行 AI Scan，仓库又可以按项目需要单独开启或关闭。对维护大量仓库的 DevSecOps 团队来说，接入自动化后，不必再逐个打开 GitHub 设置页面。

<!-- more -->

## AI Scan 到底检测什么

GitHub 文档把这项能力称为 AI-powered security detections。它使用独立的 AI 扫描引擎，在 Pull Request 中寻找 CodeQL 尚未覆盖的语言和框架安全问题，作为 CodeQL 的补充。

它和传统的代码扫描告警有几个重要区别：

| 特性 | AI Scan for pull requests |
| --- | --- |
| 扫描范围 | Pull Request，以及创建后每次新增提交 |
| 结果位置 | Pull Request 的 Conversation 和 Files changed 页面 |
| 仓库安全列表 | 不会作为长期 backlog 告警出现在仓库安全视图中 |
| 合并行为 | 结果属于建议，不会自动阻止合并 |
| 构建要求 | 不要求项目提供构建系统 |
| 与 CodeQL 的关系 | 独立运行，补充 CodeQL 覆盖范围 |

AI Scan 会直接分析 Pull Request 中的代码，也可以通过代码搜索获取仓库上下文。它使用自己的专用提示，不会读取 `/.github/copilot-instructions.md` 或 `/CLAUDE.md` 这类自定义指令文件。结果会标记“AI”标识，便于审查者和 CodeQL 告警区分。

这决定了它更适合充当代码审查时的第二双眼睛。它的结果需要开发者判断，不能把“没有发现 AI Scan 问题”理解成一次完整的安全证明。

## 新 API 解决的是批量治理问题

GitHub 本次开放了两组同构接口：组织级接口决定组织是否允许 Pull Request 扫描，仓库级接口决定具体仓库是否启用。

```text
GET   /orgs/{org}/code-scanning/ai-scan
PATCH /orgs/{org}/code-scanning/ai-scan

GET   /repos/{owner}/{repo}/code-scanning/ai-scan
PATCH /repos/{owner}/{repo}/code-scanning/ai-scan
```

更新接口使用 `pr_scan` 字段表达状态：

```json
{
  "pr_scan": "enabled"
}
```

读取接口会返回 `enabled` 或 `disabled`。如果需要关闭，也应明确提交 `"pr_scan": "disabled"`，而不是依赖仓库创建时的默认值。

组织级状态和仓库级状态不是简单的两层覆盖。官方公告明确说明，组织禁用时，仓库级设置不能绕过组织限制。也就是说，仓库 API 可以表达“这个项目想启用”，但不能越过组织级的总开关。

可以把最终效果理解成：

```text
组织允许 AI Scan  +  仓库启用 AI Scan  =  该仓库可以运行
组织禁用 AI Scan  +  仓库启用 AI Scan  =  仍然不能运行
```

这个约束很适合平台治理。安全团队可以控制组织边界，业务团队可以在边界内管理仓库级选择，自动化脚本也能在执行变更前先读取两层状态，避免误以为 PATCH 成功就一定会开始扫描。

## 接入自动化前，先把状态模型想清楚

最直接的接法是给新仓库初始化流程增加一步：创建仓库后读取组织和仓库的 AI Scan 状态，按团队策略更新仓库状态。对于已有仓库，则可以定期巡检，把状态和仓库的语言、负责人、风险等级、是否存放生产代码等信息放在一起，供安全团队复核。

一个比较稳妥的流程如下：

1. 读取组织级状态。如果组织层是 `disabled`，记录原因并停止向下修改。
2. 读取仓库级状态，和配置中心中的期望状态比较。
3. 只有在期望值与实际值不一致时，才调用仓库级 PATCH 接口。
4. 重新读取一次状态，保存审计记录，包括仓库名、操作者、时间、旧值和新值。
5. 将 AI Scan 的 Pull Request 结果交给正常的代码审查流程，而不是直接当成自动合并条件。

这里有一个容易被忽略的细节：开关治理和告警处置是两套流程。API 只能管理“是否启用”，不能替团队决定某条发现是否真实、是否需要修复，也不能把 advisory 结果自动变成合并阻断规则。若组织确实需要阻断合并，应另外设计基于检查状态、人工审批和风险分级的策略，并清楚区分 AI Scan 与 CodeQL 的结果来源。

## 权限和预览状态不能省略

AI Scan API 目前处于 Public Preview，接口和行为仍可能变化。文档列出的仓库级更新接口需要细粒度令牌的仓库 `Administration` 写权限；读取接口则需要相应的读取权限。经典令牌和 OAuth App 的权限要求也应以当前 REST API 文档为准，不能直接复用一个拥有全部仓库权限的通用令牌。

建议把权限拆开：

```text
仓库发现：读取组织和仓库清单
AI Scan 配置：仅更新目标仓库的 Administration 权限
审计存储：写入内部配置中心或日志系统
```

配置服务不需要读取源代码，也不应该拥有修改代码、合并 Pull Request 或发布软件包的权限。对于自托管自动化 Runner，还要限制令牌的环境暴露范围，避免把一个可以修改安全配置的凭据注入到所有构建任务中。

官方文档还列出了产品侧的使用条件：AI-powered security detections 在 Public Preview 期间需要 GitHub Advanced Security 许可和 GitHub Copilot 许可；仓库需要启用 CodeQL Default Setup，并主动选择加入 AI 检测。GitHub Enterprise Server 当前不在这次公告的支持范围内。

## 它和 CodeQL 是什么关系

AI Scan 并没有替代 CodeQL。两者的运行方式和结果模型都不同：CodeQL 可以建立数据库并持续维护代码扫描告警，AI Scan 只针对 Pull Request 提供额外的安全发现；AI Scan 的结果也不会变成仓库安全视图中的 backlog 告警。

另一个值得注意的行为是，AI Scan 与 CodeQL 的状态相互独立。即使 CodeQL Default Setup 处于等待或失败状态，AI Scan 仍可能运行。因此，团队在排查 Pull Request 上的安全结果时，需要同时查看两类检查的状态和时间，不能只等 CodeQL 完成后再判断 AI Scan 是否生效。

这也意味着指标不能只统计“代码扫描是否通过”。平台团队至少应该区分：

- CodeQL 是否完成，以及是否产生持久化告警；
- AI Scan 是否运行，以及是否产生 Pull Request 建议；
- 开发者是否对 AI Scan 结果进行了确认或反馈；
- 安全问题是否最终进入修复、复核和关闭流程。

## 现在适合做什么

如果组织已经购买了对应许可，并且仓库规模足够大，今天可以先做一个小范围试点。选择一组语言和框架不同的仓库，使用 API 统一读取状态，再让项目负责人决定哪些仓库启用。试点期间重点观察发现质量、审查耗时、误报反馈和权限审计，不要先把结果设置成强制合并门槛。

如果组织还没有准备好运行 AI Scan，也可以先把 API 接入仓库治理系统，但只做读取和审计。这样可以先了解当前状态分布，等许可、代码审查流程和告警分级准备好后，再分批打开开关。

## 结语

GitHub 为 AI Scan 增加组织级和仓库级 API，让 Pull Request 安全检测从单个仓库的页面设置，变成可以被平台工程管理的配置。它带来的直接收益是批量启用、状态巡检和审计更容易实现；真正的接入难点则在于如何处理组织与仓库两层状态、如何区分 AI Scan 与 CodeQL 的结果，以及如何把建议纳入人工复核和修复闭环。

在 Public Preview 阶段，比较合适的做法是先读取、再小范围启用，保留回滚和审计记录。把 AI Scan 当作 Pull Request 中的一层补充检查，而不是唯一的安全结论，才能让这项能力真正服务于代码审查流程。

## 参考来源

- [AI Scan for pull request APIs in public preview - GitHub Changelog](https://github.blog/changelog/2026-09-10-ai-scan-for-pull-request-apis-in-public-preview)
- [AI-powered security detections in pull requests - GitHub Docs](https://docs.github.com/code-security/concepts/code-scanning/ai-powered-security-detections)
- [Code scanning REST API - GitHub Docs](https://docs.github.com/rest/code-scanning/code-scanning?apiVersion=2026-03-10)
