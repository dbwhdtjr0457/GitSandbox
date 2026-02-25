import type { Commit, GitState } from './types'
import type { ParsedCommand as CommandAst } from './parse'

export type ExecutionResult = {
  nextState: GitState
  out: string
  err?: string
}

export function isAncestor(
  ancestor: string | null,
  descendant: string | null,
  commits: Record<string, Commit>,
): boolean {
  if (ancestor === null || descendant === null) {
    return ancestor === descendant
  }

  let current: string | null = descendant
  while (current !== null) {
    if (current === ancestor) {
      return true
    }
    const node: Commit | undefined = commits[current]
    if (!node) {
      return false
    }

    current = node.parentId
  }

  return false
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
          '  git merge <name>',
        ].join('\n'),
      }
    case 'init': {
      const nextState: GitState = {
        ...state,
        commits: {},
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
          state.head.type === 'symbolic' && state.head.branch
            ? state.meta.lanes[state.head.branch]
            : undefined
        const commitLane = state.head.type === 'symbolic' ? (symbolicLane ?? 0) : 0

        const commit: Commit = {
          id: commitId,
          message: cmd.message,
          parentId: state.head.commitId,
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

        if (state.head.type === 'symbolic' && state.head.branch) {
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
            ...state.head,
            branch: null,
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
    case 'merge': {
      if (!state.meta.initialized) {
        return {
          nextState: state,
          out: '',
          err: 'fatal: not a git repository (or any of the parent directories): .git',
        }
      }

      if (state.head.type !== 'symbolic' || !state.head.branch) {
        return {
          nextState: state,
          out: '',
          err: 'fatal: cannot merge while HEAD is detached (MVP not supported)',
        }
      }

      const targetCommitId = state.branches[cmd.name]
      if (!Object.prototype.hasOwnProperty.call(state.branches, cmd.name)) {
        return {
          nextState: state,
          out: '',
          err: `fatal: invalid refspec '${cmd.name}'`,
        }
      }

      const currentCommitId = state.head.commitId
      if (currentCommitId === targetCommitId) {
        return {
          nextState: state,
          out: 'Already up to date',
        }
      }

      if (isAncestor(currentCommitId, targetCommitId, state.commits)) {
        const branchName = state.head.branch
        if (!branchName) {
          return {
            nextState: state,
            out: '',
            err: 'fatal: cannot merge while HEAD is detached (MVP not supported)',
          }
        }

        return {
          nextState: {
            ...state,
            branches: {
              ...state.branches,
              [branchName]: targetCommitId,
            },
            head: {
              ...state.head,
              commitId: targetCommitId,
            },
          },
          out: 'Fast-forward',
        }
      }

      return {
        nextState: state,
        out: '',
        err: 'Non-FF merge not supported in MVP',
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
