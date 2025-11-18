import {
  TFrameRectType,
  TImageSizeInfo,
  TPrintedImage,
  TPrintTemplate,
  TTemplateType,
} from '@/utils/types/global'

export const hardCodedPrintTemplates: TPrintTemplate[] = [
  {
    id: 'template-1',
    type: '1-horizon',
    frames: [
      {
        id: 'frame-1',
        index: 1,
        rectType: 'horizontal',
      },
    ],
    framesCount: 3,
    name: 'Mẫu in 1',
  },
  {
    id: 'template-2',
    type: '1-vertical',
    frames: [
      {
        id: 'frame-2',
        index: 1,
        rectType: 'vertical',
      },
    ],
    framesCount: 3,
    name: 'Mẫu in 2',
  },
  {
    id: 'template-3',
    type: '1-square',
    frames: [
      {
        id: 'frame-3',
        index: 1,
        rectType: 'square',
      },
    ],
    framesCount: 3,
    name: 'Mẫu in 3',
  },
  {
    id: 'template-4',
    type: '2-horizon',
    frames: [
      {
        id: 'frame-4',
        index: 1,
        rectType: 'horizontal',
      },
      {
        id: 'frame-5',
        index: 2,
        rectType: 'horizontal',
      },
    ],
    framesCount: 3,
    name: 'Mẫu in 4',
  },
  {
    id: 'template-5',
    type: '2-vertical',
    frames: [
      {
        id: 'frame-6',
        index: 1,
        rectType: 'vertical',
      },
      {
        id: 'frame-7',
        index: 2,
        rectType: 'vertical',
      },
    ],
    framesCount: 3,
    name: 'Mẫu in 5',
  },
  {
    id: 'template-6',
    type: '3-left',
    frames: [
      {
        id: 'frame-8',
        index: 1,
        rectType: 'square',
      },
      {
        id: 'frame-9',
        index: 2,
        rectType: 'vertical',
      },
      {
        id: 'frame-10',
        index: 3,
        rectType: 'square',
      },
    ],
    framesCount: 3,
    name: 'Mẫu in 6',
  },
  {
    id: 'template-7',
    type: '3-right',
    frames: [
      {
        id: 'frame-11',
        index: 1,
        rectType: 'vertical',
      },
      {
        id: 'frame-12',
        index: 2,
        rectType: 'square',
      },
      {
        id: 'frame-13',
        index: 3,
        rectType: 'square',
      },
    ],
    framesCount: 3,
    name: 'Mẫu in 7',
  },
  {
    id: 'template-8',
    type: '3-top',
    frames: [
      {
        id: 'frame-14',
        index: 1,
        rectType: 'square',
      },
      {
        id: 'frame-15',
        index: 2,
        rectType: 'square',
      },
      {
        id: 'frame-16',
        index: 3,
        rectType: 'horizontal',
      },
    ],
    framesCount: 3,
    name: 'Mẫu in 8',
  },
  {
    id: 'template-9',
    type: '3-bottom',
    frames: [
      {
        id: 'frame-17',
        index: 1,
        rectType: 'horizontal',
      },
      {
        id: 'frame-18',
        index: 2,
        rectType: 'square',
      },
      {
        id: 'frame-19',
        index: 3,
        rectType: 'square',
      },
    ],
    framesCount: 3,
    name: 'Mẫu in 9',
  },
  {
    id: 'template-10',
    type: '4-square',
    frames: [
      {
        id: 'frame-20',
        index: 1,
        rectType: 'square',
      },
      {
        id: 'frame-21',
        index: 2,
        rectType: 'square',
      },
      {
        id: 'frame-22',
        index: 3,
        rectType: 'square',
      },
      {
        id: 'frame-23',
        index: 4,
        rectType: 'square',
      },
    ],
    framesCount: 4,
    name: 'Mẫu in 10',
  },
  {
    id: 'template-11',
    type: '4-horizon',
    frames: [
      {
        id: 'frame-24',
        index: 1,
        rectType: 'horizontal',
      },
      {
        id: 'frame-25',
        index: 2,
        rectType: 'horizontal',
      },
      {
        id: 'frame-26',
        index: 3,
        rectType: 'horizontal',
      },
      {
        id: 'frame-27',
        index: 4,
        rectType: 'horizontal',
      },
    ],
    framesCount: 4,
    name: 'Mẫu in 11',
  },
]

/**
 * Chuyển đổi template type sang grid CSS styles
 * @param templateType - Loại template
 * @returns Object chứa các CSS properties cho grid layout
 */
export const templateTypeToCssStyles = (templateType: TTemplateType): React.CSSProperties => {
  switch (templateType) {
    // 1 frame templates
    case '1-horizon':
      return {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gridTemplateRows: '1fr',
        aspectRatio: '16/9',
        width: '100%',
      }
    case '1-vertical':
      return {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gridTemplateRows: '1fr',
        aspectRatio: '9/16',
        height: '100%',
      }
    case '1-square':
      return {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gridTemplateRows: '1fr',
        aspectRatio: '1/1',
        width: '100%',
      }

    // 2 frames templates
    case '2-horizon':
      return {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gridTemplateRows: 'repeat(2, 1fr)',
        aspectRatio: '16/9',
        width: '100%',
      }
    case '2-vertical':
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gridTemplateRows: '1fr',
        aspectRatio: '9/16',
        height: '100%',
      }

    // 3 frames templates
    case '3-left':
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
        aspectRatio: '1/1',
        width: '100%',
      }
    case '3-right':
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
        aspectRatio: '1/1',
        width: '100%',
      }
    case '3-top':
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
        aspectRatio: '1/1',
        width: '100%',
      }
    case '3-bottom':
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
        aspectRatio: '1/1',
        width: '100%',
      }

    // 4 frames templates
    case '4-square':
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
        aspectRatio: '1/1',
        width: '100%',
      }
    case '4-horizon':
      return {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gridTemplateRows: 'repeat(4, 1fr)',
        aspectRatio: '9/16',
        width: '100%',
      }

    default:
      return {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gridTemplateRows: '1fr',
        width: '100%',
      }
  }
}

export const templateTypeToFrameStyle = (
  templateType: TTemplateType,
  frameIndex: number
): React.CSSProperties => {
  switch (templateType) {
    case '2-horizon':
      return { minHeight: '50px' }
    case '2-vertical':
      return { minWidth: '50px' }
    case '3-left':
      if (frameIndex === 2) return { gridRow: 'span 2 / span 2' }
      return {}
    case '3-top':
      if (frameIndex === 3) return { gridColumn: 'span 2 / span 2' }
      return {}
    case '3-right':
      if (frameIndex === 1) return { gridRow: 'span 2 / span 2' }
      return {}
    case '3-bottom':
      if (frameIndex === 1) return { gridColumn: 'span 2 / span 2' }
      return {}
    default:
      return {}
  }
}

export const allowPrintedImageOnTemplateType = (
  frameRectType: TFrameRectType,
  printedImageSize: TImageSizeInfo
): boolean => {
  const imgRatio = printedImageSize.width / printedImageSize.height
  switch (frameRectType) {
    case 'horizontal':
      if (imgRatio < 1) return false
      return true
    case 'vertical':
      if (imgRatio > 1) return false
      return true
    case 'square':
      if (imgRatio < 0.9 || imgRatio > 1.1) return false
      return true
  }
}
