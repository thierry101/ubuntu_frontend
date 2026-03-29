/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { BleClient, BleDevice } from '@capacitor-community/bluetooth-le';

@Injectable({ providedIn: 'root' })
export class PrintService {

  private readonly PRINTER_SERVICE = '000018f0-0000-1000-8000-00805f9b34fb';
  private readonly PRINTER_CHAR = '00002af1-0000-1000-8000-00805f9b34fb';

  private selectedPrinter: BleDevice | null = null;

  // ─── SCAN & CONNEXION ───────────────────────────────────────────

  async initialize() {
    await BleClient.initialize({ androidNeverForLocation: false });
  }

  async scanPrinters(): Promise<BleDevice[]> {
    await this.initialize();
    const devices: BleDevice[] = [];

    await BleClient.requestLEScan({}, (result) => {
      if (!devices.find(d => d.deviceId === result.device.deviceId)) {
        devices.push(result.device);
      }
    });

    await new Promise(resolve => setTimeout(resolve, 5000));
    await BleClient.stopLEScan();
    return devices;
  }

  async connectToPrinter(device: BleDevice): Promise<void> {
    await BleClient.connect(device.deviceId);
    this.selectedPrinter = device;
    localStorage.setItem('posPrinter', JSON.stringify(device));
  }

  getSelectedPrinter(): BleDevice | null {
    if (this.selectedPrinter) return this.selectedPrinter;
    const saved = localStorage.getItem('posPrinter');
    return saved ? JSON.parse(saved) : null;
  }

  async disconnect(): Promise<void> {
    if (this.selectedPrinter) {
      await BleClient.disconnect(this.selectedPrinter.deviceId);
      this.selectedPrinter = null;
    }
    localStorage.removeItem('posPrinter');
  }

  // ─── IMPRESSION ─────────────────────────────────────────────────

  async print(htmlElement: HTMLElement): Promise<void> {
    const printer = this.getSelectedPrinter();
    if (!printer) throw new Error('Aucune imprimante connectée');

    const commands = this.htmlToEscPos(htmlElement);
    await this.sendData(printer.deviceId, commands);
  }

  private async sendData(deviceId: string, data: Uint8Array): Promise<void> {
    try {
      await BleClient.connect(deviceId);
    } catch {
      // Déjà connecté
    }

    const chunkSize = 20;
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      await BleClient.write(
        deviceId,
        this.PRINTER_SERVICE,
        this.PRINTER_CHAR,
        new DataView(chunk.buffer)
      );
      await new Promise(r => setTimeout(r, 30));
    }
  }

  private htmlToEscPos(element: HTMLElement): Uint8Array {
    const cmds: number[] = [];

    cmds.push(0x1B, 0x40);       // Initialize printer

    // ─── FIX ACCENTS : sélection de la page de codes ──────────────
    // ESC t n → sélectionne la page de caractères
    // 0x10 (16) = CP1252 / Windows-1252  (essayer en premier)
    // 0x11 (17) = CP1252 variante        (si 0x10 ne marche pas)
    // 0x02 (2)  = PC850 Multilingue      (fallback si CP1252 non supporté)
    cmds.push(0x1B, 0x74, 0x10); // ESC t 16 → CP1252

    cmds.push(0x1B, 0x61, 0x01); // Alignement centré par défaut

    const lines = this.parseElement(element);

    for (const line of lines) {
      if (line.type === 'separator') {
        cmds.push(0x1B, 0x61, 0x01);
        cmds.push(...this.textToBytes(
          line.dashed ? '- '.repeat(16) + '\n' : '-'.repeat(32) + '\n'
        ));
      } else if (line.type === 'bold-center') {
        cmds.push(0x1B, 0x61, 0x01);
        cmds.push(0x1B, 0x45, 0x01);
        cmds.push(...this.textToBytes(line.text + '\n'));
        cmds.push(0x1B, 0x45, 0x00);
      } else if (line.type === 'bold') {
        cmds.push(0x1B, 0x61, 0x00);
        cmds.push(0x1B, 0x45, 0x01);
        cmds.push(...this.textToBytes(line.text + '\n'));
        cmds.push(0x1B, 0x45, 0x00);
      } else if (line.type === 'center') {
        cmds.push(0x1B, 0x61, 0x01);
        cmds.push(...this.textToBytes(line.text + '\n'));
        cmds.push(0x1B, 0x61, 0x00);
      } else if (line.type === 'row') {
        cmds.push(0x1B, 0x61, 0x00);
        cmds.push(...this.textToBytes(this.formatRow(line.left, line.right) + '\n'));
      } else {
        cmds.push(0x1B, 0x61, 0x00);
        cmds.push(...this.textToBytes((line.text || '') + '\n'));
      }
    }

    cmds.push(0x1B, 0x64, 0x01);       // Feed 5 lines
    cmds.push(0x1D, 0x56, 0x41, 0x00); // Cut

    return new Uint8Array(cmds);
  }

  private parseElement(element: HTMLElement): any[] {
    const lines: any[] = [];
    const seen = new Set<Node>();

    const walk = (node: HTMLElement) => {
      if (seen.has(node)) return;

      const tag = node.tagName?.toLowerCase();
      if (!tag) return;

      // Ignorer les éléments cachés
      const style = window.getComputedStyle(node);
      if (style.display === 'none' || style.visibility === 'hidden') return;

      // HR - séparateur
      if (tag === 'hr') {
        seen.add(node);
        const borderStyle = node.style?.borderTop || '';
        lines.push({ type: 'separator', dashed: borderStyle.includes('dashed') });
        return;
      }

      // Titres
      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) {
        seen.add(node);
        const text = node.innerText?.trim();
        if (text) lines.push({ type: 'bold-center', text });
        return;
      }

      // Strong dans text-center (ex: nom entreprise)
      if (tag === 'strong' && node.parentElement?.classList.contains('text-center')) {
        seen.add(node);
        const text = node.innerText?.trim();
        if (text) lines.push({ type: 'bold-center', text });
        return;
      }

      // Lignes articles (li)
      if (tag === 'li') {
        seen.add(node);
        node.querySelectorAll('*').forEach(n => seen.add(n));
        const text = node.innerText?.trim();
        if (text) {
          text.split('\n').forEach(l => {
            const t = l.trim();
            if (t) lines.push({ type: 'text', text: t });
          });
        }
        return;
      }

      // Row avec deux col-6 (acompte / reste)
      if (tag === 'div' && node.classList.contains('row')) {
        const cols = Array.from(node.querySelectorAll('.col-6'));
        if (cols.length === 2) {
          seen.add(node);
          cols.forEach(c => seen.add(c));
          node.querySelectorAll('*').forEach(n => seen.add(n));
          const left = (cols[0] as HTMLElement).innerText?.trim() || '';
          const right = (cols[1] as HTMLElement).innerText?.trim() || '';
          lines.push({ type: 'row', left, right });
          return;
        }
      }

      // div / p / small feuilles
      if (['div', 'p', 'small'].includes(tag)) {
        const hasBlockChildren = Array.from(node.children).some(
          c => !['b', 'strong', 'span', 'small', 'br', 'i'].includes(c.tagName.toLowerCase())
        );

        if (!hasBlockChildren && !seen.has(node)) {
          seen.add(node);
          const text = node.innerText?.trim();
          if (text) {
            const isCenter = node.classList.contains('text-center') ||
              node.closest('.text-center') !== null;
            const hasBold = node.querySelector('b, strong') !== null;

            if (isCenter && hasBold) {
              lines.push({ type: 'bold-center', text });
            } else if (isCenter) {
              lines.push({ type: 'center', text });
            } else if (hasBold) {
              lines.push({ type: 'bold', text });
            } else {
              lines.push({ type: 'text', text });
            }
          }
          return;
        }
      }

      // Récursion sur les enfants
      Array.from(node.children).forEach(child => walk(child as HTMLElement));
    };

    Array.from(element.children).forEach(child => walk(child as HTMLElement));
    return lines;
  }

  private formatRow(left: string, right: string, width = 32): string {
    left = this.normalizeSpaces(left);
    right = this.normalizeSpaces(right);
    const maxLeft = width - right.length - 1;
    const truncated = left.length > maxLeft ? left.substring(0, maxLeft) : left;
    const spaces = width - truncated.length - right.length;
    return truncated + ' '.repeat(Math.max(1, spaces)) + right;
  }

  /**
   * Normalise tous les types d'espaces spéciaux en espace ASCII standard.
   * Corrige notamment le séparateur de milliers \u202F utilisé par Angular locale 'fr'.
   */
  private normalizeSpaces(text: string): string {
    return text
      .replace(/\u202F/g, ' ') // espace fine insécable (séparateur milliers Angular fr)
      .replace(/\u00A0/g, ' ') // espace insécable
      .replace(/\u2009/g, ' ') // espace fine
      .replace(/\u2007/g, ' ') // espace chiffre
      .replace(/\u2008/g, ' ') // espace ponctuation
      .replace(/\u200B/g, ''); // espace de largeur nulle (supprimé)
  }

  private textToBytes(text: string): number[] {
    // Normalise les espaces spéciaux AVANT encodage
    text = this.normalizeSpaces(text);

    const bytes: number[] = [];

    // ─── Table CP1252 complète ─────────────────────────────────────
    // Utilisée avec ESC t 0x10 (code page 16 = CP1252 / Windows-1252)
    // Si votre imprimante ne supporte pas CP1252, passez ESC t à 0x02
    // et utilisez le mapping pc850Map ci-dessous à la place.
    const cp1252Map: { [code: number]: number } = {
      0x20AC: 0x80, // €
      0x201A: 0x82, // ‚
      0x0192: 0x83, // ƒ
      0x201E: 0x84, // „
      0x2026: 0x85, // …
      0x2020: 0x86, // †
      0x2021: 0x87, // ‡
      0x02C6: 0x88, // ˆ
      0x2030: 0x89, // ‰
      0x0160: 0x8A, // Š
      0x2039: 0x8B, // ‹
      0x0152: 0x8C, // Œ
      0x017D: 0x8E, // Ž
      0x2018: 0x91, // '
      0x2019: 0x92, // '
      0x201C: 0x93, // "
      0x201D: 0x94, // "
      0x2022: 0x95, // •
      0x2013: 0x96, // –
      0x2014: 0x97, // —
      0x02DC: 0x98, // ˜
      0x2122: 0x99, // ™
      0x0161: 0x9A, // š
      0x203A: 0x9B, // ›
      0x0153: 0x9C, // œ
      0x017E: 0x9E, // ž
      0x0178: 0x9F, // Ÿ
      // Latin-1 (0xA0 - 0xFF) : mapping direct
      0x00A0: 0x20, // espace insécable → espace
      0x00A1: 0xA1, 0x00A2: 0xA2, 0x00A3: 0xA3, 0x00A4: 0xA4,
      0x00A5: 0xA5, 0x00A6: 0xA6, 0x00A7: 0xA7, 0x00A8: 0xA8,
      0x00A9: 0xA9, 0x00AA: 0xAA, 0x00AB: 0xAB, 0x00AC: 0xAC,
      0x00AD: 0xAD, 0x00AE: 0xAE, 0x00AF: 0xAF,
      0x00B0: 0xB0, // °
      0x00B1: 0xB1, 0x00B2: 0xB2, 0x00B3: 0xB3, 0x00B4: 0xB4,
      0x00B5: 0xB5, 0x00B6: 0xB6, 0x00B7: 0xB7, 0x00B8: 0xB8,
      0x00B9: 0xB9, 0x00BA: 0xBA, 0x00BB: 0xBB, 0x00BC: 0xBC,
      0x00BD: 0xBD, 0x00BE: 0xBE, 0x00BF: 0xBF,
      0x00C0: 0xC0, // À
      0x00C1: 0xC1, 0x00C2: 0xC2, 0x00C3: 0xC3,
      0x00C4: 0xC4, 0x00C5: 0xC5,
      0x00C6: 0xC6, 0x00C7: 0xC7, // Ç
      0x00C8: 0xC8, // È
      0x00C9: 0xC9, // É
      0x00CA: 0xCA, // Ê
      0x00CB: 0xCB, // Ë
      0x00CC: 0xCC, 0x00CD: 0xCD,
      0x00CE: 0xCE, // Î
      0x00CF: 0xCF, // Ï
      0x00D0: 0xD0, 0x00D1: 0xD1, 0x00D2: 0xD2, 0x00D3: 0xD3,
      0x00D4: 0xD4, // Ô
      0x00D5: 0xD5,
      0x00D6: 0xD6, // Ö
      0x00D7: 0xD7, 0x00D8: 0xD8,
      0x00D9: 0xD9, // Ù
      0x00DA: 0xDA,
      0x00DB: 0xDB, // Û
      0x00DC: 0xDC, // Ü
      0x00DD: 0xDD, 0x00DE: 0xDE, 0x00DF: 0xDF,
      0x00E0: 0xE0, // à
      0x00E1: 0xE1,
      0x00E2: 0xE2, // â
      0x00E3: 0xE3,
      0x00E4: 0xE4, // ä
      0x00E5: 0xE5, 0x00E6: 0xE6,
      0x00E7: 0xE7, // ç
      0x00E8: 0xE8, // è
      0x00E9: 0xE9, // é
      0x00EA: 0xEA, // ê
      0x00EB: 0xEB, // ë
      0x00EC: 0xEC,
      0x00ED: 0xED,
      0x00EE: 0xEE, // î
      0x00EF: 0xEF, // ï
      0x00F0: 0xF0, 0x00F1: 0xF1, 0x00F2: 0xF2, 0x00F3: 0xF3,
      0x00F4: 0xF4, // ô
      0x00F5: 0xF5,
      0x00F6: 0xF6, // ö
      0x00F7: 0xF7, 0x00F8: 0xF8,
      0x00F9: 0xF9, // ù
      0x00FA: 0xFA,
      0x00FB: 0xFB, // û
      0x00FC: 0xFC, // ü
      0x00FD: 0xFD, 0x00FE: 0xFE, 0x00FF: 0xFF,
    };

    
    for (const char of text) {
      const code = char.codePointAt(0) ?? 0x3F;

      if (code >= 0x20 && code <= 0x7E) {
        // ASCII imprimable
        bytes.push(code);
      } else if (code === 0x0A || code === 0x0D) {
        // Saut de ligne
        bytes.push(code);
      } else if (cp1252Map[code] !== undefined) {
        // Caractère CP1252 (remplacer par pc850Map si nécessaire)
        bytes.push(cp1252Map[code]);
      } else {
        // Caractère non supporté → '?'
        bytes.push(0x3F);
      }
    }

    return bytes;
  }
}