import { ShoppingCart, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'

interface ActionBarProps {
  cartCount: number
  isLoading: boolean
  onAddToCart: () => void
}

const ActionBar: React.FC<ActionBarProps> = ({ cartCount, isLoading, onAddToCart }) => {
  const navigate = useNavigate()

  return (
    <div className="flex items-center gap-3">
      {isLoading &&
        createPortal(
          <div className="fixed inset-0 flex items-center justify-center z-50 animate-pop-in p-4">
            <div className="bg-black/50 absolute inset-0 z-10"></div>
            <video autoPlay loop muted playsInline className="z-20 relative">
              <source src="/videos/add-to-cart-loading.webm" type="video/webm" />
            </video>
          </div>,
          document.body
        )}
      <button
        onClick={onAddToCart}
        className="flex-1 bg-pink-cl active:bg-pink-hover-cl text-white font-bold py-1 px-4 rounded-xl shadow-lg touch-target flex items-center justify-center gap-2 text-lg"
      >
        <Check size={24} strokeWidth={3} />
        <span>Thêm vào giỏ hàng</span>
      </button>
      <button
        onClick={() => navigate('/payment')}
        className="relative bg-white border-2 border-gray-200 p-2 rounded-xl shadow-md touch-target active:border-pink-cl transition-colors"
      >
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
