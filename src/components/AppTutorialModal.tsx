import { useEffect, type MouseEvent } from 'react'

const quickTips = [
  '이 시뮬레이터는 좌측 그래프(커밋/브랜치/병합)와 우측 터미널(실행 이력)을 한 화면에서 함께 보여줍니다.',
  '명령은 한 줄씩 실행되며, 멀티라인 입력은 위에서 아래로 순차 실행 후 각 결과가 터미널에 즉시 누적됩니다.',
  'HEAD 이동, reset, merge 결과에 따라 에디터 내용이 해당 커밋 스냅샷으로 반영됩니다.',
]

const commandGroups = [
  {
    title: '현재 지원 명령',
    lines: [
      'help',
      'git init',
      'git commit -m "message"',
      'git branch <name>',
      'git switch <name>',
      'git switch -c <name>',
      'git checkout <branch|commit>',
      'git merge <branch>',
      'git revert <commitId>',
      'git reset --hard <commitId>',
      'git status',
      'git log --oneline',
    ],
  },
  {
    title: '주요 기능 동작 포인트',
    lines: [
      'help: 지원 명령 목록과 안내 표시',
      'checkout/detached: 브랜치 또는 커밋을 선택해 HEAD 전환',
      'merge: FF/Non-FF(merge commit) 모두 확인',
      'conflict: 브랜치/에디터 충돌 입력 시 충돌 해결 화면으로 전환',
      '멀티라인: 명령 여러 줄을 붙여 넣어도 단계별 실행',
    ],
  },
  {
    title: '데모 기능',
    lines: [
      '헤더의 “Demo Scenarios”에서 명령별/조합별 시연 시나리오 실행',
      '시나리오 실행 전에는 상태가 초기화되어 항상 독립적으로 재현',
      '현재 테스트/확인 목적으로 상태 덤프(log state) 버튼 제공',
    ],
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
            {quickTips.map((step) => (
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
          <p className="tutorial-tip">
            팁: 입력한 명령은 터미널에서 즉시 실행 결과를 보며 상태 변경(그래프/헤더/에디터)도 같이 확인할 수 있습니다.
          </p>
          <p className="tutorial-tip">
            팁: 데모를 한 번에 너무 많이 돌리기보다 개별 시나리오부터 실행하면 동작 이해가 빠릅니다.
          </p>
        </div>
      </section>
    </div>
  )
}

export { AppTutorialModalComponent as AppTutorialModal }
export default AppTutorialModalComponent

