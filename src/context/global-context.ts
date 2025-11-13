import {
  TElementLayerContextValue,
  TGlobalContextValue,
  TEditedImageContextValue,
  TProductImageContextValue,
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

export const ProductImageContext = createContext<TProductImageContextValue>({
  productImages: [],
  setProductImages: () => {},
})

export const useProductImageContext = () => useContext(ProductImageContext)
