import type { Commit, HeadRef } from '../../git/types'

export function collectReachableCommits(
  commits: Record<string, Commit>,
  branches: Record<string, string | null>,
  head: HeadRef,
): Set<string> {
  const reachable = new Set<string>()
  const stack: string[] = []

  Object.values(branches).forEach((commitId) => {
    if (commitId) {
      stack.push(commitId)
    }
  })

  if (head.commitId) {
    stack.push(head.commitId)
  }

  while (stack.length > 0) {
    const current = stack.pop()
    if (!current || reachable.has(current)) {
      continue
    }

    const commit = commits[current]
    if (!commit) {
      continue
    }

    reachable.add(current)
    for (const parentId of commit.parents) {
      if (parentId) {
        stack.push(parentId)
      }
    }
  }

  return reachable
}
