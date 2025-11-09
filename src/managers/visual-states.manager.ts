import { TElementVisualBaseState, TTextVisualState } from '@/utils/types'

type TVisualStates = Partial<{
  sticker: TElementVisualBaseState
  printedImage: TElementVisualBaseState
  text: TTextVisualState
}>

export class VisualStateManager {
  private visualStates: TVisualStates

  constructor() {
    this.visualStates = {}
  }

  getVisualStates = (): TVisualStates => {
    return this.visualStates
  }

  updateElementVisualStates = (newStates: Partial<TVisualStates>) => {
    this.visualStates = {
      ...this.visualStates,
      ...newStates,
    }
  }
}
