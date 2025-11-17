import { PrintTemplate } from '@/pages/edit/template/PrintTemplate'
import { TPrintTemplate } from '@/utils/types/global'

type TPrintAreaOverlayProps = {
  overlayRef: React.RefObject<HTMLDivElement>
  printAreaRef: React.RefObject<HTMLDivElement>
  name: string
  printTemplate: TPrintTemplate
}

export const PrintAreaOverlay: React.FC<TPrintAreaOverlayProps> = ({
  printAreaRef,
  printTemplate,
}) => {
  return (
    <div
      ref={printAreaRef}
      className="ME-print-area-allowed z-[99] border border-white border-dashed flex justify-center items-center absolute transition-all duration-300"
    >
      <PrintTemplate template={printTemplate} />
    </div>
  )
}
