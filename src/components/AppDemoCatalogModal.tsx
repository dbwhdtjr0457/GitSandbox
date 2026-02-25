import { type MouseEvent } from 'react'

type DemoStep =
  | { type: 'command'; line: string }
  | { type: 'editor'; text: string; note: string }

type DemoScenario = {
  id: string
  title: string
  description: string
  steps: DemoStep[]
}

type AppDemoCatalogModalProps = {
  open: boolean
  onClose: () => void
  demos: DemoScenario[]
  onRun: (scenarioId: string) => void
  isDemoRunning: boolean
}

function AppDemoCatalogModal({
  open,
  onClose,
  demos,
  onRun,
  isDemoRunning,
}: AppDemoCatalogModalProps) {
  if (!open) {
    return null
  }

  const onBackdropClick = () => {
    onClose()
  }

  const onPanelClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation()
  }

  const commandPreview = (steps: DemoStep[]) => {
    const lines = steps
      .map((item) => (item.type === 'command' ? item.line : `(demo) ${item.note}`))
      .filter(Boolean)
    const limit = 8
    const preview = lines.slice(0, limit)
    const extraCount = lines.length - limit
    return preview.concat(extraCount > 0 ? [`... and ${extraCount} more steps`] : []).join('\n')
  }

  return (
    <div className="demo-catalog-backdrop" onClick={onBackdropClick}>
      <section className="demo-catalog-modal" onClick={onPanelClick}>
        <header className="demo-catalog-header">
          <h2>Demo Scenarios</h2>
          <button type="button" className="tutorial-close" onClick={onClose} aria-label="Close demo catalog">
            x
          </button>
        </header>
        <div className="demo-catalog-body">
          <p className="demo-catalog-note">
            Each scenario resets the state first, then sends every command to the terminal with a short delay to visualize each
            step.
          </p>

          <div className="demo-catalog-list">
            {demos.map((scenario) => (
              <article className="demo-catalog-item" key={scenario.id}>
                <div className="demo-catalog-content">
                  <h3>{scenario.title}</h3>
                  <p>{scenario.description}</p>
                  <pre>{commandPreview(scenario.steps)}</pre>
                </div>
                <button
                  type="button"
                  className="app-demo-button"
                  onClick={() => onRun(scenario.id)}
                  disabled={isDemoRunning}
                >
                  Run
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export { AppDemoCatalogModal }
