import { AlertTriangle } from 'lucide-react'

type TIdleWarningModalProps = {
  show: boolean
  countdown: number
  onConfirm: () => void
}

/**
 * Modal cảnh báo khi user không hoạt động (toàn cục)
 */
export const IdleWarningModal = ({ show, countdown, onConfirm }: TIdleWarningModalProps) => {
  if (!show) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 border-4 border-pink-cl animate-scale-in">
        {/* Icon Warning */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-pink-cl/20 rounded-full animate-ping"></div>
            <div className="relative bg-gradient-to-br from-pink-cl to-pink-hover-cl p-5 rounded-full shadow-lg">
              <AlertTriangle size={48} className="text-white" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-3">
          Bạn vẫn đang ở đây chứ?
        </h2>

        {/* Description */}
        <p className="text-gray-600 text-center mb-6 leading-relaxed">
          Chúng tôi nhận thấy bạn không có hoạt động. Nếu bạn vẫn muốn tiếp tục, vui lòng xác nhận.
        </p>

        {/* Countdown */}
        <div className="bg-gradient-to-br from-pink-cl/10 to-pink-hover-cl/10 rounded-2xl p-6 mb-6 border-2 border-pink-cl/30">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2 font-medium">Thời gian còn lại</p>
            <div className="flex items-center justify-center gap-2">
              <div className="bg-white rounded-xl px-6 py-3 shadow-md border-2 border-pink-cl">
                <span className="text-4xl font-bold text-pink-cl tabular-nums">
                  {countdown}
                </span>
              </div>
              <span className="text-2xl font-bold text-gray-600">giây</span>
            </div>
          </div>
        </div>

        {/* Confirm Button */}
        <button
          onClick={onConfirm}
          className="w-full bg-gradient-to-r from-pink-cl to-pink-hover-cl hover:from-dark-pink-cl hover:to-pink-cl text-white font-bold text-lg py-4 px-6 rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200 flex items-center justify-center gap-3"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Vâng, tôi vẫn ở đây!</span>
        </button>

        {/* Info Text */}
        <p className="text-xs text-gray-500 text-center mt-4">
          Nếu không xác nhận, bạn sẽ được chuyển về trang chủ
        </p>
      </div>
    </div>
  )
}
