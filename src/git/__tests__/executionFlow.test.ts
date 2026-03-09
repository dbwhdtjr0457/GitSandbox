import { describe, expect, it } from 'vitest'
import { createCommandSteps, runCommandSequence, type CommandSequenceStep } from '../../app/commandSequence'
import { executeCommand } from '../execute'
import { parseCommand } from '../parse'
import { initialState } from '../reducer'
import type { GitState } from '../types'

function createState(): GitState {
  return structuredClone(initialState)
}

function runSteps(steps: CommandSequenceStep[], baseState = createState()): GitState {
  return runCommandSequence(baseState, steps).nextState
}

function createConflictedState(): GitState {
  return runSteps([
    ...createCommandSteps([
      'git init',
      'git commit -m "init"',
      'git switch -c feat',
    ]),
    { type: 'editor', text: 'feature line', historyLine: '(test) editor update' },
    ...createCommandSteps([
      'git commit -m "feat: change"',
      'git switch main',
    ]),
    { type: 'editor', text: 'main line', historyLine: '(test) editor update' },
    ...createCommandSteps([
      'git commit -m "main: change"',
      'git merge feat',
    ]),
  ])
}

describe('git execution flow', () => {
  it('keeps HEAD on current commit when merge conflict starts', () => {
    const state = createConflictedState()

    expect(state.head.type).toBe('symbolic')
    expect(state.head.commitId).toBe('c3')
    expect(state.branches.main).toBe('c3')
    expect(state.commits.c4).toBeUndefined()
    expect(state.meta.mergeConflict?.inProgress).toBe(true)
    expect(state.meta.mergeConflict?.resolved).toBe(false)
    expect(state.editorText).toContain('<<<<<<< main')
  })

  it('blocks commit and switch while merge conflict is unresolved', () => {
    const state = createConflictedState()

    const commitResult = executeCommand(state, parseCommand('git commit -m "resolve"'))
    const switchResult = executeCommand(state, parseCommand('git switch feat'))

    expect(commitResult.err).toBe('error: Committing is not possible because you have unmerged files.')
    expect(switchResult.err).toBe('error: you need to resolve your current index first')
  })

  it('creates the merge commit only after conflicts are resolved and committed', () => {
    const conflictedState = createConflictedState()

    const resolvedState: GitState = {
      ...conflictedState,
      editorText: 'resolved line',
      meta: {
        ...conflictedState.meta,
        mergeConflict: conflictedState.meta.mergeConflict
          ? { ...conflictedState.meta.mergeConflict, resolved: true }
          : null,
      },
    }

    const result = executeCommand(resolvedState, parseCommand('git commit -m "merge resolve"'))

    expect(result.err).toBeUndefined()
    expect(result.nextState.head.commitId).toBe('c4')
    expect(result.nextState.branches.main).toBe('c4')
    expect(result.nextState.commits.c4.parents).toEqual(['c3', 'c2'])
    expect(result.nextState.commits.c4.snapshot).toBe('resolved line')
    expect(result.nextState.meta.mergeConflict).toBeNull()
  })

  it('aborts merge by clearing conflict state and restoring ours text', () => {
    const state = createConflictedState()

    const result = executeCommand(state, parseCommand('git merge --abort'))

    expect(result.err).toBeUndefined()
    expect(result.out).toBe('Merge aborted.')
    expect(result.nextState.meta.mergeConflict).toBeNull()
    expect(result.nextState.editorText).toBe('main line')
    expect(result.nextState.head.commitId).toBe('c3')
  })

  it('allows branch creation during unresolved conflicts but blocks switch -c and merge', () => {
    const state = createConflictedState()

    const branchResult = executeCommand(state, parseCommand('git branch backup'))
    const switchCreateResult = executeCommand(state, parseCommand('git switch -c rescue'))
    const mergeResult = executeCommand(state, parseCommand('git merge feat'))

    expect(branchResult.err).toBeUndefined()
    expect(branchResult.nextState.branches.backup).toBe('c3')
    expect(switchCreateResult.err).toBe('error: you need to resolve your current index first')
    expect(mergeResult.err).toBe('error: Merging is not possible because you have unmerged files.')
  })

  it('reports unresolved and resolved merge status messages', () => {
    const conflictedState = createConflictedState()
    const unresolvedStatus = executeCommand(conflictedState, parseCommand('git status'))

    expect(unresolvedStatus.out).toContain('You have unmerged paths.')
    expect(unresolvedStatus.out).toContain('fix conflicts in the editor and then run "git commit"')

    const resolvedState: GitState = {
      ...conflictedState,
      meta: {
        ...conflictedState.meta,
        mergeConflict: conflictedState.meta.mergeConflict
          ? { ...conflictedState.meta.mergeConflict, resolved: true }
          : null,
      },
    }
    const resolvedStatus = executeCommand(resolvedState, parseCommand('git status'))

    expect(resolvedStatus.out).toContain('All conflicts fixed but you are still merging.')
    expect(resolvedStatus.out).toContain('use "git commit" to conclude merge')
  })

  it('returns a git-like error when merge --abort runs without an active merge', () => {
    const state = runSteps(createCommandSteps(['git init', 'git commit -m "init"']))
    const result = executeCommand(state, parseCommand('git merge --abort'))

    expect(result.out).toBe('')
    expect(result.err).toBe('fatal: There is no merge to abort (MERGE_HEAD missing).')
  })

  it('fast-forwards when target branch is ahead of current branch', () => {
    const state = runSteps([
      ...createCommandSteps([
        'git init',
        'git commit -m "init"',
        'git branch feat',
        'git switch feat',
      ]),
      { type: 'editor', text: 'feat work', historyLine: '(test) editor update' },
      ...createCommandSteps([
        'git commit -m "feat: work"',
        'git switch main',
        'git merge feat',
      ]),
    ])

    expect(state.head.commitId).toBe('c2')
    expect(state.branches.main).toBe('c2')
    expect(state.commits.c3).toBeUndefined()
  })

  it('creates a merge commit immediately for non-conflicting non-fast-forward merges', () => {
    const state = runSteps([
      ...createCommandSteps([
        'git init',
        'git commit -m "init"',
        'git switch -c feat',
        'git commit -m "feat: no text change"',
        'git switch main',
        'git commit -m "main: no text change"',
        'git merge feat',
      ]),
    ])

    expect(state.head.commitId).toBe('c4')
    expect(state.branches.main).toBe('c4')
    expect(state.commits.c4.parents).toEqual(['c3', 'c2'])
    expect(state.meta.mergeConflict).toBeNull()
  })
})
