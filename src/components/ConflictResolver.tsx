import { useState } from 'react'
import { DiffEditor } from '@monaco-editor/react'
import { MonacoEditor } from './MonacoEditor'

type ConflictResolverProps = {
  oursText: string
  theirsText: string
  resultText: string
  oursBranch: string
  theirsBranch: string
  onResultChange: (value: string) => void
  onAcceptOurs: () => void
  onAcceptTheirs: () => void
  onKeepResult: () => void
}

export function ConflictResolver({
  oursText,
  theirsText,
  resultText,
  oursBranch,
  theirsBranch,
  onResultChange,
  onAcceptOurs,
  onAcceptTheirs,
  onKeepResult,
}: ConflictResolverProps) {
  const [diffMode, setDiffMode] = useState<'none' | 'ours' | 'theirs'>('none')

  const isDiffOurs = diffMode === 'ours'
  const isDiffTheirs = diffMode === 'theirs'
  const isDiffVisible = isDiffOurs || isDiffTheirs

  return (
    <section className="conflict-resolver">
      <div className="conflict-toolbar">
        <button type="button" className="conflict-btn conflict-btn-ours" onClick={onAcceptOurs}>
          Accept OURS
        </button>
        <button type="button" className="conflict-btn conflict-btn-theirs" onClick={onAcceptTheirs}>
          Accept THEIRS
        </button>
        <button type="button" className="conflict-btn conflict-btn-keep" onClick={onKeepResult}>
          Keep RESULT
        </button>
        <button
          type="button"
          className={`conflict-btn ${isDiffOurs ? 'conflict-btn-active' : ''}`}
          onClick={() => setDiffMode(isDiffOurs ? 'none' : 'ours')}
        >
          OURS↔RESULT Diff
        </button>
        <button
          type="button"
          className={`conflict-btn ${isDiffTheirs ? 'conflict-btn-active' : ''}`}
          onClick={() => setDiffMode(isDiffTheirs ? 'none' : 'theirs')}
        >
          THEIRS↔RESULT Diff
        </button>
      </div>

      <div className="conflict-panels">
        <div className="conflict-pane">
          <header className="conflict-pane-header">OURS ({oursBranch})</header>
          <MonacoEditor value={oursText} onChange={() => {}} readOnly />
        </div>

        <div className="conflict-pane">
          <header className="conflict-pane-header">THEIRS ({theirsBranch})</header>
          <MonacoEditor value={theirsText} onChange={() => {}} readOnly />
        </div>

        <div className="conflict-pane conflict-result-pane">
          <header className="conflict-pane-header">RESULT</header>
          <MonacoEditor value={resultText} onChange={onResultChange} />
        </div>
      </div>

      {isDiffVisible && (
        <div className="conflict-diff-wrap">
          <DiffEditor
            height="100%"
            original={isDiffOurs ? oursText : theirsText}
            modified={resultText}
            options={{
              readOnly: true,
              renderSideBySide: true,
              fontSize: 14,
              minimap: { enabled: false },
              scrollbar: {
                useShadows: false,
              },
              wordWrap: 'on',
            }}
            language="markdown"
            originalLanguage="markdown"
            modifiedLanguage="markdown"
          />
        </div>
      )}
    </section>
  )
}

export default ConflictResolver
