import { useState, useCallback } from 'react'
import { TFonts, TLoadFontStatus } from '@/utils/types/global'
import { useLoadedTextFontContext } from '@/context/global-context'

export const useFontLoader = (initFonts?: TFonts) => {
  const [status, setStatus] = useState<TLoadFontStatus>('idle')
  const { availableFonts, setAvailableFonts } = useLoadedTextFontContext()

  const loadFont = useCallback(async (fontName: string, url: string) => {
    // Chặn load trùng
    if (availableFonts.includes(fontName)) {
      console.log('>>> font already loaded:', fontName)
      return
    }

    setStatus('loading')

    try {
      const fontFace = new FontFace(fontName, `url(${url})`)

      // Load file font
      const loaded = await fontFace.load()

      // Add vào document.fonts
      document.fonts.add(loaded)

      // Đánh dấu đã load
      setAvailableFonts([...availableFonts, fontName])

      console.log('>>> font loaded:', fontName)
      setStatus('loaded')
    } catch (err) {
      console.error('Failed to load font:', err)
      setStatus('error')
      throw err
    }
  }, [])

  const loadAllAvailableFonts = useCallback(async () => {
    if (!initFonts) return
    setStatus('loading')

    try {
      await Promise.allSettled(
        Object.entries(initFonts).map(([fontName, { loadFontURL }]) =>
          loadFont(fontName, loadFontURL)
        )
      )

      setStatus('loaded')
    } catch (err) {
      console.error('Failed to load all fonts:', err)
      setStatus('error')
    }
  }, [initFonts, loadFont])

  return { status, loadFont, loadAllAvailableFonts }
}
