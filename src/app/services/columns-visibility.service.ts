import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ColumnsVisibilityService {

  constructor() { }

  private visibilityMap: Map<string, boolean> = new Map();

  setColumns(columns: { key: string, visible: boolean }[]) {
    this.visibilityMap.clear();
    columns.forEach(col => this.visibilityMap.set(col.key, col.visible));
  }

  toggleColumn(key: string, columns: { key: string, visible: boolean }[]) {
    const col = columns.find(c => c.key === key);
    if (col) {
      col.visible = !col.visible;
      this.setColumns(columns);
    }
  }

  isVisible(key: string): boolean {
    return this.visibilityMap.get(key) ?? false;
  }
}
