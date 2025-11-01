import { TElementLayerContextValue, TGlobalContextValue } from '@/utils/types'
import { createContext, useContext } from 'react'

export const GlobalContext = createContext<TGlobalContextValue>({
  pickedElementRoot: null,
  elementType: null,
})

export const useGlobalContext = () => useContext(GlobalContext)

export const ElementLayerContext = createContext<TElementLayerContextValue>({
  elementLayers: [],
  setElementLayers: () => {},
  addToElementLayers: () => {},
})

export const useElementLayerContext = () => useContext(ElementLayerContext)
