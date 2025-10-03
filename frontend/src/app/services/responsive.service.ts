import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const MOBILE_BREAKPOINT = 768;

@Injectable({ providedIn: 'root' })
export class ResponsiveService {
  private _isMobile$ = new BehaviorSubject<boolean>(false);
  readonly isMobile$ = this._isMobile$.asObservable();

  constructor() {
    // SSR guard
    if (typeof window === 'undefined' || !('matchMedia' in window)) {
      this._isMobile$.next(false);
      return;
    }

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const update = () => this._isMobile$.next(window.innerWidth < MOBILE_BREAKPOINT);

    // addEventListener is preferred, but older browsers support addListener
    if (mql.addEventListener) {
      mql.addEventListener('change', update);
    } else if ((mql as any).addListener) {
      (mql as any).addListener(update);
    }

    update();
  }

  // snapshot helper
  isMobileSnapshot(): boolean {
    return this._isMobile$.getValue();
  }
}
