import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MantineProvider, createTheme } from '@mantine/core'
import '@mantine/core/styles.css'
import './index.css'
import { App } from './App'

const theme = createTheme({
  primaryColor: 'cyan',
  defaultRadius: 'xl',
  fontFamily: '"Trebuchet MS", "Segoe UI", sans-serif',
  headings: {
    fontFamily: '"Trebuchet MS", "Segoe UI", sans-serif',
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="light">
      <App />
    </MantineProvider>
  </StrictMode>,
)
