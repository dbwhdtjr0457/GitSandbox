import type { LocaleStrings } from '../i18n/strings'

type AppHeaderProps = {
  strings: LocaleStrings
  onReset: () => void
  onOpenTutorial: () => void
  onOpenDemoCatalog: () => void
  isDemoRunning: boolean
  onToggleLocale: () => void
}

export function AppHeader({
  strings,
  onReset,
  onOpenTutorial,
  onOpenDemoCatalog,
  isDemoRunning,
  onToggleLocale,
}: AppHeaderProps) {
  return (
    <header className="app-header">
      <div className="app-header-title">{strings.header.title}</div>
      <div className="app-header-actions">
        <button type="button" className="app-help-button" onClick={onOpenTutorial} aria-label={strings.header.helpAria}>
          ?
        </button>

        <button
          type="button"
          className="app-demo-catalog-button"
          onClick={onOpenDemoCatalog}
          disabled={isDemoRunning}
        >
          {isDemoRunning ? strings.header.demoRunning : strings.header.demoCatalog}
        </button>

        <button
          type="button"
          className="app-locale-button"
          onClick={onToggleLocale}
          aria-label={strings.locale.switchLabel}
        >
          {strings.locale.switchLabel}
        </button>
        <button type="button" className="app-reset-button" onClick={onReset}>
          {strings.header.reset}
        </button>
      </div>
    </header>
  )
}
