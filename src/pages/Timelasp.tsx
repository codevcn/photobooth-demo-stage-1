import { ativateFullScreen, exitFullScreen } from '@/utils/helpers'
import { ImageIcon, PlayIcon, Trash2Icon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const AttractiveButton = () => {
  
}

export default function TimelapsePage() {
  const navigate = useNavigate()

  const action = () => {
    navigate('/edit')
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      ativateFullScreen()
    } else {
      exitFullScreen()
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-6 md:p-8">
        <h1 onClick={toggleFullscreen} className="text-2xl md:text-3xl font-serif select-none">
          photoism
        </h1>
        <button className="flex items-center gap-2 text-sm md:text-base hover:opacity-80 transition-opacity">
          <Trash2Icon className="w-5 h-5" />
          <span>Xóa ảnh đã chụp</span>
        </button>
      </header>

      <div onClick={action} className="px-6 mb-6 mt-4">
        <button className="px-4 py-4 w-full bg-gradient-to-r from-red-400 to-pink-600 text-white font-bold rounded-xl shadow-lg">
          <span>Xem ảnh này trên áo thun / túi tote</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <h2 className="text-base font-light mb-4">
          Có thể xem trong vòng <span className="text-orange-500 font-normal">72 giờ</span> sau khi
          chụp
        </h2>
        <div className="flex flex-col gap-4">
          <div>
            <video controls loop muted playsInline className="w-full h-[390px] object-cover">
              <source src="/videos/timelapse.mp4" type="video/mp4" />
              Trình duyệt của bạn không hỗ trợ thẻ video.
            </video>
          </div>
          <div>
            <img src="/images/timelapse.jpg" alt="Image timelapse" />
          </div>
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="grid grid-cols-2 gap-4 p-6 md:p-8 max-w-6xl mx-auto w-full">
        <button className="px-4 py-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex flex-col items-center justify-center gap-2 text-base md:text-lg">
          <ImageIcon className="w-6 h-6" />
          <span className="text-sm text-gray-200">Tải xuống ảnh</span>
        </button>

        <button className="px-4 py-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex flex-col items-center justify-center gap-2 text-base md:text-lg">
          <PlayIcon className="w-6 h-6" />
          <span className="text-sm text-gray-200">Tải xuống video</span>
        </button>
      </div>
    </div>
  )
}
