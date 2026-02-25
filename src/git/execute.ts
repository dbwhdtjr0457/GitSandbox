import type { Commit, GitState } from './types'
import type { ParsedCommand as CommandAst } from './parse'
import { findLCA, isAncestor } from './utils'

export type ExecutionResult = {
  nextState: GitState
  out: string
  err?: string
}

function getSnapshotByCommitId(commitId: string | null, commits: Record<string, Commit>): string {
  if (!commitId) {
    return ''
  }

  if (!Object.prototype.hasOwnProperty.call(commits, commitId)) {
    return ''
  }

  return commits[commitId]?.snapshot ?? ''
}

export function executeCommand(state: GitState, cmd: CommandAst): ExecutionResult {
  switch (cmd.kind) {
    case 'help':
      return {
        nextState: state,
        out: [
          'Supported commands:',
          '  help',
          '  git init',
          '  git commit -m <msg>',
          '  git branch <name>',
          '  git switch <name>',
          '  git switch -c <name>',
          '  git checkout <branch|commit>',
          '  git merge <name>',
          '  git revert <commitId>',
          '  git reset --hard <commitId>',
          '  git status',
          '  git log --oneline',
        ].join('\n'),
      }
    case 'init': {
      const nextState: GitState = {
        ...state,
        commits: {},
        editorText: '',
        branches: {
          ...state.branches,
          main: null,
        },
        head: {
          type: 'symbolic',
          branch: 'main',
          commitId: null,
        },
        meta: {
          ...state.meta,
          initialized: true,
          lanes: {
            ...state.meta.lanes,
            main: 0,
          },
          laneCount: 1,
        },
      }

      if (state.meta.initialized) {
        return {
          nextState,
          out: 'Reinitialized existing Git repository',
        }
      }

      return {
        nextState,
        out: 'Initialized empty Git sandbox repository.',
      }
    }
    case 'commit':
      if (!state.meta.initialized) {
        return {
          nextState: state,
          out: '',
          err: 'fatal: not a git repository (or any of the parent directories): .git',
        }
      }

      {
        const commitId = `c${state.meta.nextId}`
        const symbolicLane =
          state.head.type === 'symbolic' ? state.meta.lanes[state.head.branch] : undefined
        const commitLane = state.head.type === 'symbolic' ? (symbolicLane ?? 0) : 0

        const commit: Commit = {
          id: commitId,
          message: cmd.message,
          parents: state.head.commitId ? [state.head.commitId] : [],
          branch: state.head.type === 'symbolic' ? state.head.branch : null,
          lane: commitLane,
          snapshot: state.editorText,
          timestamp: Date.now(),
        }

        const nextCommits = {
          ...state.commits,
          [commitId]: commit,
        }

        let nextHead = state.head
        let nextBranches = state.branches

        if (state.head.type === 'symbolic') {
          nextBranches = {
            ...state.branches,
            [state.head.branch]: commitId,
          }
          nextHead = {
            ...state.head,
            commitId,
          }
        } else {
          nextHead = {
            type: 'detached',
            commitId,
          }
        }

        const nextState: GitState = {
          ...state,
          commits: nextCommits,
          branches: nextBranches,
          head: nextHead,
          meta: {
            ...state.meta,
            nextId: state.meta.nextId + 1,
          },
        }

        return {
          nextState,
          out: `Created commit ${commitId}`,
        }
      }
    case 'branch':
      if (Object.prototype.hasOwnProperty.call(state.branches, cmd.name)) {
        return {
          nextState: state,
          out: '',
          err: `fatal: A branch named '${cmd.name}' already exists.`,
        }
      }

      {
        const lane = Object.prototype.hasOwnProperty.call(state.meta.lanes, cmd.name)
          ? state.meta.lanes[cmd.name]
          : state.meta.laneCount

        const shouldAssignLane = !Object.prototype.hasOwnProperty.call(state.meta.lanes, cmd.name)
        const nextState: GitState = {
          ...state,
          branches: {
            ...state.branches,
            [cmd.name]: state.head.commitId,
          },
          meta: {
            ...state.meta,
            lanes: {
              ...state.meta.lanes,
              ...(shouldAssignLane ? { [cmd.name]: lane } : {}),
            },
            laneCount: shouldAssignLane ? state.meta.laneCount + 1 : state.meta.laneCount,
          },
        }

        return {
          nextState,
          out: `Created branch ${cmd.name}`,
        }
      }
    case 'switch':
      if (!Object.prototype.hasOwnProperty.call(state.branches, cmd.name)) {
        return {
          nextState: state,
          out: '',
          err: `error: pathspec '${cmd.name}' did not match any branch`,
        }
      }

      return {
        nextState: {
          ...state,
          head: {
            type: 'symbolic',
            branch: cmd.name,
            commitId: state.branches[cmd.name],
          },
          editorText: getSnapshotByCommitId(state.branches[cmd.name], state.commits),
        },
        out: `Switched to branch '${cmd.name}'`,
      }
    case 'switchCreate':
      if (Object.prototype.hasOwnProperty.call(state.branches, cmd.name)) {
        return {
          nextState: state,
          out: '',
          err: `fatal: A branch named '${cmd.name}' already exists.`,
        }
      }

      {
        const lane = Object.prototype.hasOwnProperty.call(state.meta.lanes, cmd.name)
          ? state.meta.lanes[cmd.name]
          : state.meta.laneCount

        const shouldAssignLane = !Object.prototype.hasOwnProperty.call(state.meta.lanes, cmd.name)
        const nextState: GitState = {
          ...state,
          branches: {
            ...state.branches,
            [cmd.name]: state.head.commitId,
          },
          head: {
            type: 'symbolic',
            branch: cmd.name,
            commitId: state.head.commitId,
          },
          editorText: getSnapshotByCommitId(state.head.commitId, state.commits),
          meta: {
            ...state.meta,
            lanes: {
              ...state.meta.lanes,
              ...(shouldAssignLane ? { [cmd.name]: lane } : {}),
            },
            laneCount: shouldAssignLane ? state.meta.laneCount + 1 : state.meta.laneCount,
          },
        }

        return {
          nextState,
          out: `Created and switched to new branch '${cmd.name}'`,
        }
      }
    case 'checkout':
      if (!state.meta.initialized) {
        return {
          nextState: state,
          out: '',
          err: 'fatal: not a git repository (or any of the parent directories): .git',
        }
      }

      if (cmd.refType === 'branch') {
        if (!Object.prototype.hasOwnProperty.call(state.branches, cmd.name)) {
          return {
            nextState: state,
            out: '',
            err: `error: pathspec '${cmd.name}' did not match any branch`,
          }
        }

        const commitId = state.branches[cmd.name]
        return {
          nextState: {
            ...state,
            head: {
              type: 'symbolic',
              branch: cmd.name,
              commitId,
            },
            editorText: getSnapshotByCommitId(commitId, state.commits),
          },
          out: `Switched to branch '${cmd.name}'`,
        }
      }

      if (!Object.prototype.hasOwnProperty.call(state.commits, cmd.commitId)) {
        return {
          nextState: state,
          out: '',
          err: `fatal: bad revision '${cmd.commitId}'`,
        }
      }

      return {
        nextState: {
          ...state,
          head: {
            type: 'detached',
            commitId: cmd.commitId,
          },
          editorText: getSnapshotByCommitId(cmd.commitId, state.commits),
        },
        out: `HEAD is now at ${cmd.commitId}`,
      }
    case 'merge': {
      if (!state.meta.initialized) {
        return {
          nextState: state,
          out: '',
          err: 'fatal: not a git repository (or any of the parent directories): .git',
        }
      }

      if (state.head.type !== 'symbolic') {
        return {
          nextState: state,
          out: '',
          err: 'fatal: cannot merge while HEAD is detached (MVP not supported)',
        }
      }

      if (!Object.prototype.hasOwnProperty.call(state.branches, cmd.name)) {
        return {
          nextState: state,
          out: '',
          err: `fatal: invalid refspec '${cmd.name}'`,
        }
      }
      const targetCommitId = state.branches[cmd.name]

      const currentCommitId = state.head.commitId
      if (currentCommitId === targetCommitId) {
        return {
          nextState: state,
          out: 'Already up to date',
        }
      }

      if (isAncestor(currentCommitId, targetCommitId, state.commits)) {
        return {
          nextState: {
            ...state,
            branches: {
              ...state.branches,
              [state.head.branch]: targetCommitId,
            },
            head: {
              ...state.head,
              commitId: targetCommitId,
            },
            editorText: getSnapshotByCommitId(targetCommitId, state.commits),
          },
          out: 'Fast-forward',
        }
      }

      const mergeBase = findLCA(state.commits, currentCommitId, targetCommitId)
      void mergeBase
      const mergeCommitId = `c${state.meta.nextId}`
      const mergeCommit: Commit = {
        id: mergeCommitId,
        message: `Merge branch '${cmd.name}'`,
        parents: [currentCommitId, targetCommitId].filter((id): id is string => id !== null),
        branch: state.head.type === 'symbolic' ? state.head.branch : null,
        lane: state.head.type === 'symbolic' ? state.meta.lanes[state.head.branch] ?? 0 : 0,
        snapshot: state.editorText,
        timestamp: Date.now(),
      }

      const nextMergeState: GitState = {
        ...state,
        commits: {
          ...state.commits,
          [mergeCommitId]: mergeCommit,
        },
        branches: {
          ...state.branches,
          [state.head.branch]: mergeCommitId,
        },
        head: {
          ...state.head,
          commitId: mergeCommitId,
        },
        meta: {
          ...state.meta,
          nextId: state.meta.nextId + 1,
        },
      }

      return {
        nextState: nextMergeState,
        out: 'Merge made by the \'ort\' strategy.',
      }
    }
    case 'revert': {
      if (!state.meta.initialized) {
        return {
          nextState: state,
          out: '',
          err: 'fatal: not a git repository (or any of the parent directories): .git',
        }
      }

      const targetCommit = state.commits[cmd.commitId]
      if (!targetCommit) {
        return {
          nextState: state,
          out: '',
          err: `fatal: bad revision '${cmd.commitId}'`,
        }
      }

      const revertCommitId = `c${state.meta.nextId}`
      const revertCommit: Commit = {
        id: revertCommitId,
        message: `Revert "${targetCommit.message}"`,
        parents: state.head.commitId ? [state.head.commitId] : [],
        branch: state.head.type === 'symbolic' ? state.head.branch : null,
        lane: state.head.type === 'symbolic' ? state.meta.lanes[state.head.branch] ?? 0 : 0,
        snapshot: state.editorText,
        timestamp: Date.now(),
      }

      if (state.head.type === 'symbolic') {
        return {
          nextState: {
            ...state,
            commits: {
              ...state.commits,
              [revertCommitId]: revertCommit,
            },
            branches: {
              ...state.branches,
              [state.head.branch]: revertCommitId,
            },
            head: {
              ...state.head,
              commitId: revertCommitId,
            },
            meta: {
              ...state.meta,
              nextId: state.meta.nextId + 1,
            },
          },
          out: `Reverted ${cmd.commitId}.`,
        }
      }

      return {
        nextState: {
          ...state,
          commits: {
            ...state.commits,
            [revertCommitId]: revertCommit,
          },
          head: {
            type: 'detached',
            commitId: revertCommitId,
          },
          meta: {
            ...state.meta,
            nextId: state.meta.nextId + 1,
          },
        },
        out: `Reverted ${cmd.commitId}.`,
      }
    }
    case 'resetHard': {
      if (!state.meta.initialized) {
        return {
          nextState: state,
          out: '',
          err: 'fatal: not a git repository (or any of the parent directories): .git',
        }
      }

      if (!Object.prototype.hasOwnProperty.call(state.commits, cmd.commitId)) {
        return {
          nextState: state,
          out: '',
          err: `fatal: bad revision '${cmd.commitId}'`,
        }
      }

      const nextEditorText = getSnapshotByCommitId(cmd.commitId, state.commits)

      if (state.head.type === 'symbolic') {
        return {
          nextState: {
            ...state,
            head: {
              ...state.head,
              commitId: cmd.commitId,
            },
            branches: {
              ...state.branches,
              [state.head.branch]: cmd.commitId,
            },
            editorText: nextEditorText,
          },
          out: `HEAD is now at ${cmd.commitId}`,
        }
      }

      return {
        nextState: {
          ...state,
          head: {
            type: 'detached',
            commitId: cmd.commitId,
          },
          editorText: nextEditorText,
        },
        out: `HEAD is now at ${cmd.commitId}`,
      }
    }
    case 'status': {
      if (!state.meta.initialized) {
        return {
          nextState: state,
          out: '',
          err: 'fatal: not a git repository (or any of the parent directories): .git',
        }
      }

      const headSnapshot = getSnapshotByCommitId(state.head.commitId, state.commits)
      const statusLine = state.editorText === headSnapshot
        ? 'nothing to commit (working tree changes not simulated yet)'
        : 'Changes not staged for commit'

      if (state.head.type === 'symbolic') {
        const commitText = state.head.commitId ?? 'no commits yet'
        return {
          nextState: state,
          out: `On branch ${state.head.branch} + HEAD -> ${state.head.branch} (${commitText})\n${statusLine}`,
        }
      }

      const detachedAt = state.head.commitId ?? 'no commits yet'
      return {
        nextState: state,
        out: `HEAD detached at ${detachedAt}\n${statusLine}`,
      }
    }
    case 'logOneline': {
      if (!state.meta.initialized) {
        return {
          nextState: state,
          out: '',
          err: 'fatal: not a git repository (or any of the parent directories): .git',
        }
      }

      const headCommitId = state.head.commitId
      if (!headCommitId) {
        return {
          nextState: state,
          out: 'No commits yet',
        }
      }

      const lines: string[] = []
      let currentId: string | null = headCommitId
      for (let i = 0; i < 30 && currentId !== null; i += 1) {
        const commit = state.commits[currentId]
        if (!commit) {
          break
        }

        lines.push(`${commit.id} ${commit.message}`)
        currentId = commit.parents[0] ?? null
      }

      if (lines.length === 0) {
        return {
          nextState: state,
          out: 'No commits yet',
        }
      }

      return {
        nextState: state,
        out: lines.join('\n'),
      }
    }
    case 'error':
      return {
        nextState: state,
        out: '',
        err: cmd.message,
      }
    default:
      return {
        nextState: state,
        out: '',
        err: 'Unhandled command.',
      }
  }
}
