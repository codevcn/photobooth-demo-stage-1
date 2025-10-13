import React, { useState } from 'react'
import { X, Plus } from 'lucide-react'

interface TextEditorProps {
  onAddText: (text: string) => void
  onClose: () => void
}

const TextEditor: React.FC<TextEditorProps> = ({ onAddText, onClose }) => {
  const [text, setText] = useState('')

  const handleAdd = () => {
    if (text.trim()) {
      onAddText(text.trim())
      setText('')
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50 animate-pop-in">
      <div className="bg-white w-full rounded-t-3xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">Thêm chữ</h3>
          <button onClick={onClose} className="p-2 active:bg-gray-100 rounded-full touch-target">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Nhập chữ tại đây..."
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-lg"
            autoFocus
          />

          <button
            onClick={handleAdd}
            disabled={!text.trim()}
            className="w-full bg-primary active:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl shadow-lg touch-target flex items-center justify-center gap-2 text-lg transition-colors"
          >
            <Plus size={24} />
            <span>Thêm chữ vào sản phẩm</span>
          </button>

          <p className="text-xs text-gray-500 text-center">
            Mẹo: Bạn có thể chạm và kéo chữ để thay đổi vị trí trên sản phẩm.
          </p>
        </div>
      </div>
    </div>
  )
}

export default TextEditor
