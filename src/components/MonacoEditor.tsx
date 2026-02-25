import { useMemo } from 'react'
import Editor from '@monaco-editor/react'

export type MonacoEditorProps = {
  value: string
  onChange: (value: string) => void
  readOnly?: boolean
}

const defaultOptions = {
  fontSize: 16,
  lineNumbers: 'on' as const,
  wordWrap: 'on' as const,
  lineNumbersMinChars: 2,
  lineDecorationsWidth: 3,
  glyphMargin: false,
  folding: false,
  minimap: { enabled: false },
  automaticLayout: true,
  scrollbar: {
    alwaysConsumeMouseWheel: false,
  },
}

export function MonacoEditor({ value, onChange, readOnly = false }: MonacoEditorProps) {
  const options = useMemo(
    () => ({
      ...defaultOptions,
      readOnly,
    }),
    [readOnly],
  )

  const handleChange = (newValue?: string) => {
    onChange(newValue ?? '')
  }

  return <Editor className="editor-cm" height="100%" value={value} onChange={handleChange} options={options} />
}

export default MonacoEditor
