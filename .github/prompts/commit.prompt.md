---
name: commit
agent: agent
description: Commits pending changes
model: GPT-5 mini (copilot)
tools: ['execute', 'read']
---
# Commit changes

## Role

Act as a software developer.

## Task

Commit the pending changes.
Use the terminal tool to run git commands.

## Context

Use the `commiting-changes` skill as reference.

## Output checklist:

- [ ] There are no uncommited changes in the current branch.