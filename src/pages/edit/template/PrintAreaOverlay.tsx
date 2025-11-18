import { cn } from '@/lib/utils'
import { FramesDisplayer } from '@/pages/edit/template/FrameDisplayer'
import { TFrameRectType, TPrintTemplate } from '@/utils/types/global'

type TPrintAreaOverlayProps = {
  printAreaRef: React.RefObject<HTMLDivElement>
  name: string
  isOutOfBounds: boolean
  printTemplate: TPrintTemplate
  onClickFrame: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    frameId: string,
    rectType: TFrameRectType
  ) => void
} & Partial<{
  overlayRef?: React.RefObject<HTMLDivElement>
  frame: Partial<{
    classNames: Partial<{
      container: string
      plusIconWrapper: string
    }>
  }>
  frameDisplayer: Partial<{
    classNames: Partial<{
      container: string
    }>
  }>
  overlay: Partial<{
    classNames: Partial<{
      container: string
    }>
  }>
}>

export const PrintAreaOverlay: React.FC<TPrintAreaOverlayProps> = ({
  overlayRef,
  printAreaRef,
  printTemplate,
  onClickFrame,
  frameDisplayer,
  frame,
  overlay,
  isOutOfBounds,
}) => {
  return (
    <>
      <div
        ref={printAreaRef}
        className={cn(
          'NAME-print-area-allowed z-[5] border border-white border-dashed flex justify-center items-center absolute transition-all duration-300',
          overlay?.classNames?.container,
          isOutOfBounds
            ? 'border-[1.5px] border-dashed border-red-600'
            : 'border-[1.5px] border-dashed border-[#3b82f6]'
        )}
        style={{
          backgroundColor: isOutOfBounds ? 'rgba(239, 68, 68, 0.1)' : 'rgba(96, 165, 250, 0.1)',
        }}
      >
        <FramesDisplayer
          template={printTemplate}
          frameClassNames={frame?.classNames}
          onClickFrame={onClickFrame}
          displayerClassName={frameDisplayer?.classNames?.container}
        />
      </div>

      {/* Overlay for out of bounds warning */}
      <div
        ref={overlayRef}
        className="absolute inset-0 pointer-events-none z-[6] transition-all duration-500 overflow-hidden"
        style={{
          opacity: 0,
          backgroundColor: isOutOfBounds
            ? `
            linear-gradient(135deg, 
              rgba(239, 68, 68, 0.15) 0%, 
              rgba(239, 68, 68, 0.08) 25%,
              rgba(239, 68, 68, 0.15) 50%,
              rgba(239, 68, 68, 0.08) 75%,
              rgba(239, 68, 68, 0.15) 100%
            )
          `
            : 'transparent',
          backgroundSize: '40px 40px',
          animation: isOutOfBounds ? 'print-area-warning 3s ease-in-out infinite' : 'none',
        }}
      >
        <div
          style={{ display: isOutOfBounds ? 'block' : 'none' }}
          className="absolute bottom-full left-0 h-[1000px] w-[1000px] bg-gray-600/30"
        ></div>
        <div
          style={{ display: isOutOfBounds ? 'block' : 'none' }}
          className="absolute top-full left-0 h-[1000px] w-[1000px] bg-gray-600/30"
        ></div>
        <div
          style={{ display: isOutOfBounds ? 'block' : 'none' }}
          className="absolute left-full top-0 h-[1000px] w-[1000px] bg-gray-600/30"
        ></div>
        <div
          style={{ display: isOutOfBounds ? 'block' : 'none' }}
          className="absolute right-full top-0 h-[1000px] w-[1000px] bg-gray-600/30"
        ></div>
        {/* Dimming effect for areas outside print zone */}
        <div
          className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
          style={{
            backgroundColor: `
              radial-gradient(
                ellipse at center,
                transparent 20%,
                rgba(0, 0, 0, 0.1) 40%,
                rgba(0, 0, 0, 0.3) 70%,
                rgba(0, 0, 0, 0.5) 100%
              )
            `,
            opacity: isOutOfBounds ? 0.8 : 0,
          }}
        />
      </div>
    </>
  )
}
