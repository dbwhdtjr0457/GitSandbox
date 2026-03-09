import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import { MantineProvider, createTheme } from '@mantine/core'

const theme = createTheme({
  primaryColor: 'cyan',
  defaultRadius: 'xl',
  fontFamily: '"Trebuchet MS", "Segoe UI", sans-serif',
  headings: {
    fontFamily: '"Trebuchet MS", "Segoe UI", sans-serif',
  },
})

export function renderWithProviders(ui: ReactElement) {
  return render(
    <MantineProvider theme={theme} defaultColorScheme="light">
      {ui}
    </MantineProvider>,
  )
}
