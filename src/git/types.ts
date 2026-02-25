export type Commit = {
  id: string
  message: string
  parentId: string | null
  branch: string | null
  lane: number
  snapshot: string
  timestamp: number
}

export type HeadRef = {
  type: 'symbolic'
  branch: string | null
  commitId: string | null
}

export type TerminalEntry = {
  id: string
  cmd: string
  out: string
  err?: string
  timestamp: number
}

export type GitState = {
  commits: Record<string, Commit>
  branches: Record<string, string | null>
  head: HeadRef
  editorText: string
  terminal: {
    input: string
    history: TerminalEntry[]
    historyCursor: number | null
    draftInput: string
  }
  meta: {
    initialized: boolean
    nextId: number
    lanes: Record<string, number>
    laneCount: number
  }
}
