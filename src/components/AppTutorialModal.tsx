import { useEffect, type MouseEvent } from 'react'

const steps = [
  '터미널에서 GitSandbox가 지원하는 명령어를 직접 실행해보세요.',
  '명령어 실행 결과는 오른쪽 터미널 패널에 즉시 기록됩니다.',
  '왼쪽 그래프는 커밋/브랜치/병합 흐름을 시각화합니다.',
]

const commandGroups = [
  {
    title: '기본 사용법',
    lines: [
      'help: 지원 명령 목록 확인',
      'git init: 저장소 초기화',
      'git commit -m "메시지"',
      'git status: 현재 HEAD/브랜치 상태 확인',
    ],
  },
  {
    title: '브랜치',
    lines: ['git branch <name>', 'git switch <name>', 'git switch -c <name>'],
  },
  {
    title: '체크아웃/리셋/리버트',
    lines: [
      'git checkout <branch|commit>',
      'git revert <commitId>',
      'git reset --hard <commitId>',
    ],
  },
  {
    title: '로그/병합',
    lines: ['git log --oneline', 'git merge <branch>', 'Detached HEAD 이동 후에도 커밋 가능'],
  },
]

type AppTutorialModalProps = {
  open: boolean
  onClose: () => void
}

function AppTutorialModalComponent({ open, onClose }: AppTutorialModalProps) {
  if (!open) {
    return null
  }

  const onBackdropClick = () => {
    onClose()
  }

  const onPanelClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation()
  }

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (open) {
      window.addEventListener('keydown', onKeyDown)
    }

    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  return (
    <div className="tutorial-backdrop" onClick={onBackdropClick}>
      <section className="tutorial-modal" onClick={onPanelClick}>
        <header className="tutorial-header">
          <h2>Git Sandbox 튜토리얼</h2>
          <button type="button" className="tutorial-close" onClick={onClose} aria-label="튜토리얼 닫기">
            ×
          </button>
        </header>
        <div className="tutorial-body">
          <ul className="tutorial-list">
            {steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
          {commandGroups.map((group) => (
            <div key={group.title} className="tutorial-section">
              <h3>{group.title}</h3>
              <ul>
                {group.lines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          ))}
          <p className="tutorial-tip">팁: 여러 줄로 명령어를 붙여 넣어도 순차적으로 실행됩니다.</p>
          <p className="tutorial-tip">팁: 브랜치 이동 시 에디터 내용은 해당 커밋 스냅샷으로 갱신됩니다.</p>
        </div>
      </section>
    </div>
  )
}

export { AppTutorialModalComponent as AppTutorialModal }
export default AppTutorialModalComponent
