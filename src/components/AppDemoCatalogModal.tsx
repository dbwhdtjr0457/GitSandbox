import { Button, Code, Group, Modal, Paper, Stack, Text, Title } from '@mantine/core'
import type { LocaleStrings } from '../i18n/strings'

type DemoStep = { type: 'command'; line: string } | { type: 'editor'; text: string }

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
  const commandPreview = (steps: DemoStep[]) => {
    const lines = steps
      .map((item) => (item.type === 'command' ? item.line : strings.demo.autoEditorLine))
      .filter(Boolean)
    const limit = 8
    const preview = lines.slice(0, limit)
    const extraCount = lines.length - limit
    return extraCount > 0
      ? [...preview, strings.demo.moreSuffix(extraCount)].join('\n')
      : preview.join('\n')
  }

  return (
    <Modal
      opened={open}
      onClose={onClose}
      title={<span className="demo-modal-title">{strings.demo.title}</span>}
      centered
      size="60rem"
      radius="24px"
      overlayProps={{ backgroundOpacity: 0.6, blur: 6 }}
      closeButtonProps={{ 'aria-label': strings.demo.closeAria }}
      classNames={{
        content: 'demo-modal-content',
        header: 'demo-modal-header',
        body: 'demo-modal-body',
        title: 'demo-modal-title-slot',
        close: 'demo-modal-close',
      }}
    >
      <Stack gap="md">
        <Text className="demo-catalog-note">{strings.demo.note}</Text>

        <div className="demo-catalog-list">
          {demos.map((scenario) => (
            <Paper className="demo-catalog-item" key={scenario.id} radius="xl" p="md" withBorder>
              <Group justify="space-between" align="flex-start" gap="md" wrap="wrap">
                <div className="demo-catalog-content">
                  <Stack gap={6}>
                    <Title order={3}>{scenario.title}</Title>
                    <Text size="sm" c="dimmed">
                      {scenario.description}
                    </Text>
                  </Stack>
                  <Code block className="demo-catalog-preview">
                    {commandPreview(scenario.steps)}
                  </Code>
                </div>
                <Button
                  className="app-demo-button"
                  color="cyan"
                  variant="light"
                  onClick={() => onRun(scenario.id)}
                  disabled={isDemoRunning}
                >
                  {strings.demo.runLabel}
                </Button>
              </Group>
            </Paper>
          ))}
        </div>
      </Stack>
    </Modal>
  )
}

export { AppDemoCatalogModal }
