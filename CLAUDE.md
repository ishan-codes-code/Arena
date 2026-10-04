@AGENTS.md

## Arena Architecture

Before changing application structure or behavior, read and follow
[`docs/architecture.md`](docs/architecture.md) and [`docs/rules.md`](docs/rules.md).
These documents are the canonical source for Arena's architecture and
development rules. If other instructions conflict with them, follow the
canonical documents while preserving compatible project-specific guidance.

# Skills

This project contains reusable skills in `.agents/skills/`.

Before performing a task, check whether a relevant skill exists and use it when applicable.

- Read the relevant `SKILL.md` before starting the task.
- Follow the skill's instructions when it applies.
- Prefer project skills over inventing your own workflow.
- Do not load unrelated skills.
- If multiple skills apply, use the smallest relevant set.