import React from 'react';
import { X } from 'lucide-react';

interface StickerPickerProps {
  onAddSticker: (emoji: string) => void;
  onClose: () => void;
}

const StickerPicker: React.FC<StickerPickerProps> = ({ onAddSticker, onClose }) => {
  const stickers = [
    '😀', '😎', '🔥', '⭐', '❤️', '👍',
    '🎉', '🌟', '💯', '✨', '🚀', '🎨',
    '🌈', '☀️', '🌙', '⚡', '💪', '🏆',
    '🎵', '🎸', '🎮', '⚽', '🏀', '🎯',
  ];

  const handleSelect = (emoji: string) => {
    onAddSticker(emoji);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50 animate-pop-in">
      <div className="bg-white w-full rounded-t-3xl p-6 shadow-2xl max-h-[70vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-white pb-4">
          <h3 className="text-xl font-bold text-gray-800">Add Sticker</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full touch-target"
          >
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-6 gap-3 mb-4">
          {stickers.map((emoji, index) => (
            <button
              key={index}
              onClick={() => handleSelect(emoji)}
              className="aspect-square flex items-center justify-center text-4xl hover:bg-purple-50 rounded-xl touch-target transition-colors active:scale-95"
            >
              {emoji}
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          Tap any sticker to add it to your T-shirt
        </p>
      </div>
    </div>
  );
};

export default StickerPicker;