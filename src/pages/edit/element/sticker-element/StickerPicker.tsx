import React, { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'

interface StickerPickerProps {
  onAddSticker: (path: string) => void
  onClose: () => void
  show: boolean
}

type TStickerGroup = {
  name: string
  displayName: string
  stickers: string[]
  loaded: boolean
}

// Cấu hình các nhóm sticker
const STICKER_GROUPS_CONFIG: { name: string; displayName: string; count: number }[] = [
  { name: 'Couple-cat', displayName: 'Couple Cat', count: 6 },
  { name: 'BabyWony', displayName: 'Baby Wony', count: 20 },
  { name: 'BrownandFriends', displayName: 'Brown & Friends', count: 20 },
  { name: 'MiMnYam', displayName: 'MiMn Yam', count: 20 },
  { name: 'Piyomaru', displayName: 'Piyomaru', count: 20 },
  { name: 'Pusheen', displayName: 'Pusheen', count: 20 },
  { name: 'ZapyCongSo', displayName: 'Zapy Cồng Sô', count: 20 },
]

const StickerPicker: React.FC<StickerPickerProps> = ({ onAddSticker, onClose, show }) => {
  const [stickerGroups, setStickerGroups] = useState<TStickerGroup[]>([])
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number>(0)
  const [isLoadingGroup, setIsLoadingGroup] = useState<boolean>(false)

  // Khởi tạo danh sách nhóm sticker
  useEffect(() => {
    const groups: TStickerGroup[] = STICKER_GROUPS_CONFIG.map((config) => ({
      name: config.name,
      displayName: config.displayName,
      stickers: [],
      loaded: false,
    }))
    setStickerGroups(groups)
  }, [])

  // Load nhóm Couple-cat đầu tiên khi component mount
  useEffect(() => {
    if (stickerGroups.length > 0) {
      const coupleCatIndex = stickerGroups.findIndex((g) => g.name === 'Couple-cat')
      if (coupleCatIndex !== -1 && !stickerGroups[coupleCatIndex].loaded) {
        loadStickerGroup(coupleCatIndex)
      }
    }
  }, [stickerGroups.length])

  // Load stickers của một nhóm
  const loadStickerGroup = async (groupIndex: number) => {
    const group = stickerGroups[groupIndex]
    if (!group || group.loaded) return

    setIsLoadingGroup(true)

    // Tìm config tương ứng
    const config = STICKER_GROUPS_CONFIG.find((c) => c.name === group.name)
    if (!config) {
      setIsLoadingGroup(false)
      return
    }

    // Tạo danh sách URL stickers
    const stickers: string[] = []
    for (let i = 1; i <= config.count; i++) {
      stickers.push(`/images/stickers/${config.name}/st-${i}.png`)
    }

    // Cập nhật state
    setStickerGroups((prev) =>
      prev.map((g, idx) =>
        idx === groupIndex
          ? {
              ...g,
              stickers,
              loaded: true,
            }
          : g
      )
    )

    setIsLoadingGroup(false)
  }

  // Xử lý chọn nhóm sticker
  const handleSelectGroup = (groupIndex: number) => {
    setSelectedGroupIndex(groupIndex)
    if (!stickerGroups[groupIndex].loaded) {
      loadStickerGroup(groupIndex)
    }
  }

  // Xử lý chọn sticker
  const handleSelectSticker = (path: string) => {
    onAddSticker(path)
    onClose()
  }

  const selectedGroup = stickerGroups[selectedGroupIndex]

  if (!show) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 animate-pop-in p-4">
      <div onClick={onClose} className="bg-black/50 absolute inset-0 z-10"></div>
      <div className="flex flex-col bg-white w-full max-w-2xl rounded-xl shadow-2xl max-h-[85vh] relative z-20 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-purple-50">
          <h3 className="text-xl font-bold text-gray-800">Thêm nhãn dán</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/80 rounded-full active:scale-95 transition"
          >
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
              className="text-gray-700"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Sticker Groups Tabs */}
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {stickerGroups.map((group, index) => {
              const isSelected = selectedGroupIndex === index
              const representativeSticker = `/images/stickers/${group.name}/st-1.png`

              return (
                <button
                  key={group.name}
                  onClick={() => handleSelectGroup(index)}
                  className={`flex-shrink-0 flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                    isSelected
                      ? 'bg-pink-100 border-2 border-pink-500'
                      : 'bg-white border-2 border-gray-200 hover:border-pink-300'
                  }`}
                >
                  <div className="w-12 h-12 flex items-center justify-center">
                    <img
                      src={representativeSticker}
                      alt={group.displayName}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      isSelected ? 'text-pink-700' : 'text-gray-600'
                    }`}
                  >
                    {group.displayName}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Stickers Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoadingGroup ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <Loader2 className="w-12 h-12 animate-spin text-pink-500" strokeWidth={2.5} />
              <p className="text-gray-600 font-medium">Đang tải nhãn dán...</p>
            </div>
          ) : selectedGroup && selectedGroup.loaded ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {selectedGroup.stickers.map((path, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectSticker(path)}
                  className="aspect-square flex items-center justify-center bg-gray-50 hover:bg-pink-50 border-2 border-gray-200 hover:border-pink-300 rounded-xl active:scale-95 transition-all p-2"
                >
                  <img
                    src={path}
                    alt={`${selectedGroup.displayName} ${index + 1}`}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">Chọn một nhóm nhãn dán để xem</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StickerPicker
