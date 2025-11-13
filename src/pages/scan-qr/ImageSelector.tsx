import { useRef } from 'react'
import { Upload } from 'lucide-react'
import { TUserInputImage } from '@/utils/types/global'

interface ImageSelectorProps {
  onImageSelect: (imageData: TUserInputImage[]) => void
}

export default function ImageSelector({ onImageSelect }: ImageSelectorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      onImageSelect([{ blob: file, url: URL.createObjectURL(file) }])
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="w-full max-w-md mx-auto mt-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />
      <button
        onClick={handleButtonClick}
        className="w-full bg-white border-2 border-pink-300 text-pink-600 py-4 px-6 rounded-2xl font-medium shadow-lg transition duration-300 flex items-center justify-center gap-3 active:shadow-xl hover:scale-105 active:scale-95"
      >
        <Upload className="w-6 h-6 transition-transform duration-300 group-hover:translate-y-1" />
        <span>Hoặc chọn ảnh từ thiết bị</span>
      </button>
    </div>
  )
}
