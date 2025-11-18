import { TFonts, TLoadFontStatus } from '@/utils/types/global'
import { useState, useCallback } from 'react'

export const useFontLoader = (initFonts?: TFonts) => {
  const [status, setStatus] = useState<TLoadFontStatus>('idle')

  const loadFont = useCallback(async (fontName: string, url: string) => {
    // Nếu font đã tồn tại thì không cần load lại
    if (document.fonts.check(`1em ${fontName}`)) {
      setStatus('loaded')
      return
    }

    setStatus('loading')

    try {
      const fontFace = new FontFace(fontName, `url(${url})`)
      const loaded = await fontFace.load()
      document.fonts.add(loaded)
      setStatus('loaded')
    } catch (err) {
      console.error('Failed to load font:', err)
      setStatus('error')
      throw err
    }
  }, [])

  const loadAllAvailableFonts = useCallback(async () => {
    const fontURLs = initFonts || {
      'Amatic SC': { loadFontURL: 'url-to-amatic-sc.woff2' },
      Bitcount: { loadFontURL: 'url-to-bitcount.woff2' },
      'Bungee Outline': { loadFontURL: 'url-to-bungee-outline.woff2' },
      'Bungee Spice': { loadFontURL: 'url-to-bungee-spice.woff2' },
      Creepster: { loadFontURL: 'url-to-creepster.woff2' },
      'Emilys Candy': { loadFontURL: 'url-to-emilys-candy.woff2' },
      Honk: { loadFontURL: 'url-to-honk.woff2' },
      'Jersey 25 Charted': { loadFontURL: 'url-to-jersey-25-charted.woff2' },
      Nosifer: { loadFontURL: 'url-to-nosifer.woff2' },
    }
    setStatus('loading')
    try {
      await Promise.allSettled(
        Object.entries(fontURLs).map(([fontName, { loadFontURL }]) =>
          loadFont(fontName, loadFontURL)
        )
      )
      setStatus('loaded')
    } catch (err) {
      console.error('Failed to load all fonts:', err)
      setStatus('error')
      throw err
    }
  }, [loadFont])

  return { status, loadFont, loadAllAvailableFonts }
}
