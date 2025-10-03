import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'

export type ToastVariant = 'default' | 'destructive'

export interface ToastItem {
  id: string
  title?: string
  description?: string
  variant?: ToastVariant
  open?: boolean
  confirmLabel?: string
  // runtime-only callback when user confirms the toast action
  onConfirm?: (() => void)
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastsSubject = new BehaviorSubject<ToastItem[]>([])
  toasts$ = this.toastsSubject.asObservable()

  private counter = 0
  private autoDismissTimers = new Map<string, any>()
  private removeTimers = new Map<string, any>()

  toast(payload: Omit<ToastItem, 'id'>) {
    const id = `${Date.now()}-${++this.counter}`
    const item: ToastItem = { id, ...payload, open: true }
    const current = this.toastsSubject.getValue()
    this.toastsSubject.next([item, ...current].slice(0, 5))

    // Auto-dismiss non-destructive toasts after a short delay
    if (payload.variant !== 'destructive') {
      const timer = setTimeout(() => {
        this.dismiss(id)
      }, 2000)
      this.autoDismissTimers.set(id, timer)
    }

    const dismiss = () => this.dismiss(id)
    const update = (changes: Partial<ToastItem>) => this.update(id, changes)

    return { id, dismiss, update }
  }

  dismiss(id?: string) {
    if (!id) {
      // clear timers
      this.autoDismissTimers.forEach((t) => clearTimeout(t))
      this.autoDismissTimers.clear()
      this.removeTimers.forEach((t) => clearTimeout(t))
      this.removeTimers.clear()
      this.toastsSubject.next([])
      return
    }
    // clear any pending auto-dismiss for this toast
    const auto = this.autoDismissTimers.get(id)
    if (auto) {
      clearTimeout(auto)
      this.autoDismissTimers.delete(id)
    }

    const next = this.toastsSubject.getValue().map((t) => (t.id === id ? { ...t, open: false } : t))
    this.toastsSubject.next(next)

    // remove the toast from the array after a short delay so UI can animate
    if (this.removeTimers.has(id)) {
      clearTimeout(this.removeTimers.get(id))
    }
    const remover = setTimeout(() => this.remove(id), 400)
    this.removeTimers.set(id, remover)
  }

  private remove(id: string) {
    // remove completely from list
    const filtered = this.toastsSubject.getValue().filter((t) => t.id !== id)
    this.toastsSubject.next(filtered)
    // clean any timers
    if (this.removeTimers.has(id)) {
      clearTimeout(this.removeTimers.get(id))
      this.removeTimers.delete(id)
    }
    if (this.autoDismissTimers.has(id)) {
      clearTimeout(this.autoDismissTimers.get(id))
      this.autoDismissTimers.delete(id)
    }
  }

  private update(id: string, changes: Partial<ToastItem>) {
    const next = this.toastsSubject.getValue().map((t) => (t.id === id ? { ...t, ...changes } : t))
    this.toastsSubject.next(next)
  }
}
