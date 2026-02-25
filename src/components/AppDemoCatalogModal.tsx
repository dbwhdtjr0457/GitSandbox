import { type MouseEvent } from 'react'
import type { LocaleStrings } from '../i18n/strings'

type DemoStep =
  | { type: 'command'; line: string }
  | { type: 'editor'; text: string }

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
  strings: LocaleStrings
}

function AppDemoCatalogModal({
  open,
  onClose,
  demos,
  onRun,
  isDemoRunning,
  strings,
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
      .map((item) => (item.type === 'command' ? item.line : strings.demo.autoEditorLine))
      .filter(Boolean)
    const limit = 8
    const preview = lines.slice(0, limit)
    const extraCount = lines.length - limit
    return extraCount > 0 ? [...preview, strings.demo.moreSuffix(extraCount)].join('\n') : preview.join('\n')
  }

  return (
    <div className="demo-catalog-backdrop" onClick={onBackdropClick}>
      <section className="demo-catalog-modal" onClick={onPanelClick}>
        <header className="demo-catalog-header">
          <h2>{strings.demo.title}</h2>
          <button type="button" className="tutorial-close" onClick={onClose} aria-label={strings.demo.closeAria}>
            ×
          </button>
        </header>
        <div className="demo-catalog-body">
          <p className="demo-catalog-note">{strings.demo.note}</p>

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
                  {strings.demo.runLabel}
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
