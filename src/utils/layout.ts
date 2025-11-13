import { TDetectCollisionWithViewportEdgesResult } from './types/global'

export class UILayoutManager {
  /**
   * Adjusts the position of a dropdown/menu element to prevent collision with viewport edges
   * @param element - The HTML element to adjust
   * @param margin - Minimum distance from viewport edges (default: 10px)
   * @returns Object containing adjustment information
   */
  static handleDropdownCollision(
    element: HTMLElement,
    margin: number = 10
  ): { adjusted: boolean; adjustedEdges: string[] } {
    const rect = element.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const adjustedEdges: string[] = []

    // Check and adjust horizontal position
    if (rect.right > viewportWidth - margin) {
      // Collision with right edge
      const overflow = rect.right - (viewportWidth - margin)
      const currentLeft = parseFloat(getComputedStyle(element).left) || 0
      element.style.left = `${currentLeft - overflow}px`
      adjustedEdges.push('right')
    } else if (rect.left < margin) {
      // Collision with left edge
      const overflow = margin - rect.left
      const currentLeft = parseFloat(getComputedStyle(element).left) || 0
      element.style.left = `${currentLeft + overflow}px`
      adjustedEdges.push('left')
    }

    // Check and adjust vertical position
    if (rect.bottom > viewportHeight - margin) {
      // Collision with bottom edge
      const overflow = rect.bottom - (viewportHeight - margin)
      const currentTop = parseFloat(getComputedStyle(element).top) || 0
      element.style.top = `${currentTop - overflow}px`
      adjustedEdges.push('bottom')
    } else if (rect.top < margin) {
      // Collision with top edge
      const overflow = margin - rect.top
      const currentTop = parseFloat(getComputedStyle(element).top) || 0
      element.style.top = `${currentTop + overflow}px`
      adjustedEdges.push('top')
    }

    return {
      adjusted: adjustedEdges.length > 0,
      adjustedEdges,
    }
  }
}

export class PageLayoutHelper {
  static detectFixedCollisionWithViewportEdges(
    target: HTMLElement,
    margin: number
  ): TDetectCollisionWithViewportEdgesResult {
    const targetRect = target.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const result: TDetectCollisionWithViewportEdgesResult = {
      collidedEdge: null,
    }
    if (targetRect.left < margin) {
      target.style.left = `${margin}px`
      result.collidedEdge = 'left'
    }
    if (targetRect.right > viewportWidth - margin) {
      target.style.left = `${viewportWidth - targetRect.width - margin}px`
      result.collidedEdge = 'right'
    }
    if (targetRect.top < margin) {
      target.style.top = `${margin}px`
      result.collidedEdge = 'top'
    }
    if (targetRect.bottom > viewportHeight - margin) {
      target.style.top = `${viewportHeight - targetRect.height - margin}px`
      result.collidedEdge = 'bottom'
    }
    return result
  }

  static detectRelativeCollisionWithContainerEdges(
    target: HTMLElement,
    margin: number
  ): TDetectCollisionWithViewportEdgesResult {
    return this.detectFixedCollisionWithViewportEdges(target, margin)
  }

  static detectAbsoluteCollisionWithContainerEdges(
    target: HTMLElement,
    targetContainer: HTMLElement,
    margin: number
  ): TDetectCollisionWithViewportEdgesResult {
    // const targetRect = target.getBoundingClientRect()
    // const containerRect = targetContainer.getBoundingClientRect()
    // const viewportWidth = window.innerWidth
    // const viewportHeight = window.innerHeight
    // const result: TDetectCollisionWithViewportEdgesResult = {
    //   collidedEdge: null,
    // }
    // if (targetRect.left < margin) {
    //   const offsetLeft = containerRect.left - targetRect.left - margin
    //   target.style.left = `${offsetLeft > margin ? margin : offsetLeft}px`
    // } else if (targetRect.top < margin) {
    //   const offsetTop = containerRect.top - targetRect.top - margin
    //   target.style.top = `${offsetTop > margin ? margin : offsetTop}px`
    // } else if (targetRect.right > viewportWidth) {
    //   const offsetRight =
    //     viewportWidth - containerRect.right - (viewportWidth - targetRect.right) - margin
    //   target.style.left = `${
    //     offsetRight < 0
    //       ? offsetRight
    //       : viewportWidth - containerRect.right - targetRect.width - margin
    //   }px`
    // }
    return this.detectFixedCollisionWithViewportEdges(target, margin)
  }

  static detectCollisionWithViewportEdges(
    target: HTMLElement,
    margin: number,
    targetContainer?: HTMLElement
  ): TDetectCollisionWithViewportEdgesResult {
    const targetPosition = getComputedStyle(target).position
    if (targetPosition === 'fixed') {
      return PageLayoutHelper.detectFixedCollisionWithViewportEdges(target, margin)
    } else if (targetPosition === 'absolute' && targetContainer) {
      return this.detectAbsoluteCollisionWithContainerEdges(target, targetContainer, margin)
    }
    return this.detectRelativeCollisionWithContainerEdges(target, margin)
  }
}
