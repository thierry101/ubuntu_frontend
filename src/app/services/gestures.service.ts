// gesture.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GesturesService {

  private startX = 0;
  private startY = 0;
  private readonly SWIPE_THRESHOLD = 80;
  private readonly EDGE_ZONE = 40;

  init() {
    document.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: true });
    document.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: true });
  }

  destroy() {
    document.removeEventListener('touchstart', this.onTouchStart.bind(this));
    document.removeEventListener('touchend', this.onTouchEnd.bind(this));
  }

  private onTouchStart(e: TouchEvent) {
    this.startX = e.touches[0].clientX;
    this.startY = e.touches[0].clientY;
  }

  private onTouchEnd(e: TouchEvent) {
    const deltaX = e.changedTouches[0].clientX - this.startX;
    const deltaY = e.changedTouches[0].clientY - this.startY;

    const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
    const isVertical   = Math.abs(deltaY) > Math.abs(deltaX);

    // ─── Swipe gauche → droite (page précédente) ──────────────────
    if (isHorizontal && deltaX > this.SWIPE_THRESHOLD && this.startX < this.EDGE_ZONE) {
      window.history.back();
      return;
    }

    // ─── Pull to refresh (glisse vers le bas) ─────────────────────
    if (isVertical && deltaY > this.SWIPE_THRESHOLD && window.scrollY === 0) {
      window.location.reload();
    }
  }
}