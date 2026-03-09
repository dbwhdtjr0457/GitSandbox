import { ActionIcon, Button, Group, Paper, Title } from '@mantine/core'
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
    <Paper component="header" className="app-header" radius="28px" shadow="sm" withBorder>
      <Group justify="space-between" align="center" gap="md" wrap="wrap">
        <div>
          <Title order={1} className="app-header-title">
            {strings.header.title}
          </Title>
        </div>
        <Group className="app-header-actions" gap="xs" wrap="wrap">
          <ActionIcon
            variant="default"
            color="gray"
            radius="xl"
            size="lg"
            onClick={onOpenTutorial}
            aria-label={strings.header.helpAria}
          >
            ?
          </ActionIcon>

          <Button
            variant="light"
            color="cyan"
            size="md"
            className="app-demo-catalog-button"
            onClick={onOpenDemoCatalog}
            loading={isDemoRunning}
          >
            {isDemoRunning ? strings.header.demoRunning : strings.header.demoCatalog}
          </Button>

          <Button
            variant="default"
            color="gray"
            size="md"
            className="app-locale-button"
            onClick={onToggleLocale}
            aria-label={strings.locale.switchLabel}
          >
            {strings.locale.switchLabel}
          </Button>
          <Button color="blue" size="md" className="app-reset-button" onClick={onReset}>
            {strings.header.reset}
          </Button>
        </Group>
      </Group>
    </Paper>
  )
}
