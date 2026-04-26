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
  private classicConnectionInterval: any = null;
  private bleDisconnectCallback: ((deviceId: string) => void) | null = null;

  // ─── INITIALISATION ─────────────────────────────────────────────

  async initialize(): Promise<void> {
    await BleClient.initialize({ androidNeverForLocation: true });
  }

  async isBluetoothEnabled(): Promise<boolean> {
    try {
      await BleClient.initialize({ androidNeverForLocation: true });
      return await BleClient.isEnabled();
    } catch {
      return false;
    }
  }

  // ─── SCAN ───────────────────────────────────────────────────────

  async scanPrinters(): Promise<PrinterDevice[]> {
    await this.initialize();
    const devices: PrinterDevice[] = [];

    // 🔵 1. Scan BLE
    await BleClient.requestLEScan({}, (result) => {
      if (!devices.find(d => d.deviceId === result.device.deviceId) && result.device.name) {
        devices.push({
          deviceId: result.device.deviceId,
          name: result.device.name,
          _type: 'ble'
        });
      }
    });

    await new Promise(resolve => setTimeout(resolve, 4000));
    await BleClient.stopLEScan();

    // 🔴 2. Récupérer les appareils déjà appairés (CLASSIC)
    try {
      const paired = await BluetoothClassic.listPaired();

      paired.devices.forEach(d => {
        if (!devices.find(dev => dev.deviceId === d.address)) {
          devices.push({
            deviceId: d.address,
            name: d.name || 'Bluetooth Device',
            _type: 'classic'
          });
        }
      });

    } catch (err) {
      console.warn('Erreur récupération appareils appairés', err);
    }

    return devices;
  }


  async requestEnableBluetooth(): Promise<void> {
    try {
      await BleClient.requestEnable();
    } catch {
      try {
        await BleClient.openAppSettings();
      } catch {
        throw new Error('Bluetooth non activable');
      }
    }
  }

  // ─── GESTION IMPRIMANTE SÉLECTIONNÉE ────────────────────────────

  getSelectedPrinter(): PrinterDevice | null {
    if (this.selectedPrinter) return this.selectedPrinter;
    const saved = localStorage.getItem('posPrinter');
    return saved ? JSON.parse(saved) : null;
  }

  setSelectedPrinter(device: PrinterDevice): void {
    this.selectedPrinter = device;
    localStorage.setItem('posPrinter', JSON.stringify(device));
  }

  clearSelectedPrinter(): void {
    this.selectedPrinter = null;
    localStorage.removeItem('posPrinter');
    this.stopClassicConnectionWatch();
  }

  // ─── CONNEXION ──────────────────────────────────────────────────

  async connect(
    device: PrinterDevice,
    onDisconnect?: () => void
  ): Promise<void> {
    if (device._type === 'classic') {
      await BluetoothClassic.connect({ address: device.deviceId });
      this.startClassicConnectionWatch(device, onDisconnect);
    } else {
      this.bleDisconnectCallback = (deviceId: string) => {
        console.warn('Imprimante BLE déconnectée:', deviceId);
        this.clearSelectedPrinter();
        onDisconnect?.();
      };
      await BleClient.connect(device.deviceId, this.bleDisconnectCallback);
    }

    this.setSelectedPrinter(device);
  }

  async disconnect(): Promise<void> {
    const printer = this.getSelectedPrinter();
    if (!printer) return;

    if (printer._type === 'classic') {
      this.stopClassicConnectionWatch();
      await BluetoothClassic.disconnect();
    } else {
      await BleClient.disconnect(printer.deviceId);
    }

    this.clearSelectedPrinter();
  }

  // ─── RESTAURATION AU DÉMARRAGE ──────────────────────────────────

  async restoreConnection(onDisconnect?: () => void): Promise<boolean> {
    const saved = localStorage.getItem('posPrinter');
    if (!saved) return false;

    const device: PrinterDevice = JSON.parse(saved);

    try {
      if (device._type === 'classic') {
        await BluetoothClassic.connect({ address: device.deviceId });
        this.selectedPrinter = device;
        this.startClassicConnectionWatch(device, onDisconnect);
      } else {
        const devices = await BleClient.getDevices([device.deviceId]);
        if (devices.length > 0) {
          this.selectedPrinter = device;
        } else {
          this.clearSelectedPrinter();
          return false;
        }
      }
      return true;
    } catch {
      // Imprimante éteinte ou hors portée
      this.clearSelectedPrinter();
      return false;
    }
  }

  // ─── POLLING BLUETOOTH CLASSIQUE ────────────────────────────────

  private startClassicConnectionWatch(
    device: PrinterDevice,
    onDisconnect?: () => void
  ): void {
    this.stopClassicConnectionWatch();
    this.classicConnectionInterval = setInterval(async () => {
      try {
        await BluetoothClassic.connect({ address: device.deviceId });
      } catch {
        this.clearSelectedPrinter();
        onDisconnect?.();
        this.stopClassicConnectionWatch();
      }
    }, 5000);
  }

  private stopClassicConnectionWatch(): void {
    if (this.classicConnectionInterval) {
      clearInterval(this.classicConnectionInterval);
      this.classicConnectionInterval = null;
    }
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
    cmds.push(0x1B, 0x74, 0x00);
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

    const pc437Map: { [code: number]: number } = {
      0x00E7: 0x87, 0x00FC: 0x81, 0x00E9: 0x82, 0x00E2: 0x83,
      0x00E4: 0x84, 0x00E0: 0x85, 0x00EA: 0x88, 0x00EB: 0x89,
      0x00E8: 0x8A, 0x00EF: 0x8B, 0x00EE: 0x8C, 0x00EC: 0x8D,
      0x00C4: 0x8E, 0x00C5: 0x8F, 0x00E6: 0x91, 0x00F4: 0x93,
      0x00F6: 0x94, 0x00F2: 0x95, 0x00FB: 0x96, 0x00F9: 0x97,
      0x00FF: 0x98, 0x00D6: 0x99, 0x00DC: 0x9A, 0x00E1: 0xA0,
      0x00ED: 0xA1, 0x00F3: 0xA2, 0x00FA: 0xA3, 0x00F1: 0xA4,
      0x00D1: 0xA5, 0x00C0: 0xB7, 0x00C8: 0x7F, 0x00C9: 0x90,
      0x00CA: 0x7F, 0x00CE: 0x7F, 0x00D4: 0x7F, 0x00D9: 0x7F,
      0x00DB: 0x7F, 0x20AC: 0xEE, 0x00B0: 0xF8, 0x00B7: 0xFA,
      0x00BD: 0xAB, 0x00BC: 0xAC, 0x00A1: 0xAD, 0x00AB: 0xAE,
      0x00BB: 0xAF, 0x00A9: 0x7F, 0x00AE: 0x7F, 0x00A0: 0x20,
    };

    for (const char of text) {
      const code = char.codePointAt(0) ?? 0x3F;
      if (code >= 0x20 && code <= 0x7E) {
        bytes.push(code);
      } else if (code === 0x0A || code === 0x0D) {
        bytes.push(code);
      } else if (pc437Map[code] !== undefined) {
        bytes.push(pc437Map[code]);
      } else {
        bytes.push(0x3F);
      }
    }

    return bytes;
  }
}