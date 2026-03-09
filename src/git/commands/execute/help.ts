import type { ExecutionResult } from './executeUtils'

import type { GitState } from '../../types'

export function executeHelp(state: GitState): ExecutionResult {
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
      '  git checkout <branch|commit>',
      '  git merge <name>',
      '  git merge --abort',
      '  git revert <commitId>',
      '  git reset --hard <commitId>',
      '  git status',
      '  git log --oneline',
    ].join('\n'),
  }
}
