/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { BleClient } from '@capacitor-community/bluetooth-le';
import { registerPlugin } from '@capacitor/core';

interface BluetoothClassicPlugin {
  listPaired(): Promise<{ devices: { address: string; name: string }[] }>;
  connect(options: { address: string }): Promise<void>;
  disconnect(): Promise<void>;
  write(options: { data: string }): Promise<void>;
}

const BluetoothClassic = registerPlugin<BluetoothClassicPlugin>('BluetoothClassic');

export interface PrinterDevice {
  deviceId: string;
  name?: string;
  _type: 'ble' | 'classic';
}

@Injectable({ providedIn: 'root' })
export class PrintService {

  private readonly PRINTER_SERVICE = '000018f0-0000-1000-8000-00805f9b34fb';
  private readonly PRINTER_CHAR = '00002af1-0000-1000-8000-00805f9b34fb';

  private selectedPrinter: PrinterDevice | null = null;

  // ─── SCAN & CONNEXION ───────────────────────────────────────────

  async initialize() {
    await BleClient.initialize({ androidNeverForLocation: true });
  }

  async scanPrinters(): Promise<PrinterDevice[]> {
    await this.initialize();
    const devices: PrinterDevice[] = [];

    await BleClient.requestLEScan({}, (result) => {
      if (!devices.find(d => d.deviceId === result.device.deviceId) && result.device.name) {
        devices.push({
          deviceId: result.device.deviceId,
          name: result.device.name,
          _type: 'ble'
        });
      }
    });

    await new Promise(resolve => setTimeout(resolve, 5000));
    await BleClient.stopLEScan();
    return devices;
  }

  getSelectedPrinter(): PrinterDevice | null {
    if (this.selectedPrinter) return this.selectedPrinter;
    const saved = localStorage.getItem('posPrinter');
    return saved ? JSON.parse(saved) : null;
  }

  setSelectedPrinter(device: PrinterDevice) {
    this.selectedPrinter = device;
    localStorage.setItem('posPrinter', JSON.stringify(device));
  }

  clearSelectedPrinter() {
    this.selectedPrinter = null;
    localStorage.removeItem('posPrinter');
  }

  async disconnect(): Promise<void> {
    const printer = this.getSelectedPrinter();
    if (printer) {
      if (printer._type === 'classic') {
        await BluetoothClassic.disconnect();
      } else {
        await BleClient.disconnect(printer.deviceId);
      }
    }
    this.clearSelectedPrinter();
  }

  // ─── IMPRESSION ─────────────────────────────────────────────────

  async print(htmlElement: HTMLElement): Promise<void> {
    const printer = this.getSelectedPrinter();
    if (!printer) throw new Error('Aucune imprimante connectée');

    const commands = this.htmlToEscPos(htmlElement);

    if (printer._type === 'classic') {
      await this.sendDataClassic(commands);
    } else {
      await this.sendDataBle(printer.deviceId, commands);
    }
  }

  private async sendDataBle(deviceId: string, data: Uint8Array): Promise<void> {
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

  private async sendDataClassic(data: Uint8Array): Promise<void> {
    let binary = '';
    const chunkSize = 1024;
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }
    const base64 = btoa(binary);
    await BluetoothClassic.write({ data: base64 });
  }

  // ─── ESC/POS ────────────────────────────────────────────────────

  private htmlToEscPos(element: HTMLElement): Uint8Array {
    const cmds: number[] = [];

    cmds.push(0x1B, 0x40);
    cmds.push(0x1B, 0x74, 0x00); // ← PC437 (changer de 0x10 à 0x00)
    cmds.push(0x1B, 0x61, 0x01);

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

    cmds.push(0x1B, 0x64, 0x01);
    cmds.push(0x1D, 0x56, 0x41, 0x00);

    return new Uint8Array(cmds);
  }

  private parseElement(element: HTMLElement): any[] {
    const lines: any[] = [];
    const seen = new Set<Node>();

    const walk = (node: HTMLElement) => {
      if (seen.has(node)) return;

      const tag = node.tagName?.toLowerCase();
      if (!tag) return;

      const style = window.getComputedStyle(node);
      if (style.display === 'none' || style.visibility === 'hidden') return;

      if (tag === 'hr') {
        seen.add(node);
        const borderStyle = node.style?.borderTop || '';
        lines.push({ type: 'separator', dashed: borderStyle.includes('dashed') });
        return;
      }

      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) {
        seen.add(node);
        const text = node.innerText?.trim();
        if (text) lines.push({ type: 'bold-center', text });
        return;
      }

      if (tag === 'strong' && node.parentElement?.classList.contains('text-center')) {
        seen.add(node);
        const text = node.innerText?.trim();
        if (text) lines.push({ type: 'bold-center', text });
        return;
      }

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

  private normalizeSpaces(text: string): string {
    return text
      .replace(/\u202F/g, ' ')
      .replace(/\u00A0/g, ' ')
      .replace(/\u2009/g, ' ')
      .replace(/\u2007/g, ' ')
      .replace(/\u2008/g, ' ')
      .replace(/\u200B/g, '');
  }


  private textToBytes(text: string): number[] {
    text = this.normalizeSpaces(text);
    const bytes: number[] = [];

    // Table PC437 (code page 0x00) — caractères français
    const pc437Map: { [code: number]: number } = {
      // Lettres françaises minuscules
      0x00E7: 0x87, // ç
      0x00FC: 0x81, // ü
      0x00E9: 0x82, // é
      0x00E2: 0x83, // â
      0x00E4: 0x84, // ä
      0x00E0: 0x85, // à
      0x00EA: 0x88, // ê
      0x00EB: 0x89, // ë
      0x00E8: 0x8A, // è
      0x00EF: 0x8B, // ï
      0x00EE: 0x8C, // î
      0x00EC: 0x8D, // ì
      0x00C4: 0x8E, // Ä
      0x00C5: 0x8F, // Å
      0x00E6: 0x91, // æ
      0x00F4: 0x93, // ô
      0x00F6: 0x94, // ö
      0x00F2: 0x95, // ò
      0x00FB: 0x96, // û
      0x00F9: 0x97, // ù
      0x00FF: 0x98, // ÿ
      0x00D6: 0x99, // Ö
      0x00DC: 0x9A, // Ü
      0x00E1: 0xA0, // á
      0x00ED: 0xA1, // í
      0x00F3: 0xA2, // ó
      0x00FA: 0xA3, // ú
      0x00F1: 0xA4, // ñ
      0x00D1: 0xA5, // Ñ
      0x00C0: 0xB7, // À
      0x00C8: 0x7F, // È — approximation
      0x00C9: 0x90, // É
      0x00CA: 0x7F, // Ê — approximation
      0x00CE: 0x7F, // Î — approximation
      0x00D4: 0x7F, // Ô — approximation
      0x00D9: 0x7F, // Ù — approximation
      0x00DB: 0x7F, // Û — approximation
      // Symboles utiles
      0x20AC: 0xEE, // €
      0x00B0: 0xF8, // °
      0x00B7: 0xFA, // ·
      0x00BD: 0xAB, // ½
      0x00BC: 0xAC, // ¼
      0x00A1: 0xAD, // ¡
      0x00AB: 0xAE, // «
      0x00BB: 0xAF, // »
      0x00A9: 0x7F, // © — non supporté, remplacé
      0x00AE: 0x7F, // ® — non supporté, remplacé
      0x00A0: 0x20, // espace insécable → espace
    };

    for (const char of text) {
      const code = char.codePointAt(0) ?? 0x3F;

      if (code >= 0x20 && code <= 0x7E) {
        // ASCII imprimable
        bytes.push(code);
      } else if (code === 0x0A || code === 0x0D) {
        // Saut de ligne
        bytes.push(code);
      } else if (pc437Map[code] !== undefined) {
        bytes.push(pc437Map[code]);
      } else {
        // Caractère non supporté → '?'
        bytes.push(0x3F);
      }
    }

    return bytes;
  }

  // private textToBytes(text: string): number[] {
  //   text = this.normalizeSpaces(text);
  //   const bytes: number[] = [];

  //   const cp1252Map: { [code: number]: number } = {
  //     0x20AC: 0x80, 0x201A: 0x82, 0x0192: 0x83, 0x201E: 0x84,
  //     0x2026: 0x85, 0x2020: 0x86, 0x2021: 0x87, 0x02C6: 0x88,
  //     0x2030: 0x89, 0x0160: 0x8A, 0x2039: 0x8B, 0x0152: 0x8C,
  //     0x017D: 0x8E, 0x2018: 0x91, 0x2019: 0x92, 0x201C: 0x93,
  //     0x201D: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97,
  //     0x02DC: 0x98, 0x2122: 0x99, 0x0161: 0x9A, 0x203A: 0x9B,
  //     0x0153: 0x9C, 0x017E: 0x9E, 0x0178: 0x9F,
  //     0x00A0: 0x20,
  //     0x00A1: 0xA1, 0x00A2: 0xA2, 0x00A3: 0xA3, 0x00A4: 0xA4,
  //     0x00A5: 0xA5, 0x00A6: 0xA6, 0x00A7: 0xA7, 0x00A8: 0xA8,
  //     0x00A9: 0xA9, 0x00AA: 0xAA, 0x00AB: 0xAB, 0x00AC: 0xAC,
  //     0x00AD: 0xAD, 0x00AE: 0xAE, 0x00AF: 0xAF,
  //     0x00B0: 0xB0, 0x00B1: 0xB1, 0x00B2: 0xB2, 0x00B3: 0xB3,
  //     0x00B4: 0xB4, 0x00B5: 0xB5, 0x00B6: 0xB6, 0x00B7: 0xB7,
  //     0x00B8: 0xB8, 0x00B9: 0xB9, 0x00BA: 0xBA, 0x00BB: 0xBB,
  //     0x00BC: 0xBC, 0x00BD: 0xBD, 0x00BE: 0xBE, 0x00BF: 0xBF,
  //     0x00C0: 0xC0, 0x00C1: 0xC1, 0x00C2: 0xC2, 0x00C3: 0xC3,
  //     0x00C4: 0xC4, 0x00C5: 0xC5, 0x00C6: 0xC6, 0x00C7: 0xC7,
  //     0x00C8: 0xC8, 0x00C9: 0xC9, 0x00CA: 0xCA, 0x00CB: 0xCB,
  //     0x00CC: 0xCC, 0x00CD: 0xCD, 0x00CE: 0xCE, 0x00CF: 0xCF,
  //     0x00D0: 0xD0, 0x00D1: 0xD1, 0x00D2: 0xD2, 0x00D3: 0xD3,
  //     0x00D4: 0xD4, 0x00D5: 0xD5, 0x00D6: 0xD6, 0x00D7: 0xD7,
  //     0x00D8: 0xD8, 0x00D9: 0xD9, 0x00DA: 0xDA, 0x00DB: 0xDB,
  //     0x00DC: 0xDC, 0x00DD: 0xDD, 0x00DE: 0xDE, 0x00DF: 0xDF,
  //     0x00E0: 0xE0, 0x00E1: 0xE1, 0x00E2: 0xE2, 0x00E3: 0xE3,
  //     0x00E4: 0xE4, 0x00E5: 0xE5, 0x00E6: 0xE6, 0x00E7: 0xE7,
  //     0x00E8: 0xE8, 0x00E9: 0xE9, 0x00EA: 0xEA, 0x00EB: 0xEB,
  //     0x00EC: 0xEC, 0x00ED: 0xED, 0x00EE: 0xEE, 0x00EF: 0xEF,
  //     0x00F0: 0xF0, 0x00F1: 0xF1, 0x00F2: 0xF2, 0x00F3: 0xF3,
  //     0x00F4: 0xF4, 0x00F5: 0xF5, 0x00F6: 0xF6, 0x00F7: 0xF7,
  //     0x00F8: 0xF8, 0x00F9: 0xF9, 0x00FA: 0xFA, 0x00FB: 0xFB,
  //     0x00FC: 0xFC, 0x00FD: 0xFD, 0x00FE: 0xFE, 0x00FF: 0xFF,
  //   };

  //   for (const char of text) {
  //     const code = char.codePointAt(0) ?? 0x3F;
  //     if (code >= 0x20 && code <= 0x7E) {
  //       bytes.push(code);
  //     } else if (code === 0x0A || code === 0x0D) {
  //       bytes.push(code);
  //     } else if (cp1252Map[code] !== undefined) {
  //       bytes.push(cp1252Map[code]);
  //     } else {
  //       bytes.push(0x3F);
  //     }
  //   }

  //   return bytes;
  // }
}