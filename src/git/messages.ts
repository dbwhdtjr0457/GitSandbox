import type { Commit } from './types'

const NOT_REPO_ERROR = 'fatal: not a git repository (or any of the parent directories): .git'

export const messages = {
  error: {
    notInitialized: () => NOT_REPO_ERROR,
    branchExists: (name: string) => `fatal: A branch named '${name}' already exists.`,
    noSuchBranch: (name: string) => `error: pathspec '${name}' did not match any branch`,
    badRevision: (id: string) => `fatal: bad revision '${id}'`,
    detachedHeadNotSupported: () => 'fatal: cannot merge while HEAD is detached (MVP not supported)',
    commitRequiredForMerge: (name: string) => `fatal: invalid refspec '${name}'`,
    unhandledCommand: () => 'Unhandled command.',
  },
  output: {
    initialized: () => 'Initialized empty Git sandbox repository.',
    reinitialized: () => 'Reinitialized existing Git repository',
    createdBranch: (name: string) => `Created branch ${name}`,
    switchNewBranch: (name: string) => `Created and switched to new branch '${name}'`,
    switchedBranch: (name: string) => `Switched to branch '${name}'`,
    headNowAt: (id: string) => `HEAD is now at ${id}`,
    createdCommit: (id: string) => `Created commit ${id}`,
    reverted: (id: string) => `Reverted ${id}.`,
    mergeFastForward: () => 'Fast-forward',
    mergeAlreadyUpToDate: () => 'Already up to date',
    mergeMadeByOrt: () => `Merge made by the 'ort' strategy.`,
    statusOnBranch: (branch: string, commitId: string) =>
      `On branch ${branch} + HEAD -> ${branch} (${commitId})`,
    statusHeadDetached: (id: string) => `HEAD detached at ${id}`,
    statusNoChanges: () => 'nothing to commit (working tree changes not simulated yet)',
    statusDirty: () => 'Changes not staged for commit',
    noCommitsYet: () => 'No commits yet',
  },
}

export function describeCommitForRevert(commit: Commit): string {
  return `Revert "${commit.message}"`
}

export function logSummaryLine(commit: Commit): string {
  return `${commit.id} ${commit.message}`
}
