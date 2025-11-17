import { TPrintTemplate } from '@/utils/types/global'
import { FramesDisplayer } from './FrameDisplayer'
import { useEffect, useMemo } from 'react'

type TTemplatePickerProps = {
  onPickTemplate: (template: TPrintTemplate) => void
  onClose: () => void
  printedImagesCount: number
  templates: TPrintTemplate[]
}

export const TemplatePicker = ({
  onPickTemplate,
  onClose,
  printedImagesCount,
  templates,
}: TTemplatePickerProps) => {
  const availableTemplates = useMemo<TPrintTemplate[]>(() => {
    return templates.filter((template) => template.framesCount <= printedImagesCount)
  }, [printedImagesCount, templates])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [])

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 animate-pop-in p-2">
      <div onClick={onClose} className="bg-black/50 absolute inset-0 z-10"></div>
      <div className="flex flex-col items-center bg-white w-full rounded-xl py-4 shadow-xl relative z-20">
        <div className="flex items-center w-full sticky top-0 bg-white grow px-4">
          <h3 className="text-xl font-bold text-gray-800 w-full">Chọn mẫu in</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full touch-target">
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 overflow-y-auto mt-2 w-full max-h-[80vh] px-2">
          {availableTemplates.map((template) => (
            <div
              key={template.id}
              onClick={() => {
                onPickTemplate(template)
                onClose()
              }}
              className="flex items-center justify-center border border-gray-300 rounded p-1 m-2 bg-white hover:shadow-lg active:scale-90 transition"
            >
              <FramesDisplayer
                template={template}
                plusIconReplacer={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-image-icon lucide-image"
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                  </svg>
                }
                frameStyles={{
                  container: { backgroundColor: 'white' },
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
