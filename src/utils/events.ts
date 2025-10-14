import { EInternalEvents } from './enums'

interface IInternalEvents {
  [EInternalEvents.CLICK_ON_PAGE]: (target: HTMLElement | null) => void
}

class EventEmitter<IEvents extends IInternalEvents> {
  private listeners: {
    [K in keyof IEvents]?: IEvents[K][]
  } = {}

  on<K extends keyof IEvents>(name: K, handler: IEvents[K]): void {
    if (this.listeners[name]) {
      this.listeners[name].push(handler)
    } else {
      this.listeners[name] = [handler]
    }
  }

  off<K extends keyof IEvents>(name: K, handler?: IEvents[K]): void {
    if (handler) {
      this.listeners[name] = (this.listeners[name] ?? []).filter((h) => h !== handler)
    } else {
      delete this.listeners[name]
    }
  }

  emit<K extends keyof IEvents>(
    name: K,
    ...args: IEvents[K] extends (...args: infer P) => any ? P : never
  ): void {
    for (const handler of this.listeners[name] ?? []) {
      queueMicrotask(() => {
        ;(handler as any)(...args)
      })
    }
  }
}

export const eventEmitter = new EventEmitter<IInternalEvents>()
