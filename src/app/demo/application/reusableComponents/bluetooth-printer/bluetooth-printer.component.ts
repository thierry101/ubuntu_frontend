/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrintService, PrinterDevice } from 'src/app/services/print.service';
import { isMobileApp, toastShow } from 'src/app/share/shared';

@Component({
  selector: 'app-bluetooth-printer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bluetooth-printer.component.html',
  styleUrl: './bluetooth-printer.component.scss'
})
export class BluetoothPrinterComponent implements OnInit, OnDestroy {

  discoveredPrinters: PrinterDevice[] = [];
  scanningPrinters = false;
  connectingPrinter = false;
  connectingId = '';
  printerSearchDone = false;
  isMobileApp: boolean = false;

  get selectedPrinter(): PrinterDevice | null {
    return this.printService.getSelectedPrinter();
  }

  constructor(private printService: PrintService) { }

  // bluetooth-printer.component.ts
  async ngOnInit(): Promise<void> {
    this.isMobileApp = isMobileApp;

    // ✅ Ne restaure que si aucune imprimante n'est déjà connectée en mémoire
    await this.printService.restoreConnection(() => {
      toastShow('warning', 'Imprimante déconnectée');
    });
  }

  async ngOnDestroy(): Promise<void> {
    // try {
    //   await this.printService.disconnect();
    // } catch (e) {
    //   console.warn('Erreur déconnexion imprimante:', e);
    // }
  }

  // ══════════════════════════════════════════════
  // BLUETOOTH — Scan
  // ══════════════════════════════════════════════

  async scanPrinters(): Promise<void> {
    try {
      this.scanningPrinters = true;
      this.discoveredPrinters = [];
      this.printerSearchDone = false;

      const btEnabled = await this.printService.isBluetoothEnabled();
      if (!btEnabled) {
        await this.promptEnableBluetooth();
        return;
      }

      this.discoveredPrinters = await this.printService.scanPrinters();

    } catch (err) {
      console.error(err);
      const msg = (err as any)?.message?.toLowerCase() || '';
      if (msg.includes('bluetooth') || msg.includes('disabled') || msg.includes('not enabled')) {
        await this.promptEnableBluetooth();
      }
    } finally {
      this.scanningPrinters = false;
      this.printerSearchDone = true;
    }
  }

  // ══════════════════════════════════════════════
  // BLUETOOTH — Connexion / Déconnexion
  // ══════════════════════════════════════════════

  async connectToPrinter(device: PrinterDevice): Promise<void> {
    try {
      this.connectingPrinter = true;
      this.connectingId = device.deviceId;

      await this.printService.connect(device, () => {
        toastShow('warning', 'Imprimante déconnectée');
      });

      this.discoveredPrinters = [];
      this.printerSearchDone = false;

    } catch (err) {
      console.error(err);
      toastShow('error', `Impossible de se connecter à ${device.name || device.deviceId}`);
    } finally {
      this.connectingPrinter = false;
      this.connectingId = '';
    }
  }

  async disconnectPrinter(): Promise<void> {
    try {
      await this.printService.disconnect();
    } catch (err) {
      console.error(err);
      toastShow('error', "Impossible de déconnecter l'imprimante");
    }
  }

  // ══════════════════════════════════════════════
  // BLUETOOTH — Activation
  // ══════════════════════════════════════════════

  private async promptEnableBluetooth(): Promise<void> {
    try {
      await this.printService.requestEnableBluetooth();
    } catch {
      toastShow('warning', '❌ Veuillez activer le Bluetooth dans les réglages');
    }
  }
}