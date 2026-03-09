'use client'

import { useTTSStore } from '@/stores/ttsStore'

export default function EditorPanel() {
  const { text, engine, isGenerating, generateAudio, updateSettings } = useTTSStore()
  
  const charCount = text.length
  const maxChars = 5000
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0

  return (
    <>
      <div className="editor-toolbar">
        <div className="toolbar-left">
          <span className="toolbar-title">Text Editor</span>
        </div>
        <div className="toolbar-right">
          <span className="char-count">{wordCount} words · {charCount} / {maxChars}</span>
        </div>
      </div>

      <div className="editor-body">
        <div className="text-editor">
          <textarea
            className="text-area"
            placeholder="Start typing or paste your text here... VOXAR will bring your words to life with studio-quality voice synthesis."
            value={text}
            onChange={e => { if (e.target.value.length <= maxChars) updateSettings({ text: e.target.value }) }}
          />
        </div>
      </div>
    </>
  )
}
