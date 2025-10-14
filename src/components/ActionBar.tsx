import React from 'react'
import { ShoppingCart, Check } from 'lucide-react'

interface ActionBarProps {
  cartCount: number
  onDone: () => void
}

const ActionBar: React.FC<ActionBarProps> = ({ cartCount, onDone }) => {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onDone}
        className="flex-1 bg-pink-cl active:bg-pink-hover-cl text-white font-bold py-2 px-4 rounded-xl shadow-lg touch-target flex items-center justify-center gap-2 text-lg"
      >
        <Check size={24} strokeWidth={3} />
        <span>Xong</span>
      </button>

      <button className="relative bg-white border-2 border-gray-200 p-2 rounded-xl shadow-md touch-target active:border-pink-cl transition-colors">
        <ShoppingCart size={24} className="text-gray-700" />
        {cartCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {cartCount}
          </span>
        )}
      </button>
    </div>
  )
}

export default ActionBar
