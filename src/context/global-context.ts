import {
  TElementLayerContextValue,
  TGlobalContextValue,
  TEditedImageContextValue,
  TProductContextValue,
} from '@/utils/types/global'
import { createContext, useContext } from 'react'

export const GlobalContext = createContext<TGlobalContextValue>({
  pickedElementRoot: null,
  elementType: null,
  sessionId: null,
})

export const useGlobalContext = () => useContext(GlobalContext)

export const ElementLayerContext = createContext<TElementLayerContextValue>({
  elementLayers: [],
  setElementLayers: () => {},
  addToElementLayers: () => {},
  removeFromElementLayers: () => {},
})

export const useElementLayerContext = () => useContext(ElementLayerContext)

export const EditedImageContext = createContext<TEditedImageContextValue>({
  editedImages: [],
  setEditedImages: () => {},
  clearAllEditedImages: () => {},
})

export const useEditedImageContext = () => useContext(EditedImageContext)

export const ProductContext = createContext<TProductContextValue>({
  products: [],
  setProducts: () => {},
})

export const useProductContext = () => useContext(ProductContext)
