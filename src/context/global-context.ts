import { TGlobalContext } from '@/utils/types'
import { createContext } from 'react'

export const GlobalContext = createContext<TGlobalContext>({
  pickedElementRoot: null,
  elementType: null,
})
