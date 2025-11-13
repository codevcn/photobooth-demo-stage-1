import { TUserInputImage } from '@/utils/types/global'
import { CheckCheck, X } from 'lucide-react'

type TCropPreviewProps = {
  editedImages: TUserInputImage[]
  pickedImage: TUserInputImage
  onPickedItem: React.Dispatch<React.SetStateAction<TUserInputImage>>
  onHide: () => void
  setAsEditedImage: (image: TUserInputImage) => void
}

export const CropPreview = ({
  editedImages,
  pickedImage,
  onPickedItem,
  onHide,
  setAsEditedImage,
}: TCropPreviewProps) => {
  const pickItem = (imgId: TUserInputImage['url']) => {
    const selectedImage = editedImages.find(({ url }) => url === imgId)
    if (!selectedImage) return
    onPickedItem(selectedImage)
  }

  return (
    <div className="flex items-center justify-center fixed inset-0 transition duration-200 z-[999] p-2">
      <div className="bg-black/50 absolute inset-0 z-10" onClick={onHide}></div>

      <section className="relative z-20 rounded-md overflow-y-auto bg-white max-h-[90vh] w-full">
        <div className="w-full flex justify-between items-center gap-4 p-2">
          <h3 className="font-bold text-lg">Ảnh bạn đã cắt</h3>
          <button onClick={onHide} className="p-2 active:scale-90 transition">
            <X color="currentColor" strokeWidth={3} size={24} />
          </button>
        </div>

        {/* <!-- Main Image Gallery (Swipeable) --> */}
        <div className="relative overflow-hidden p-1.5">
          <img
            src={pickedImage.url}
            alt="Ảnh sản phẩm đã chỉnh sửa"
            className="object-contain w-full outline outline-1 outline-gray-200 max-h-[500px]"
          />
        </div>

        <div className="w-full p-1.5">
          <button
            onClick={() => setAsEditedImage(pickedImage)}
            className="flex items-center justify-center gap-2 active:scale-90 transition w-full p-2 rounded bg-pink-cl text-white font-bold"
          >
            <span>Chọn ảnh này để chỉnh sửa</span>
            <CheckCheck size={20} strokeWidth={3} color="currentColor" />
          </button>
        </div>

        {/* <!-- Thumbnail Gallery --> */}
        <div className="flex gap-2 p-2 pt-3 overflow-x-auto border-b">
          {editedImages.map(({ url }) => (
            <button
              key={url}
              className="flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 border-gray-200 transition"
              style={{
                outline: url === pickedImage.url ? '2px solid var(--vcn-pink-cl)' : 'none',
              }}
              onClick={() => pickItem(url)}
            >
              <img
                src={url}
                alt="Ảnh sản phẩm đã chỉnh sửa"
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
