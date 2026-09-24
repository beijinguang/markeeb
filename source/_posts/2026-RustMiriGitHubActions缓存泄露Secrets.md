---
title: Rust 安全团队警告：Miri 与 GitHub Actions 缓存组合可能泄露 Secrets
date: 2026-09-22 08:01:00
categories: [安全, Rust, DevOps]
tags: [Rust, Miri, GitHub Actions, CI/CD, Secrets, 缓存安全, 供应链安全]
description: Rust 安全响应团队披露，Miri 会将环境变量写入 target 目录；如果 CI 同时缓存该目录且作业拥有 Secrets，Pull Request 可能通过缓存读到敏感信息。本文拆解影响条件、排查方法和修复顺序。
---

Rust 安全响应团队在 2026 年 9 月 21 日发布公告：Miri 会把环境变量写入 `target/`，如果 GitHub Actions 又缓存了这个目录，且运行 `cargo miri` 的作业可以读取 Secrets，那么这些敏感信息可能随着缓存留存，并被 Pull Request 流程读取。

这不是一个需要所有 Rust 项目立刻恐慌的漏洞公告。Rust 团队明确描述的是一个组合风险：Miri 的环境变量持久化行为，碰上了 CI 缓存的跨运行复用和 Pull Request 可读范围，才形成了泄露路径。真正需要马上做的是检查自己的工作流是否同时满足这些条件，清理已经生成的缓存，并在必要时轮换可能暴露的凭据。

<!-- more -->

## 风险是怎样形成的

### Miri 为什么会接触环境变量

Miri 是 Rust 的解释器和未定义行为检测工具，通常通过 `cargo miri` 运行测试。为了让后续运行能够保留构建所需的信息，当前实现会把环境变量写入 `target/` 中的构建产物或辅助文件。

单独看，这种行为并不等于秘密泄露：如果工作目录只在一次 CI 任务中使用，任务结束后被销毁，环境变量不会自动出现在外部。但 CI 经常会缓存 `target/` 来减少 Rust 项目的编译时间，一旦这些文件跨运行保存，环境变量就获得了更长的生命周期。

### GitHub Actions 缓存把问题变成了跨运行问题

典型的 Rust CI 会缓存 `target/`，或者缓存 `cargo install` 生成的工具。默认分支的工作流可以写入缓存，Pull Request 工作流往往可以读取已有缓存。这样做是为了加速构建，同时避免来自 Pull Request 的代码直接污染可信缓存。

问题在于，“不能写入”不代表“不能读取”。如果一个拥有 Secrets 的作业运行 Miri 并把 `target/` 保存进缓存，之后能够访问这个缓存的 Pull Request 就可能拿到已经落盘的环境变量内容。

风险路径可以概括为：

```text
CI Secret 注入环境变量
        ↓
cargo miri 运行并把环境变量写入 target/
        ↓
Actions 缓存保存 target/
        ↓
Pull Request 任务读取缓存
        ↓
敏感信息可能出现在可被 PR 代码访问的文件中
```

这条路径不依赖日志打印。即使日志里没有出现 Secret，只要它被写进了可复用的构建目录，缓存本身就可能成为泄露载体。

## 哪些项目需要优先检查

Rust 官方建议检查自己的 GitHub Actions 配置。一个项目同时满足下面四项时，应当按受影响项目处理：

1. 工作流执行了 `cargo miri` 或其他会启动 Miri 的命令；
2. 执行 Miri 的 Job 或 Step 通过 `env` 读取了 Secrets；
3. 工作流使用 `actions/cache`、`swatinem/rust-cache` 或类似机制缓存了 `target/`；
4. 这个缓存可以被 Pull Request 任务读取。

可以先在仓库中做一次静态盘点：

```bash
rg -n -i \
  "cargo miri|miri|target/|actions/cache|rust-cache|secrets\." \
  .github/workflows .github/actions 2>/dev/null
```

搜索结果需要人工结合上下文判断。比如，工作流可能只缓存 `~/.cargo/registry`，并没有缓存 `target/`；也可能在一个没有 Secrets 的 Job 里运行 Miri。反过来，Secret 不一定写成 `${{ secrets.NAME }}`，也可能通过 Job 级 `env`、环境文件或前置脚本间接进入进程环境。

## 修复顺序：先阻断，再清理，最后轮换

### 1. 先让 Miri 任务不再同时接触缓存和 Secrets

最简单的短期做法，是让运行 Miri 的 Job 不使用缓存。下面是一个刻意保持保守的结构：Miri 任务不配置任何 Secret，也不保存 `target/` 缓存。

```yaml
jobs:
  miri:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5

      - name: Run Miri without secrets or target cache
        run: cargo miri test
```

如果业务确实需要 Secret，例如从私有注册表下载依赖，应尽量把 Secret 限定在不运行 Miri 的那个 Step，而不是放在整个 Job 的 `env` 中。这样即使 Miri 或构建脚本把环境信息持久化，也能减少被写入的敏感范围。

### 2. 清理已经生成的缓存

改完工作流后，旧缓存不会自动消失。应在仓库的 Actions 缓存管理页面检查与 `target/` 相关的缓存键，删除可能由受影响工作流创建的条目。GitHub 文档也提供了按分支筛选和删除缓存的方法，并支持通过 REST API 或 GitHub CLI 管理缓存。

清理缓存时不要只删除默认分支最新的一条。应根据缓存键、创建时间、分支和使用过该缓存的工作流一起检查，避免留下另一个仍然可以被 Pull Request 恢复的副本。

### 3. 评估并轮换可能暴露的凭据

如果受影响的工作流曾经执行过，不能因为没有看到异常日志就断定 Secret 没有泄露。应按照凭据类型评估风险：撤销短期令牌、重新生成长期令牌、轮换部署密钥，并检查相关服务的访问日志。

轮换顺序应优先覆盖能读取仓库、发布包、访问云资源或修改生产环境的凭据。轮换完成后，还要确认新凭据没有继续以 Job 级环境变量的形式暴露给会写入缓存的步骤。

## Rust 官方修复意味着什么

Rust 团队给出的短期修复，是让 Miri 只保留 `CARGO_*` 环境变量（排除 `CARGO_*_TOKEN`）和 `OUT_DIR`，而不是把整个环境写入 `target/`。公告同时说明，长期来看 Miri 和 Cargo 还需要寻找更可靠的方式传递真正与构建有关的变量；在补丁进入所使用的 nightly 之前，不能只依赖“升级 Rust”这句笼统建议。

公告写明，包含修复的 Miri 版本计划进入 2026 年 9 月 22 日的 nightly。升级前后仍建议在隔离分支中验证：

```bash
rustup toolchain install nightly-2026-09-22
rustup component add miri --toolchain nightly-2026-09-22
cargo +nightly-2026-09-22 miri test
```

日期工具链只是示例，实际可用性应以 Rust 官方发布的组件清单为准。即使新版本不再保存完整环境变量，也不应该把 Secret 无限制地暴露给所有构建步骤，因为项目自己的 `build.rs`、第三方构建工具或其他编译脚本仍可能把环境内容写进文件。

## 即使不用 Miri，也应该重新审视缓存边界

这次事件的影响面不应被缩小成“Miri 用户专属问题”。Rust 官方特别提醒：能够写入公共缓存的 Job 不应同时拥有 Secrets。许多工具都会读取环境变量，甚至把配置、诊断信息或生成文件放进构建目录，但不会专门识别哪些值是秘密。

因此，CI 设计上最好遵循几个简单的边界：

- 只给真正需要的 Step 注入 Secret，不使用整个 Job 级 `env`；
- 不缓存包含凭据、配置文件或未审查生成物的目录；
- 将可信分支的缓存和 Pull Request 缓存使用不同的键或不同的策略；
- 对缓存路径做内容检查，不只检查缓存命中率；
- 在修改缓存目录或构建工具后，主动清理旧缓存；
- 把缓存当作持久化数据处理，而不是临时磁盘。

缓存的安全性取决于“谁能写、谁能读、里面可能有什么”，而不只是缓存键是否足够复杂。只要一个不可信输入能够读取由可信任务写入的目录，就应当假设该目录中的内容可能被带入后续逻辑。

## 结语

Miri 与 GitHub Actions 的这次组合风险很有代表性：单独看，环境变量持久化和 CI 缓存都是为了让工具正常、让构建更快；放在一起，却可能把一次任务里的 Secret 变成跨运行可读取的数据。

对 Rust 项目来说，今天最值得做的不是盲目禁用所有缓存，而是准确盘点 `cargo miri`、`target/`、Secrets 和 Pull Request 访问范围之间的关系。先隔离敏感任务，再清理旧缓存，最后轮换可能泄露的凭据；即使项目不使用 Miri，也应把这次公告当作一次检查 CI 缓存边界的提醒。

## 参考来源

1. Rust Blog： [GitHub Actions leaking secrets when Miri output is cached](https://blog.rust-lang.org/2026/09/21/github-actions-leaking-secrets-when-miri-output-is-cached/)
2. GitHub Docs： [Managing caches](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manage-caches)
3. GitHub Docs： [Dependency caching reference](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows)
