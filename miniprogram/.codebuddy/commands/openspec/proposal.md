---
name: OpenSpec: Proposal
description: 创建一个新的 OpenSpec 变更提案并严格验证。
category: OpenSpec
tags: [openspec, change]
---
<!-- OPENSPEC:START -->
**护栏**
- 优先考虑直接、最小化的实现，仅在被要求或明确需要时才增加复杂性。
- 将变更范围严格限制在预期的结果内。
- 如果你需要额外的 OpenSpec 约定或说明，请参考 `openspec/AGENTS.md`（位于 `openspec/` 目录下——如果没看到，请运行 `ls openspec` 或 `openspec update`）。
- 在编辑文件之前，识别任何模糊或不明确的细节，并提出必要的后续问题。
- 不要在提案阶段编写任何代码。只创建设计文档（proposal.md, tasks.md, design.md 和 spec deltas）。实施将在批准后的应用阶段进行。

**步骤**
1. 审查 `openspec/project.md`，运行 `openspec list` 和 `openspec list --specs`，并检查相关代码或文档（例如，通过 `rg`/`ls`），以使提案基于当前行为；记录任何需要澄清的差距。
2. 选择一个唯一的以动词开头的 `change-id`，并在 `openspec/changes/<id>/` 下搭建 `proposal.md`、`tasks.md` 和 `design.md`（如果需要）。
3. 将变更映射为具体的能力或需求，将多范围的工作分解为具有清晰关系和顺序的独立 spec deltas。
4. 当解决方案跨越多个系统、引入新模式或需要在提交规范前讨论权衡时，在 `design.md` 中记录架构推理。
5. 在 `changes/<id>/specs/<capability>/spec.md`（每个能力一个文件夹）中起草 spec deltas，使用 `## ADDED|MODIFIED|REMOVED Requirements`，每个需求至少包含一个 `#### Scenario:`，并在相关时交叉引用相关能力。
6. 将 `tasks.md` 起草为一份有序的小型、可验证工作项列表，这些工作项应交付用户可见的进展，包括验证（测试、工具），并突出依赖关系或可并行工作。
7. 使用 `openspec validate <id> --strict` 进行验证，并在分享提案前解决所有问题。

**参考**
- 当验证失败时，使用 `openspec show <id> --json --deltas-only` 或 `openspec show <spec> --type spec` 检查详细信息。
- 在编写新需求之前，使用 `rg -n "Requirement:|Scenario:" openspec/specs` 搜索现有需求。
- 使用 `rg <keyword>`、`ls` 或直接读取文件来探索代码库，以确保提案与当前的实施现实保持一致。
<!-- OPENSPEC:END -->
