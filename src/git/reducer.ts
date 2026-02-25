import type { Commit, HeadRef, TerminalEntry, GitState } from './types'

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

export const initialState: GitState = {
  commits: {},
  branches: {},
  head: {
    type: 'symbolic',
    branch: 'main',
    commitId: null,
  },
  editorText: '',
  terminal: {
    input: '',
    history: [],
    historyCursor: null,
    draftInput: '',
  },
  meta: {
    initialized: false,
    nextId: 1,
    lanes: {},
    laneCount: 0,
  },
}

export function reducer(state: GitState, action: GitAction): GitState {
  switch (action.type) {
    case GitActionType.Initialize:
      return action.payload
    case GitActionType.SetHead:
      return { ...state, head: action.payload }
    case GitActionType.EditorSetText:
      return { ...state, editorText: action.payload }
    case GitActionType.SetTerminalInput:
      return {
        ...state,
        terminal: {
          ...state.terminal,
          input: action.payload,
        },
      }
    case GitActionType.SetTerminalDraftInput:
      return {
        ...state,
        terminal: {
          ...state.terminal,
          draftInput: action.payload,
        },
      }
    case GitActionType.SetTerminalHistoryCursor:
      return {
        ...state,
        terminal: {
          ...state.terminal,
          historyCursor: action.payload,
        },
      }
    case GitActionType.PushTerminalEntry:
      return {
        ...state,
        terminal: {
          ...state.terminal,
          history: [...state.terminal.history, action.payload],
        },
      }
    case GitActionType.AddCommit:
      return {
        ...state,
        commits: {
          ...state.commits,
          [action.payload.id]: action.payload,
        },
      }
    case GitActionType.SetBranch:
      return {
        ...state,
        branches: {
          ...state.branches,
          [action.payload.branch]: action.payload.commitId,
        },
      }
    case GitActionType.AddBranch:
      return {
        ...state,
        branches: {
          ...state.branches,
          [action.payload.branch]: action.payload.commitId,
        },
      }
    case GitActionType.MarkInitialized:
      return {
        ...state,
        meta: {
          ...state.meta,
          initialized: true,
        },
      }
    default:
      return state
  }
}
