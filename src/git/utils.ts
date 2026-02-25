import type { Commit, GitState } from './types'

export function getHeadCommitId(state: GitState): string | null {
  const headCommitId = state.head.commitId
  if (headCommitId === null) {
    return null
  }

  return Object.prototype.hasOwnProperty.call(state.commits, headCommitId) ? headCommitId : null
}

export function collectAncestors(
  commits: Record<string, Commit>,
  startId: string | null,
): Set<string> {
  const ancestors = new Set<string>()
  if (!startId) {
    return ancestors
  }

  const stack: string[] = [startId]
  while (stack.length > 0) {
    const current = stack.pop()
    if (!current || ancestors.has(current)) {
      continue
    }

    const commit = commits[current]
    if (!commit) {
      continue
    }

    ancestors.add(current)
    for (const parentId of commit.parents) {
      stack.push(parentId)
    }
  }

  return ancestors
}

export function findLCA(
  commits: Record<string, Commit>,
  aId: string | null,
  bId: string | null,
): string | null {
  if (!aId || !bId) {
    return null
  }

  const ancestorsOfB = collectAncestors(commits, bId)
  if (!ancestorsOfB.size) {
    return null
  }

  const seen = new Set<string>()
  const stack: string[] = [aId]
  while (stack.length > 0) {
    const current = stack.pop()
    if (!current || seen.has(current)) {
      continue
    }

    if (ancestorsOfB.has(current)) {
      return current
    }

    seen.add(current)
    const commit = commits[current]
    if (!commit) {
      continue
    }

    for (const parentId of commit.parents) {
      stack.push(parentId)
    }
  }

  return null
}

export function isAncestor(
  ancestor: string | null,
  descendant: string | null,
  commits: Record<string, Commit>,
): boolean {
  if (ancestor === null) {
    return true
  }

  if (descendant === null) {
    return false
  }

  const ancestors = collectAncestors(commits, descendant)
  return ancestors.has(ancestor)
}
