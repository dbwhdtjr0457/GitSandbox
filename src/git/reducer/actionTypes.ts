import type { Commit, GitState, HeadRef, TerminalEntry } from '../types'

export const GitActionType = {
  Initialize: 'INITIALIZE',
  SetHead: 'SET_HEAD',
  EditorSetText: 'EDITOR_SET_TEXT',
  SetTerminalInput: 'SET_TERMINAL_INPUT',
  SetTerminalDraftInput: 'SET_TERMINAL_DRAFT_INPUT',
  SetTerminalHistoryCursor: 'SET_TERMINAL_HISTORY_CURSOR',
  PushTerminalEntry: 'PUSH_TERMINAL_ENTRY',
  AddCommit: 'ADD_COMMIT',
  SetBranch: 'SET_BRANCH',
  AddBranch: 'ADD_BRANCH',
  MarkInitialized: 'MARK_INITIALIZED',
  SetMergeConflict: 'SET_MERGE_CONFLICT',
  SetCommitSnapshot: 'SET_COMMIT_SNAPSHOT',
} as const

export type GitAction =
  | { type: typeof GitActionType.Initialize; payload: GitState }
  | { type: typeof GitActionType.SetHead; payload: HeadRef }
  | { type: typeof GitActionType.EditorSetText; payload: string }
  | { type: typeof GitActionType.SetTerminalInput; payload: string }
  | { type: typeof GitActionType.SetTerminalDraftInput; payload: string }
  | { type: typeof GitActionType.SetTerminalHistoryCursor; payload: number | null }
  | { type: typeof GitActionType.PushTerminalEntry; payload: TerminalEntry }
  | { type: typeof GitActionType.AddCommit; payload: Commit }
  | { type: typeof GitActionType.SetBranch; payload: { branch: string; commitId: string | null } }
  | { type: typeof GitActionType.AddBranch; payload: { branch: string; commitId: string | null } }
  | { type: typeof GitActionType.MarkInitialized }
  | {
      type: typeof GitActionType.SetMergeConflict
      payload: GitState['meta']['mergeConflict'] | null
    }
  | {
      type: typeof GitActionType.SetCommitSnapshot
      payload: { commitId: string; snapshot: string }
    }
