import { Injectable } from '@angular/core';
import {
  CapacitorBarcodeScanner,
  CapacitorBarcodeScannerTypeHint,
  CapacitorBarcodeScannerCameraDirection,
} from '@capacitor/barcode-scanner';

@Injectable({ providedIn: 'root' })
export class BarcodeScannerService {

  async scan(): Promise<string | null> {
    try {
      const result = await CapacitorBarcodeScanner.scanBarcode({
        hint: CapacitorBarcodeScannerTypeHint.ALL,
        scanInstructions: 'Pointez la caméra vers un code barre',
        scanButton: false,
        cameraDirection: CapacitorBarcodeScannerCameraDirection.BACK,
      });

      return result.ScanResult ?? null;
    } catch (error) {
      console.error('Erreur scan:', error);
      return null;
    }
  }
}