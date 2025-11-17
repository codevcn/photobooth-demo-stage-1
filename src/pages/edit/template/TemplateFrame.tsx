import { TTemplateFrame, TTemplateType } from '@/utils/types/global'
import { PlacedImage } from './PlacedImage'
import { templateTypeToFrameStyle } from '../../../configs/print-template'
import { cn } from '@/lib/utils'

type TemplateFrameProps = {
  templateFrame: TTemplateFrame
  templateType: TTemplateType
} & Partial<{
  plusIconReplacer: JSX.Element
  styles: Partial<{
    container: React.CSSProperties
    plusIconWrapper: React.CSSProperties
  }>
  classNames: Partial<{
    container: string
    plusIconWrapper: string
  }>
  onClickFrame: (frameId: string) => void
}>

export const TemplateFrame = ({
  templateFrame,
  templateType,
  plusIconReplacer,
  styles,
  classNames,
  onClickFrame,
}: TemplateFrameProps) => {
  return (
    <div
      style={{
        ...styles?.container,
        ...templateTypeToFrameStyle(templateType, templateFrame.index),
      }}
      className={cn(
        'NAME-template-frame flex justify-center items-center overflow-hidden h-full w-full border border-gray-600 border-dashed',
        classNames?.container
      )}
      onClick={onClickFrame ? () => onClickFrame(templateFrame.id) : undefined}
    >
      {templateFrame.placedImage ? (
        <PlacedImage placedImage={templateFrame.placedImage} />
      ) : (
        plusIconReplacer || (
          <div
            style={styles?.plusIconWrapper}
            className={cn(
              'NAME-plus-icon-wrapper flex items-center justify-center text-white h-full w-full bg-gray-400/90',
              classNames?.plusIconWrapper
            )}
          >
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
              className="lucide lucide-plus-icon lucide-plus"
            >
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
          </div>
        )
      )}
    </div>
  )
}
