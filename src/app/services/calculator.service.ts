/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, signal, computed } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class CalculatorService {

  constructor() { }

  private currentInput = signal<string>('0');
  private expression = signal<string>('');
  private lastOpPressed = signal<boolean>(false);
  private justEvaluated = signal<boolean>(false);

  display = computed(() => this.currentInput());
  exprDisplay = computed(() => this.expression());

  press(key: string): void {
    switch (key) {
      case 'C': this.clear(); break;
      case '±': this.toggleSign(); break;
      case '%': this.toPercent(); break;
      case '=': this.evaluate(); break;
      case '.': this.addDot(); break;
      case '+': case '-':
      case '*': case '/':
        this.setOperator(key); break;
      default:
        this.addDigit(key);
    }
  }

  private clear(): void {
    this.currentInput.set('0');
    this.expression.set('');
    this.lastOpPressed.set(false);
    this.justEvaluated.set(false);
  }

  private toggleSign(): void {
    const val = parseFloat(this.currentInput());
    this.currentInput.set((val * -1).toString());
  }

  private toPercent(): void {
    const val = parseFloat(this.currentInput());
    this.currentInput.set((val / 100).toString());
  }

  private addDot(): void {
    if (this.justEvaluated()) { this.currentInput.set('0'); this.justEvaluated.set(false); }
    if (this.lastOpPressed()) { this.currentInput.set('0'); this.lastOpPressed.set(false); }
    if (!this.currentInput().includes('.')) {
      this.currentInput.update((v:any) => v + '.');
    }
  }

  private addDigit(digit: string): void {
    if (this.justEvaluated() || this.lastOpPressed()) {
      this.currentInput.set(digit);
      this.justEvaluated.set(false);
      this.lastOpPressed.set(false);
    } else {
      this.currentInput.update((v:any) => v === '0' ? digit : v + digit);
    }
  }

  private setOperator(op: string): void {
    const sym = this.opSymbol(op);
    if (this.lastOpPressed() && this.expression()) {
      // Remplace l'opérateur précédent
      this.expression.update((e:any) => e.slice(0, -2) + sym + ' ');
    } else {
      const val = this.justEvaluated() ? this.currentInput() : this.currentInput();
      this.expression.update((e:any) => e + val + ' ' + sym + ' ');
    }
    this.lastOpPressed.set(true);
    this.justEvaluated.set(false);
  }

  private evaluate(): void {
    const expr = this.expression();
    if (!expr) return;

    const full = expr + this.currentInput();
    const sanitized = full
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-');

    try {
      // eslint-disable-next-line no-new-func
      const result = Function('"use strict"; return (' + sanitized + ')')();
      const rounded = parseFloat(result.toFixed(10));
      this.expression.set(full + ' =');
      this.currentInput.set(rounded.toString());
      this.lastOpPressed.set(false);
      this.justEvaluated.set(true);
    } catch {
      this.currentInput.set('Erreur');
      this.expression.set('');
    }
  }

  private opSymbol(op: string): string {
    const map: Record<string, string> = { '+': '+', '-': '−', '*': '×', '/': '÷' };
    return map[op] ?? op;
  }
}
