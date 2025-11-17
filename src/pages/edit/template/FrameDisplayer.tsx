import { TPrintTemplate } from '@/utils/types/global'
import { TemplateFrame } from './TemplateFrame'
import { templateTypeToCssStyles } from '../../../configs/print-template'

type TFramesDisplayerProps = {
  template: TPrintTemplate
} & Partial<{
  plusIconReplacer?: JSX.Element
  frameStyles: Partial<{
    container: React.CSSProperties
    plusIconWrapper: React.CSSProperties
  }>
  frameClassNames: Partial<{
    container: string
    plusIconWrapper: string
  }>
  onClickFrame: (frameId: string) => void
}>

export const FramesDisplayer = ({
  template,
  plusIconReplacer,
  frameStyles,
  frameClassNames,
  onClickFrame,
}: TFramesDisplayerProps) => {
  const { frames, type } = template
  return (
    <div
      className="NAME-frames-displayer bg-gray-600/30 p-[2px] gap-1 max-h-full max-w-full"
      style={{ ...templateTypeToCssStyles(type) }}
    >
      {frames.map((frame) => (
        <TemplateFrame
          key={frame.id}
          templateFrame={frame}
          templateType={type}
          plusIconReplacer={plusIconReplacer}
          styles={frameStyles}
          classNames={frameClassNames}
          onClickFrame={onClickFrame}
        />
      ))}
    </div>
  )
}
