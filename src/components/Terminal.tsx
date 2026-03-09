import type { KeyboardEvent } from 'react'
import { useEffect, useRef } from 'react'
import type { TerminalEntry } from '../git/types'

type TerminalProps = {
  input: string
  history: TerminalEntry[]
  onInputChange: (value: string) => void
  onSubmit: () => void
  onHistoryUp: () => void
  onHistoryDown: () => void
}

const terminalEnglishText = {
  welcome: 'Welcome to Git Sandbox Terminal',
  runHelpPrefix: 'Type ',
  helpWord: 'help',
  runHelpSuffix: ' to list available commands.',
  prompt: '$',
  errorPrefix: 'error:',
  inputPlaceholder: 'Type command and press Enter',
}

export function Terminal({
  input,
  history,
  onInputChange,
  onSubmit,
  onHistoryUp,
  onHistoryDown,
}: TerminalProps) {
  const logRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [history])

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      onSubmit()
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      onHistoryUp()
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      onHistoryDown()
    }
  }

  return (
    <section className="terminal-panel">
      <div ref={logRef} className="terminal-history">
        <div className="terminal-empty">
          <div className="terminal-empty-line">{terminalEnglishText.welcome}</div>
          <div className="terminal-empty-line">
            <span>{terminalEnglishText.runHelpPrefix}</span>{' '}
            <strong>{terminalEnglishText.helpWord}</strong>
            <span>{terminalEnglishText.runHelpSuffix}</span>
          </div>
          <div className="terminal-empty-line">{terminalEnglishText.prompt} git</div>
        </div>
        {history.map((entry) => (
          <div key={entry.id} className="terminal-entry">
            <div className="terminal-command">
              {terminalEnglishText.prompt} {entry.cmd}
            </div>
            {entry.out && <pre className="terminal-output">{entry.out}</pre>}
            {entry.err && (
              <pre className="terminal-error">
                {terminalEnglishText.errorPrefix} {entry.err}
              </pre>
            )}
          </div>
        ))}
      </div>
      <div className="terminal-input-wrap">
        <div className="terminal-input-row">
          <label htmlFor="terminal-input" className="terminal-input-prefix">
            {terminalEnglishText.prompt}
          </label>
          <textarea
            id="terminal-input"
            className="terminal-input"
            value={input}
            onChange={(event) => onInputChange(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={terminalEnglishText.inputPlaceholder}
          />
        </div>
      </div>
    </section>
  )
}
