import { Component, OnDestroy } from '@angular/core'
import { Subscription } from 'rxjs'
import { ToastService, ToastItem } from './toast.service'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-toaster',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toaster" style="position:fixed;top:1rem;right:1rem;z-index:9999">
      <div *ngFor="let t of toasts" class="toast" [ngClass]="{open: t.open }" [ngStyle]="getStyle(t)" style="margin-bottom:0.5rem;padding:0.75rem;border-radius:8px;color:#fff;min-width:220px;transition:opacity 280ms ease,transform 280ms ease">
        <div style="font-weight:600;display:flex;justify-content:space-between;align-items:center;gap:8px">
          <div style="flex:1;display:flex;gap:8px;align-items:center;justify-content:space-between">
            <span>{{t.title}}</span>
            <button title="Cerrar" (click)="close(t)" style="background:transparent;border:none;color:rgba(255,255,255,0.9);font-weight:600;cursor:pointer">✕</button>
          </div>
          <div style="display:flex;gap:8px;align-items:center">
            <button *ngIf="t.confirmLabel" (click)="confirm(t)" style="background:transparent;border:none;color:inherit;font-weight:600;cursor:pointer">{{t.confirmLabel}}</button>
          </div>
        </div>
        <div *ngIf="t.description" style="font-size:0.9rem;opacity:0.95;margin-top:0.25rem">{{t.description}}</div>
      </div>
    </div>
  `,
})
export class ToasterComponent implements OnDestroy {
  toasts: ToastItem[] = []
  sub: Subscription

  constructor(private toastService: ToastService) {
    this.sub = this.toastService.toasts$.subscribe((list) => (this.toasts = list))
  }

  confirm(t: ToastItem) {
    try {
      if (t.onConfirm) t.onConfirm()
    } catch (e) {
      console.error('Toast onConfirm error', e)
    } finally {
      this.toastService.dismiss(t.id)
    }
  }

  close(t: ToastItem) {
    this.toastService.dismiss(t.id)
  }

  getStyle(t: ToastItem) {
    const base = t.open ? { opacity: '1', transform: 'translateY(0)' } : { opacity: '0', transform: 'translateY(-6px)' }
    if (t.variant === 'destructive') {
      return { ...base, background: '#b91c1c' }
    }
    // success/neutral styles: greenish
    return { ...base, background: '#059669' }
  }

  ngOnDestroy() {
    this.sub.unsubscribe()
  }
}
