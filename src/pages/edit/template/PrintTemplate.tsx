import { TPrintTemplate } from '@/utils/types/global'
import { FramesDisplayer } from './FrameDisplayer'

type TPrintAreaOverlayProps = {
  template: TPrintTemplate
}

export const PrintTemplate = ({ template }: TPrintAreaOverlayProps) => {
  return <FramesDisplayer frames={template.frames} templateType={template.type} />
}
