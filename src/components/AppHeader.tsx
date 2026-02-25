import type { HeadRef } from '../git/types'

type AppHeaderProps = {
  initialized: boolean
  head: HeadRef
  onLogState: () => void
  onReset: () => void
  onOpenTutorial: () => void
}

export function AppHeader({
  initialized,
  head,
  onLogState,
  onReset,
  onOpenTutorial,
}: AppHeaderProps) {
  return (
    <header className="app-header">
      <div className="app-header-title">Git Sandbox</div>
      <div className="app-header-sub">
        {initialized ? 'Initialized' : 'Not initialized'} / HEAD: {head.type === 'symbolic' ? head.branch : 'detached'}
        {head.commitId ? ` (${head.commitId})` : ''}
      </div>
      <div className="app-header-actions">
        <button
          type="button"
          className="app-help-button"
          onClick={onOpenTutorial}
          aria-label="튜토리얼 열기"
        >
          ?
        </button>
        <button type="button" className="app-log-button" onClick={onLogState}>
          Log State
        </button>
        <button type="button" className="app-reset-button" onClick={onReset}>
          Reset
        </button>
      </div>
    </header>
  )
}
