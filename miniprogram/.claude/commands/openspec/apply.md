---
name: OpenSpec: Apply
description: 实施已批准的 OpenSpec 变更并保持任务同步。
category: OpenSpec
tags: [openspec, apply]
---
<!-- OPENSPEC:START -->
**护栏**
- 优先考虑直接、最小化的实现，仅在被要求或明确需要时才增加复杂性。
- 将变更范围严格限制在预期的结果内。
- 如果你需要额外的 OpenSpec 约定或说明，请参考 `openspec/AGENTS.md`（位于 `openspec/` 目录下——如果没看到，请运行 `ls openspec` 或 `openspec update`）。

**步骤**
将这些步骤作为 TODO 跟踪，并逐一完成。
1. 阅读 `changes/<id>/proposal.md`、`design.md`（如果存在）和 `tasks.md` 以确认范围和验收标准。
2. 按顺序处理任务，保持编辑最小化并专注于请求的变更。
3. 在更新状态之前确认完成——确保 `tasks.md` 中的每一项都已完成。
4. 在所有工作完成后更新检查清单，使每个任务都标记为 `- [x]` 并反映实际情况。
5. 当需要额外上下文时，参考 `openspec list` 或 `openspec show <item>`。

**参考**
- 如果在实施过程中需要提案的额外上下文，请使用 `openspec show <id> --json --deltas-only`。
<!-- OPENSPEC:END -->
