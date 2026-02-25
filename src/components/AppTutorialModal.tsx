import type { LocaleStrings } from '../i18n/strings'
import { useEffect, type MouseEvent } from 'react'

type AppTutorialModalProps = {
  open: boolean
  onClose: () => void
  strings: LocaleStrings
}

function AppTutorialModalComponent({ open, onClose, strings }: AppTutorialModalProps) {
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
          <h2>{strings.tutorial.title}</h2>
          <button
            type="button"
            className="tutorial-close"
            onClick={onClose}
            aria-label={strings.tutorial.closeAria}
          >
            ×
          </button>
        </header>
        <div className="tutorial-body">
          <section className="tutorial-section">
            <h3>{strings.tutorial.quickTipsTitle}</h3>
            <ul>
              {strings.tutorial.quickTips.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>

          <section className="tutorial-section">
            <h3>{strings.tutorial.availableTitle}</h3>
            <ul>
              {strings.tutorial.availableLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>

          <section className="tutorial-section">
            <h3>{strings.tutorial.workflowTitle}</h3>
            <ul>
              {strings.tutorial.workflowLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>

          <p className="tutorial-tip">{strings.tutorial.closeHint}</p>
          <p className="tutorial-tip">{strings.tutorial.demoHint}</p>
        </div>
      </section>
    </div>
  )
}

export { AppTutorialModalComponent as AppTutorialModal }
export default AppTutorialModalComponent
