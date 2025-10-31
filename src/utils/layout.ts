import { TDetectCollisionWithViewportEdgesResult } from './types'

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
