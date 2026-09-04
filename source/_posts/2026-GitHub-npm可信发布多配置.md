---
title: GitHub 为 npm Trusted Publishing 增加多配置与暂存审批：发布凭证开始走最小信任路径
date: 2026-09-04 08:01:00
categories: [安全, 软件工程]
tags: [GitHub, npm, Trusted Publishing, OIDC, 供应链安全, CI/CD]
description: GitHub 宣布 npm Trusted Publishing 支持多组 OIDC 配置、暂存包扫描后审批和版本历史。本文拆解这条发布链如何工作，以及团队迁移时应如何收紧权限、保护标签和验证溯源。
---

发布一个 npm 包，真正敏感的通常不是最后那条 `npm publish` 命令，而是“谁能在什么条件下代表这个仓库发布”。9 月 3 日，GitHub 宣布 npm Trusted Publishing 的三项更新正式可用：同一个包可以配置多个可信发布来源，暂存包完成恶意软件扫描后才能审批，维护者还可以在版本页查看暂存和审批历史。

这次更新没有改变 JavaScript 的语法，也不是一次新的 CI 平台发布。它改变的是包发布的信任边界：从依赖长期保存的 npm token，逐步转向由 CI 工作流现场生成、按仓库和工作流约束的 OIDC 身份，再用暂存和人工审批给高风险发布增加一道闸门。对维护公共包、维护多套发布流水线，或需要把预发布版本和稳定版本隔离的团队来说，这比“少写一个 token”更值得关注。

## 背景：npm 发布本质上是一次身份委托

传统的 npm 发布通常需要在 CI 中保存一个 token。只要 token 没有过期、没有被撤销，拿到它的流程就可能尝试向 registry 发布包。即使 token 被放进 GitHub Secrets，风险仍然没有消失：恶意依赖、被篡改的 Action、过宽的工作流权限或日志泄露，都可能让长期凭证成为供应链攻击的落点。

Trusted Publishing 的思路不同。npm 与 CI 平台建立信任关系，发布工作流运行时由平台签发一个短期 OIDC 身份令牌，npm 根据预先配置的仓库、工作流文件和环境条件验证它，再交换成这一次发布所需的短期凭证。发布完成后，凭证自然失效，维护者也不必把一个可以长期使用的 npm token 放进仓库或 CI 配置。

npm 官方文档目前要求使用 npm CLI 11.5.1 或更高版本，以及 Node.js 22.14.0 或更高版本。Trusted Publishing 目前支持 GitHub Actions、GitLab CI/CD 和 CircleCI，但不同平台的运行器和配置条件并不完全相同。本文重点讨论 GitHub Actions 场景。

## 这次到底更新了什么

GitHub Changelog 把更新归纳为三项能力：

- 每个包可以拥有多组 Trusted Publishing 配置；
- 暂存包在恶意软件扫描完成前不能被审批；
- 维护者可以在 npm 的版本页查看每个版本的暂存、批准或拒绝历史。

三项能力放在一起看，才是这次更新的完整含义。第一项解决“发布来源变多”后的配置问题，第二项把机器扫描放进人工审批之前，第三项则让发布过程留下可供维护者回看的记录。

## 一、多个可信发布配置，解决的不是多一个按钮

此前，一个 npm 包通常只能围绕一组发布来源配置 Trusted Publisher。现实里的项目却经常有多条工作流：稳定版本从受保护的 release 分支发布，预发布版本从另一条工作流发布，文档或 monorepo 里的子包又可能由不同的仓库负责。为了绕过单配置限制，团队很容易回到共享 token 或在脚本里加入不透明的判断。

现在，同一个包可以配置多条可信发布连接。每条连接各自拥有仓库、工作流文件和环境条件，彼此独立、可以分别新增或删除。npm 会在传入的 OIDC 身份匹配任意一条配置时授权发布或暂存；配置的匹配顺序不应被当成业务逻辑的一部分。

npm 文档说明，每个包最多可以同时配置 10 条可信发布连接。这使得下面几类设计可以在不共享长期 token 的情况下共存：

- 稳定版和预发布版使用不同的 GitHub Actions 工作流；
- 同一个包由不同仓库或不同 CI 提供商构建；
- 生产发布经过受保护环境，测试发布只允许进入暂存区。

但多配置不等于多开权限。每新增一条配置，就新增了一条可以代表包的身份路径。仓库、工作流文件名和环境条件应该尽量具体，不能用一个“所有分支、所有工作流都能发布”的宽泛规则来换取方便。

## 二、暂存发布把“构建完成”和“进入 registry”拆开

Trusted Publishing 配置现在默认可以使用 `npm stage publish` 把包放入暂存区；是否允许直接使用 `npm publish`，由每条配置单独选择。GitHub 的更新说明还特别建议尽量只保留暂存权限，让自动化流程不能直接把一个新版本推到用户可见的 registry。

暂存发布的价值在于把发布过程拆成两个阶段：

```text
CI 构建并生成包
        │
        ▼
npm stage publish ──> 恶意软件扫描 ──> 维护者审批 ──> 版本可用
```

这并不是说扫描可以证明包绝对安全。它能做的是先拦截已知的恶意特征或明显异常，减少维护者在完全没有机器检查结果的情况下点击批准的概率。GitHub 这次调整后，如果暂存版本仍在扫描，审批按钮会被禁用；扫描结束后页面再允许继续操作，状态大约每分钟刷新一次。

人工审批也不应该只看“扫描通过”。维护者至少需要对比包内容、版本号、变更日志和触发这次发布的提交。一个被恶意修改的合法工作流，可能生成结构完整、但行为已经改变的包；审批环节真正要确认的是“这次发布是否对应预期变更”。

## 三、版本历史让一次发布能够被追溯

npm 版本页现在会向相应维护者显示更详细的历史，包括版本是否仍在暂存、已经批准，或被拒绝。以前，发布流程很容易只留下一个最终版本，出了问题还要从 CI 日志、聊天记录和个人记忆里拼接证据。

这类历史记录对排障有几个直接用途：

- 识别某个版本是自动化流程产生，还是经过了人工放行；
- 找出一个版本长期停留在暂存区的原因；
- 在回滚或撤回前，确认它是否已经进入用户可见范围；
- 复盘一次被拒绝的发布，判断是恶意软件扫描、内容审核还是审批判断导致。

记录本身不能代替权限控制，但它把发布从一次不可逆的按钮点击，变成了有状态、有参与者、有时间顺序的流程。

## GitHub Actions 中最小的 OIDC 配置

GitHub Actions 要使用 npm Trusted Publishing，关键权限是 `id-token: write`。它允许工作流向 GitHub 的 OIDC 服务请求身份令牌；这不是给工作流一个可以读写所有仓库内容的权限。其他权限仍应按任务需要单独授予。

一个只展示核心边界的工作流片段如下：

```yaml
name: Publish package

on:
  push:
    tags: ['v*']

permissions:
  contents: read
  id-token: write

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout
      - run: npm ci
      - run: npm publish
```

如果团队希望所有自动化发布都先进入暂存区，应把最后一步改为：

```yaml
- run: npm stage publish
```

示例省略了 Node.js 版本、Action 固定版本和测试步骤，实际项目不应直接照搬到生产环境。更容易被忽略的是，npm 配置页中的仓库名、工作流文件名和环境条件必须与真实工作流完全对应；工作流文件名连 `.yml` 扩展名都不能写错。npm 官方文档还要求包的 `package.json` 中 `repository.url` 与 GitHub 仓库准确匹配。

## 对供应链安全的真正影响

### 1. 凭证从“静态秘密”变成“动态证明”

OIDC 让 npm 验证的是“这个工作流此刻具有什么身份”，而不是“某个人过去保存过一串 token”。这缩短了凭证生命周期，也减少了轮换和撤销的运维负担。但它并没有让工作流自动变得可信：如果攻击者能修改受信任的工作流、触发受信任的标签，短期凭证仍可能被合法流程使用。

### 2. 多配置让权限可以按路径拆开

稳定发布、预发布和不同仓库可以使用不同的身份路径。某条工作流被暂停或配置错误时，其他路径不必共享同一个万能 token。对 monorepo 来说，这也鼓励团队把“哪个包由哪个工作流发布”写成明确配置，而不是隐藏在发布脚本的分支逻辑里。

### 3. 暂存审批降低了自动化误发布的爆炸半径

如果自动化流程只能暂存，工作流被利用后，攻击者首先得到的是一个尚未进入 registry 的版本，维护者仍有机会检查并拒绝它。这个边界对高下载量公共包尤其重要。但它会引入等待和人工值守，团队应提前约定审批人、超时处理、紧急修复和回滚流程，不能把“增加一个审批按钮”当作完整治理。

### 4. Provenance 让构建来源多一层证据

npm 文档说明，通过 GitHub Actions 或 GitLab CI/CD 的 Trusted Publishing 发布时，npm 会自动生成并发布 provenance 证明，不需要在命令中额外添加 `--provenance`。它可以帮助使用者了解包和源代码仓库、构建工作流之间的关系，但 provenance 证明的是构建来源和身份链，不等于代码经过了人工安全审计。

## 迁移时建议按这个顺序检查

1. **先确认运行环境。** 检查 Node.js、npm CLI、runner 类型和包的 `repository.url`，不要在身份配置还不匹配时直接改生产发布流程。
2. **为每条发布路径单独建配置。** 稳定版、预发布版和不同仓库分别填写仓库、工作流文件及环境，避免复制一个过宽的配置。
3. **从 stage-only 开始。** 让可信发布默认只能执行 `npm stage publish`，等扫描、审批和通知流程验证稳定后，再评估是否有必要为某条路径开启直接发布。
4. **把 OIDC 权限限制在发布作业。** `id-token: write` 不应无差别放在整个工作流或所有作业的共享权限中；如果使用可复用工作流，父、子工作流的权限也要一起检查。
5. **保护触发条件。** 对 release 标签、生产环境和负责发布的工作流启用审查与保护规则，固定第三方 Action 版本，并让发布前的测试和构建产物检查成为必经步骤。
6. **演练失败路径。** 验证工作流文件名写错、OIDC 权限缺失、扫描未结束、审批拒绝和发布后回滚时，团队是否能从日志与 npm 版本历史快速定位问题。

## 仍然不能忽略的限制

Trusted Publishing 只解决“发布时如何证明身份”，不解决包内容本身是否正确。构建脚本、依赖树、Action 和生成的 tarball 仍需要审查。它也不等同于安装依赖时的认证：发布私有依赖时，CI 仍可能需要一个只读凭证。

此外，npm 文档当前说明 GitHub Actions 的 Trusted Publishing 面向 GitHub 托管 runner，自托管 runner 尚未支持。每个包的可信发布连接也有数量上限，已有连接的一些字段不能直接编辑，通常需要删除后重新创建。迁移前应先确认团队的 runner、工作流和发布方式都在支持范围内。

## 结语

这次 GitHub 与 npm 的更新，表面上是给发布设置页增加了几个能力，实质上是在重新划分“自动化可以做到哪一步”。工作流可以自动构建，OIDC 可以自动证明来源，恶意软件扫描可以自动先行，但让版本真正进入用户可见的 registry，仍然可以保留在一个明确的审批边界之后。

对维护 npm 包的团队来说，最值得先做的不是把所有旧 token 一次性删除，而是盘点现有发布路径：哪些工作流能发布，哪些标签能触发，哪些权限能写入 registry，哪些版本经过了人工检查。然后用多配置把路径拆开，用 stage-only 降低默认权限，再用版本历史和 provenance 给每次发布留下能够复核的证据。供应链安全很少靠一个开关完成，但每一条更短、更具体、可验证的信任链，都会让下一次异常更容易被发现和控制。

## 参考来源

- [GitHub Changelog：Multiple trusted publishing configurations for npm](https://github.blog/changelog/2026-09-03-multiple-trusted-publishing-configurations-for-npm/)
- [npm Docs：Trusted publishing for npm packages](https://docs.npmjs.com/trusted-publishers)
- [npm Docs：Staged publishing for npm packages](https://docs.npmjs.com/staged-publishing)
- [npm Docs：Generating provenance statements](https://docs.npmjs.com/generating-provenance-statements)
- [GitHub Docs：OpenID Connect](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
