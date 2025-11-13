import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import { useDebouncedCallback } from '@/hooks/use-debounce'

interface TextEditorProps {
  onAddText: (text: string) => void
  onClose: () => void
}

const TextEditor: React.FC<TextEditorProps> = ({ onAddText, onClose }) => {
  const [text, setText] = useState<string>('')

  const handleAdd = () => {
    if (text.trim()) {
      onAddText(text.trim())
      setText('')
      onClose()
    }
  }

  const handleEdit = useDebouncedCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value)
  }, 300)

  const catchEnterKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd()
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 animate-pop-in p-4">
      <div onClick={onClose} className="bg-black/50 absolute inset-0 z-10"></div>
      <div className="bg-white w-full rounded-xl p-4 shadow-2xl relative z-20">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-800">Thêm chữ</h3>
          <button onClick={onClose} className="p-2 active:bg-gray-100 rounded-full touch-target">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-x-icon lucide-x text-black"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4 mt-4">
          <input
            type="text"
            onChange={handleEdit}
            onKeyDown={catchEnterKey}
            placeholder="Nhập chữ tại đây..."
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-lg"
            autoFocus
          />

          <button
            onClick={handleAdd}
            disabled={!text.trim()}
            className="text-base sm:text-lg w-full bg-primary active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-xl shadow-lg touch-target flex items-center justify-center gap-2 transition"
          >
            <Plus size={24} />
            <span>Thêm chữ vào sản phẩm</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default TextEditor
