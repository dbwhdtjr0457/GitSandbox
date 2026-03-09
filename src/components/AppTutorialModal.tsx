import { List, Modal, Paper, Stack, Text, Title } from '@mantine/core'
import type { LocaleStrings } from '../i18n/strings'

type AppTutorialModalProps = {
  open: boolean
  onClose: () => void
  strings: LocaleStrings
}

function AppTutorialModalComponent({ open, onClose, strings }: AppTutorialModalProps) {
  return (
    <Modal
      opened={open}
      onClose={onClose}
      title={strings.tutorial.title}
      centered
      size="xl"
      radius="24px"
      overlayProps={{ backgroundOpacity: 0.6, blur: 6 }}
      closeButtonProps={{ 'aria-label': strings.tutorial.closeAria }}
      classNames={{
        content: 'app-modal-content',
        header: 'app-modal-header',
        body: 'app-modal-body',
      }}
    >
      <Stack gap="md">
        <Paper className="tutorial-section-card" radius="xl" p="md" withBorder>
          <Stack gap="xs">
            <Title order={3}>{strings.tutorial.quickTipsTitle}</Title>
            <List spacing="xs">
              {strings.tutorial.quickTips.map((line) => (
                <List.Item key={line}>{line}</List.Item>
              ))}
            </List>
          </Stack>
        </Paper>

        <Paper className="tutorial-section-card" radius="xl" p="md" withBorder>
          <Stack gap="xs">
            <Title order={3}>{strings.tutorial.availableTitle}</Title>
            <List spacing="xs">
              {strings.tutorial.availableLines.map((line) => (
                <List.Item key={line}>{line}</List.Item>
              ))}
            </List>
          </Stack>
        </Paper>

        <Paper className="tutorial-section-card" radius="xl" p="md" withBorder>
          <Stack gap="xs">
            <Title order={3}>{strings.tutorial.workflowTitle}</Title>
            <List spacing="xs">
              {strings.tutorial.workflowLines.map((line) => (
                <List.Item key={line}>{line}</List.Item>
              ))}
            </List>
          </Stack>
        </Paper>

        <Text size="sm" c="dimmed">
          {strings.tutorial.closeHint}
        </Text>
        <Text size="sm" c="dimmed">
          {strings.tutorial.demoHint}
        </Text>
      </Stack>
    </Modal>
  )
}

export { AppTutorialModalComponent as AppTutorialModal }
export default AppTutorialModalComponent
