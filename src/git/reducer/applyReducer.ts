import type { GitState } from '../types'
import { GitActionType, type GitAction } from './actionTypes'

export function reducer(state: GitState, action: GitAction): GitState {
  switch (action.type) {
    case GitActionType.Initialize:
      return action.payload
    case GitActionType.SetHead:
      return { ...state, head: action.payload }
    case GitActionType.EditorSetText:
      return { ...state, editorText: action.payload }
    case GitActionType.SetTerminalInput:
      return { ...state, terminal: { ...state.terminal, input: action.payload } }
    case GitActionType.SetTerminalDraftInput:
      return { ...state, terminal: { ...state.terminal, draftInput: action.payload } }
    case GitActionType.SetTerminalHistoryCursor:
      return { ...state, terminal: { ...state.terminal, historyCursor: action.payload } }
    case GitActionType.PushTerminalEntry:
      return { ...state, terminal: { ...state.terminal, history: [...state.terminal.history, action.payload] } }
    case GitActionType.AddCommit:
      return { ...state, commits: { ...state.commits, [action.payload.id]: action.payload } }
    case GitActionType.SetBranch:
    case GitActionType.AddBranch:
      return {
        ...state,
        branches: {
          ...state.branches,
          [action.payload.branch]: action.payload.commitId,
        },
      }
    case GitActionType.MarkInitialized:
      return { ...state, meta: { ...state.meta, initialized: true } }
    case GitActionType.SetMergeConflict:
      return {
        ...state,
        meta: {
          ...state.meta,
          mergeConflict: action.payload,
        },
      }
    case GitActionType.SetCommitSnapshot: {
      const currentCommit = state.commits[action.payload.commitId]
      if (!currentCommit) {
        return state
      }

      return {
        ...state,
        commits: {
          ...state.commits,
          [action.payload.commitId]: {
            ...currentCommit,
            snapshot: action.payload.snapshot,
          },
        },
      }
    }
    default:
      return state
  }
}
