import { FramesDisplayer } from '@/pages/edit/template/FrameDisplayer'
import { TPrintTemplate } from '@/utils/types/global'

type TPrintAreaOverlayProps = {
  overlayRef: React.RefObject<HTMLDivElement>
  printAreaRef: React.RefObject<HTMLDivElement>
  name: string
  printTemplate: TPrintTemplate
  onClickFrame: (frameId: string) => void
}

export const PrintAreaOverlay: React.FC<TPrintAreaOverlayProps> = ({
  printAreaRef,
  printTemplate,
  onClickFrame,
}) => {
  return (
    <div
      ref={printAreaRef}
      className="NAME-print-area-allowed z-[99] border border-white border-dashed flex justify-center items-center absolute transition-all duration-300"
    >
      <FramesDisplayer
        template={printTemplate}
        frameClassNames={{ container: 'active:scale-90 transition' }}
        onClickFrame={onClickFrame}
      />
    </div>
  )
}
