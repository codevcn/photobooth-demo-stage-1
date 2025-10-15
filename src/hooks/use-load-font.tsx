type TUseGoogleFontReturn = {
  loadFont: (fontName: string, weights?: number[], onLoaded?: () => void) => void
}

export default function useGoogleFont(): TUseGoogleFontReturn {
  const loadFont = (fontName: string, weights?: number[], onLoaded?: () => void) => {
    if (!fontName) return

    const formattedName = fontName.replace(/\s+/g, '+')
    const weightParam = (weights || [400]).join(',')
    const href = `https://fonts.googleapis.com/css2?family=${formattedName}:wght@${weightParam}&display=swap`

    if (!document.body.querySelector(`link[href="${href}"]`)) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = href

      link.onload = () => {
        ;(document.fonts as FontFaceSet).ready.then(() => onLoaded?.())
      }

      document.head.appendChild(link)
    } else {
      ;(document.fonts as FontFaceSet).ready.then(() => onLoaded?.())
    }
  }

  return { loadFont }
}
