import type { HeadRef } from '../git/types'

type AppHeaderProps = {
  initialized: boolean
  head: HeadRef
  onLogState: () => void
  onReset: () => void
  onOpenTutorial: () => void
  onOpenDemoCatalog: () => void
  isDemoRunning: boolean
}

export function AppHeader({
  initialized,
  head,
  onLogState,
  onReset,
  onOpenTutorial,
  onOpenDemoCatalog,
  isDemoRunning,
}: AppHeaderProps) {
  return (
    <header className="app-header">
      <div className="app-header-title">Git Sandbox</div>
      <div className="app-header-sub">
        {initialized ? 'Initialized' : 'Not initialized'} / HEAD: {head.type === 'symbolic' ? head.branch : 'detached'}
        {head.commitId ? ` (${head.commitId})` : ''}
      </div>
      <div className="app-header-actions">
        <button type="button" className="app-help-button" onClick={onOpenTutorial} aria-label="Open tutorial">
          ?
        </button>

        <button
          type="button"
          className="app-demo-catalog-button"
          onClick={onOpenDemoCatalog}
          disabled={isDemoRunning}
        >
          {isDemoRunning ? 'Demo running...' : 'Demo Scenarios'}
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

