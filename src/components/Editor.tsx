type EditorProps = {
  value: string
  onChange: (value: string) => void
}

export function Editor({ value, onChange }: EditorProps) {
  return (
    <div className="editor-wrap">
      <label className="editor-label" htmlFor="editor-textarea">
        Editor
      </label>
      <textarea
        id="editor-textarea"
        className="editor-textarea"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}
