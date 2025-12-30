---
name: OpenSpec: Archive
description: 归档已部署的 OpenSpec 变更并更新规范。
category: OpenSpec
tags: [openspec, archive]
---
<!-- OPENSPEC:START -->
**护栏**
- 优先考虑直接、最小化的实现，仅在被要求或明确需要时才增加复杂性。
- 将变更范围严格限制在预期的结果内。
- 如果你需要额外的 OpenSpec 约定或说明，请参考 `openspec/AGENTS.md`（位于 `openspec/` 目录下——如果没看到，请运行 `ls openspec` 或 `openspec update`）。

**步骤**
1. 确定要归档的变更 ID：
   - 如果此提示已包含特定的变更 ID（例如在由斜杠命令参数填充的 `<ChangeId>` 块内），请在使用前去除空格。
   - 如果对话松散地引用了变更（例如通过标题或摘要），请运行 `openspec list` 以显示可能的 ID，分享相关候选者，并确认用户的意图。
   - 否则，审查对话，运行 `openspec list`，并询问用户要归档哪个变更；在继续之前等待确认的变更 ID。
   - 如果你仍然无法识别单个变更 ID，请停止并告诉用户你暂时无法归档任何内容。
2. 通过运行 `openspec list`（或 `openspec show <id>`）验证变更 ID，如果变更丢失、已归档或尚未准备好归档，请停止。
3. 运行 `openspec archive <id> --yes`，以便 CLI 移动变更并应用规范更新而无需提示（仅对仅工具工作使用 `--skip-specs`）。
4. 审查命令输出以确认目标规范已更新且变更已放入 `changes/archive/`。
5. 使用 `openspec validate --strict` 进行验证，如果看起来有问题，请使用 `openspec show <id>` 进行检查。

**参考**
- 在归档之前使用 `openspec list` 确认变更 ID。
- 使用 `openspec list --specs` 检查刷新的规范，并在移交前解决任何验证问题。
<!-- OPENSPEC:END -->
