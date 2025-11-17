import { TTemplateFrame, TTemplateType } from '@/utils/types/global'
import { TemplateFrame } from './TemplateFrame'
import { templateTypeToGridStyles } from '@/utils/helpers'

type TFramesDisplayerProps = {
  frames: TTemplateFrame[]
  templateType: TTemplateType
}

export const FramesDisplayer = ({ frames, templateType }: TFramesDisplayerProps) => {
  console.log('>>> frames:', frames)
  return (
    <div
      className="bg-gray-600/30 p-[2px] gap-1 max-h-full"
      style={{ ...templateTypeToGridStyles(templateType) }}
    >
      {frames.map((frame) => (
        <TemplateFrame key={frame.id} templateFrame={frame} />
      ))}
    </div>
  )
}
