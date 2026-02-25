export type ParsedCommand =
  | { kind: 'init' }
  | { kind: 'commit'; message: string }
  | { kind: 'branch'; name: string }
  | { kind: 'switch'; name: string }
  | { kind: 'switchCreate'; name: string }
  | { kind: 'merge'; name: string }
  | { kind: 'revert'; commitId: string }
  | { kind: 'resetHard'; commitId: string }
  | { kind: 'checkout'; refType: 'branch'; name: string }
  | { kind: 'checkout'; refType: 'commit'; commitId: string }
  | { kind: 'status' }
  | { kind: 'logOneline' }
  | { kind: 'help' }
  | { kind: 'error'; message: string }
