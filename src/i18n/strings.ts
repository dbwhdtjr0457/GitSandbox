export type Locale = 'ko' | 'en'

type DemoText = {
  title: string
  description: string
}

type DemoSuffix = (count: number) => string

export type LocaleStrings = {
  locale: {
    switchLabel: string
  }
  header: {
    title: string
    initialized: string
    notInitialized: string
    detached: string
    head: string
    helpAria: string
    demoCatalog: string
    demoRunning: string
    logState: string
    reset: string
    toggleLocale: string
  }
  terminal: {
    welcome: string
    runHelp: string
    inputPlaceholder: string
    historyPrefix: string
    errorPrefix: string
  }
  tutorial: {
    title: string
    closeAria: string
    quickTipsTitle: string
    quickTips: string[]
    availableTitle: string
    availableLines: string[]
    workflowTitle: string
    workflowLines: string[]
    closeHint: string
    demoHint: string
  }
  demo: {
    title: string
    note: string
    runLabel: string
    closeAria: string
    autoEditorLine: string
    moreSuffix: DemoSuffix
    items: Record<string, DemoText>
  }
  conflict: {
    acceptOurs: string
    acceptTheirs: string
    keepResult: string
    diffOurs: string
    diffTheirs: string
    oursLabel: (branch: string) => string
    theirsLabel: (branch: string) => string
    resultLabel: string
  }
  graph: {
    legend: string
    branchPrefix: string
    noCommits: string
    initLine1: string
    initLine2: string
    parentsLabel: string
    parentsNone: string
    dangling: string
  }
  generic: {
    head: string
    commit: string
  }
}

const LOCALE_KEY = 'gitsandbox-locale'

const ko: LocaleStrings = {
  locale: {
    switchLabel: 'English',
  },
  header: {
    title: 'Git Sandbox',
    initialized: '저장소가 초기화됨',
    notInitialized: '저장소가 초기화되지 않음',
    detached: 'detached',
    head: 'HEAD',
    helpAria: '튜토리얼 열기',
    demoCatalog: '데모 시나리오',
    demoRunning: '데모 실행 중...',
    logState: '상태 출력',
    reset: '초기화',
    toggleLocale: 'English',
  },
  terminal: {
    welcome: 'Git Sandbox 터미널에 오신 것을 환영합니다',
    runHelp: '도움이 필요하면 help를 입력하세요.',
    inputPlaceholder: '명령어를 입력한 뒤 Enter 키를 누르세요',
    historyPrefix: '$',
    errorPrefix: '오류:',
  },
  tutorial: {
    title: 'Git Sandbox 사용법',
    closeAria: '튜토리얼 닫기',
    quickTipsTitle: '빠른 시작',
    quickTips: [
      '왼쪽 그래프와 오른쪽 에디터/터미널을 함께 보며 상태 변화를 함께 확인하세요.',
      '첫 화면에서 help를 실행한 뒤, 시나리오 버튼으로 실습을 진행하면 이해가 빠릅니다.',
      '입력한 명령은 1초 간격으로 순차 실행되어 결과가 바로 보이므로 추적이 쉽습니다.',
    ],
    availableTitle: '지원 명령어',
    availableLines: [
      'help',
      'git init',
      'git commit -m "message"',
      'git branch <name>',
      'git switch <name>',
      'git switch -c <name>',
      'git checkout <branch|commitId>',
      'git merge <branch>',
      'git merge --abort',
      'git revert <commitId>',
      'git reset --hard <commitId>',
      'git status',
      'git log --oneline',
    ],
    workflowTitle: '추천 학습 흐름',
    workflowLines: [
      'help: 지원 명령어와 실습 포인트를 확인합니다.',
      'switch/checkout: 브랜치 이동, detached HEAD, reset 후 에디터 연동을 확인합니다.',
      'merge: fast-forward와 non-fast-forward 흐름(merge commit 포함)을 확인합니다.',
      'reset / revert / status / log: 포인터 이동과 이력 추적 방식을 확인합니다.',
    ],
    closeHint: '입력한 명령은 터미널 히스토리에 기록되며, 결과는 한 줄씩 순서대로 표시됩니다.',
    demoHint:
      '데모는 실행 전 상태를 초기화한 뒤 자동으로 재생되므로, 언제든 동일한 출발점에서 연습 가능합니다.',
  },
  demo: {
    title: '데모 시나리오',
    note: '각 시나리오를 실행하면 먼저 상태를 초기화한 뒤 짧은 간격으로 명령을 실행합니다.',
    runLabel: '실행',
    closeAria: '데모 목록 닫기',
    autoEditorLine: '(데모) 편집기 자동 입력',
    moreSuffix: (count) => `... 외 ${count}개`,
    items: {
      help: { title: '1) help', description: '지원 명령어 목록부터 확인합니다.' },
      'init-only': { title: '2) git init only', description: '저장소를 한 번만 초기화합니다.' },
      'status-before-init': {
        title: '3) status before init',
        description: '초기화되지 않은 상태의 status 에러를 확인합니다.',
      },
      'init-status': {
        title: '4) init + status',
        description: 'init 후 바로 status를 실행합니다.',
      },
      'single-commit': {
        title: '5) single commit',
        description: '첫 커밋 생성 후 그래프에 첫 노드가 생기는지 확인합니다.',
      },
      'two-commits': {
        title: '6) two commits',
        description: '두 개의 커밋으로 짧은 이력과 커밋 ID를 확인합니다.',
      },
      'create-branch': {
        title: '7) branch create',
        description: '현재 HEAD에서 branch를 생성합니다.',
      },
      'switch-to-branch': {
        title: '8) switch branch',
        description: '브랜치로 전환 후 커밋을 이어 작성합니다.',
      },
      'switch-create-branch': {
        title: '9) switch -c',
        description: '한 번에 새 브랜치 생성 및 전환을 확인합니다.',
      },
      'checkout-branch': {
        title: '10) checkout branch',
        description: '브랜치 이름으로 checkout을 수행합니다.',
      },
      'checkout-commit': {
        title: '11) checkout commit',
        description: '커밋 해시로 detached 상태를 확인합니다.',
      },
      'switch-error': {
        title: '12) invalid switch error',
        description: '잘못된 브랜치 이름 에러를 확인합니다.',
      },
      'merge-ff': {
        title: '13) fast-forward merge',
        description: 'Fast-forward 병합 케이스를 확인합니다.',
      },
      'merge-non-ff': {
        title: '14) non-fast-forward merge',
        description: '분기 후 non-FF 병합 커밋이 생성되는 흐름을 확인합니다.',
      },
      'log-oneline-baseline': {
        title: '15) log oneline',
        description: 'HEAD 기준 1-parent 로그 순서를 확인합니다.',
      },
      'revert-only': {
        title: '16) revert command',
        description: '기존 커밋을 되돌리는 revert 커밋을 생성합니다.',
      },
      'reset-hard-only': {
        title: '17) reset --hard',
        description: '포인터와 에디터 스냅샷 롤백을 확인합니다.',
      },
      basic: {
        title: '18) combined: basic flow',
        description: '초기화/커밋/브랜치/병합을 통합해 확인합니다.',
      },
      conflict: {
        title: '19) combined: merge conflict',
        description: '각 브랜치에서 다른 내용을 만들고 merge를 통해 흐름을 확인합니다.',
      },
      'revert-reset': {
        title: '20) combined: revert + reset',
        description: 'revert 후 reset --hard로 되돌림을 확인합니다.',
      },
    },
  },
  conflict: {
    acceptOurs: 'OURS 적용',
    acceptTheirs: 'THEIRS 적용',
    keepResult: 'RESULT 유지',
    diffOurs: 'OURS↔RESULT 비교',
    diffTheirs: 'THEIRS↔RESULT 비교',
    oursLabel: (branch) => `OURS (${branch})`,
    theirsLabel: (branch) => `THEIRS (${branch})`,
    resultLabel: 'RESULT',
  },
  graph: {
    legend: '노드/HEAD 범례, 브랜치 배지, 레인 라인',
    branchPrefix: 'branch: ',
    noCommits: '아직 커밋이 없습니다',
    initLine1: '레포지토리를 초기화하고',
    initLine2: '커밋을 추가하면 그래프가 시작됩니다',
    parentsLabel: '부모',
    parentsNone: '없음',
    dangling: 'dangling',
  },
  generic: {
    head: 'HEAD',
    commit: '커밋',
  },
}

const en: LocaleStrings = {
  locale: {
    switchLabel: '한국어',
  },
  header: {
    title: 'Git Sandbox',
    initialized: 'Initialized',
    notInitialized: 'Not initialized',
    detached: 'detached',
    head: 'HEAD',
    helpAria: 'Open tutorial',
    demoCatalog: 'Demo Scenarios',
    demoRunning: 'Demo running...',
    logState: 'Log State',
    reset: 'Reset',
    toggleLocale: 'KO',
  },
  terminal: {
    welcome: 'Welcome to Git Sandbox Terminal',
    runHelp: 'Run help to list available commands.',
    inputPlaceholder: 'type command and press Enter',
    historyPrefix: '$',
    errorPrefix: 'error:',
  },
  tutorial: {
    title: 'Git Sandbox Tutorial',
    closeAria: 'Close tutorial',
    quickTipsTitle: 'Quick start',
    quickTips: [
      'Use left graph and right editor/terminal together to inspect state changes in one view.',
      'Run help first, then start with a small scenario from demo catalog for guided practice.',
      'Commands run with 1-second delay, so command-by-command output is easy to follow.',
    ],
    availableTitle: 'Available commands',
    availableLines: [
      'help',
      'git init',
      'git commit -m "message"',
      'git branch <name>',
      'git switch <name>',
      'git switch -c <name>',
      'git checkout <branch|commitId>',
      'git merge <branch>',
      'git merge --abort',
      'git revert <commitId>',
      'git reset --hard <commitId>',
      'git status',
      'git log --oneline',
    ],
    workflowTitle: 'Learning flow',
    workflowLines: [
      'help: Check supported commands and what to try next.',
      'switch/checkout: Observe branch move, detached state, and editor snapshot behavior.',
      'merge: Observe fast-forward and non-fast-forward outcomes (including merge commit).',
      'reset / revert / status / log: Verify pointer movement and history tracking.',
    ],
    closeHint: 'Inputs are appended to terminal history and shown line by line in execution order.',
    demoHint:
      'Demos auto-run from a reset state with short intervals, making repeated practice easy.',
  },
  demo: {
    title: 'Demo Scenarios',
    note: 'Each scenario resets state first and sends commands with a short delay.',
    runLabel: 'Run',
    closeAria: 'Close demo catalog',
    autoEditorLine: '(demo) editor auto update',
    moreSuffix: (count) => `... and ${count} more steps`,
    items: {
      help: { title: '1) help', description: 'Check available commands first.' },
      'init-only': { title: '2) git init only', description: 'Initialize repository once.' },
      'status-before-init': {
        title: '3) status before init',
        description: 'See error when running status before initialization.',
      },
      'init-status': {
        title: '4) init + status',
        description: 'Run init and immediately check status.',
      },
      'single-commit': {
        title: '5) single commit',
        description: 'Create first commit and watch graph node appear.',
      },
      'two-commits': { title: '6) two commits', description: 'Check short commit chain and IDs.' },
      'create-branch': {
        title: '7) branch create',
        description: 'Create a branch from current HEAD.',
      },
      'switch-to-branch': {
        title: '8) switch branch',
        description: 'Switch to branch and continue committing.',
      },
      'switch-create-branch': {
        title: '9) switch -c',
        description: 'Create and switch in one command.',
      },
      'checkout-branch': {
        title: '10) checkout branch',
        description: 'Checkout using branch name.',
      },
      'checkout-commit': {
        title: '11) checkout commit',
        description: 'Move to detached state by commit hash.',
      },
      'switch-error': {
        title: '12) invalid switch error',
        description: 'Check invalid branch error handling.',
      },
      'merge-ff': {
        title: '13) fast-forward merge',
        description: 'Observe fast-forward merge case.',
      },
      'merge-non-ff': {
        title: '14) non-fast-forward merge',
        description: 'Diverge commits then create a non-FF merge commit.',
      },
      'log-oneline-baseline': {
        title: '15) log oneline',
        description: 'Check first-parent log order from HEAD.',
      },
      'revert-only': {
        title: '16) revert command',
        description: 'Create revert commit from existing commit.',
      },
      'reset-hard-only': {
        title: '17) reset --hard',
        description: 'Verify pointer rollback and editor snapshot restore.',
      },
      basic: {
        title: '18) combined: basic flow',
        description: 'Integrated basic init/commit/merge flow.',
      },
      conflict: {
        title: '19) combined: merge conflict',
        description: 'Create divergence and run merge flow.',
      },
      'revert-reset': {
        title: '20) combined: revert + reset',
        description: 'Revert then reset --hard rollback pointer and editor snapshot.',
      },
    },
  },
  conflict: {
    acceptOurs: 'Accept OURS',
    acceptTheirs: 'Accept THEIRS',
    keepResult: 'Keep RESULT',
    diffOurs: 'OURS↔RESULT Diff',
    diffTheirs: 'THEIRS↔RESULT Diff',
    oursLabel: (branch) => `OURS (${branch})`,
    theirsLabel: (branch) => `THEIRS (${branch})`,
    resultLabel: 'RESULT',
  },
  graph: {
    legend: 'Node/HEAD legend, branch badges, lane guides',
    branchPrefix: 'branch: ',
    noCommits: 'No commits yet',
    initLine1: 'Initialize repo and',
    initLine2: 'commit to start graph',
    parentsLabel: 'parents',
    parentsNone: 'none',
    dangling: 'dangling',
  },
  generic: {
    head: 'HEAD',
    commit: 'commit',
  },
}

const localeMap: Record<Locale, LocaleStrings> = { ko, en }

export function getLocaleStrings(locale: Locale): LocaleStrings {
  return localeMap[locale]
}

export function getSavedLocale(): Locale {
  if (typeof window === 'undefined') {
    return 'ko'
  }

  const raw = window.localStorage.getItem(LOCALE_KEY)
  if (raw === 'en' || raw === 'ko') {
    return raw
  }

  return 'ko'
}

export function saveLocale(locale: Locale): void {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(LOCALE_KEY, locale)
}

export const DEFAULT_LOCALE: Locale = 'ko'
