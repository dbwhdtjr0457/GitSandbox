import type { GitState } from '../types'

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
