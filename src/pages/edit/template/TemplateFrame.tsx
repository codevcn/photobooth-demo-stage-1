import { TTemplateFrame } from '@/utils/types/global'
import { PlacedImage } from './PlacedImage'

type TemplateFrameProps = {
  containerStyle?: React.CSSProperties
  templateFrame: TTemplateFrame
}

export const TemplateFrame = ({ containerStyle, templateFrame }: TemplateFrameProps) => {
  return (
    <div
      style={containerStyle}
      className="flex justify-center items-center overflow-hidden h-full w-full border border-gray-600 border-dashed"
    >
      <PlacedImage placedImage={templateFrame.placedImage} />
    </div>
  )
}
