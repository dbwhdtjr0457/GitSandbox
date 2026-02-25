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
        {history.map((entry) => (
          <div key={entry.id} className="terminal-entry">
            <div className="terminal-command">$ {entry.cmd}</div>
            {entry.out && <pre className="terminal-output">{entry.out}</pre>}
            {entry.err && <pre className="terminal-error">error: {entry.err}</pre>}
          </div>
        ))}
      </div>
      <div className="terminal-input-wrap">
        <label htmlFor="terminal-input" className="terminal-input-label">
          terminal
        </label>
        <textarea
          id="terminal-input"
          className="terminal-input"
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="type command and press Enter"
        />
      </div>
    </section>
  )
}
