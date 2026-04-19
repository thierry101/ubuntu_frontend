import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';


async function requestStoragePermission(): Promise<boolean> {
    const permission = await Filesystem.requestPermissions();
    return permission.publicStorage === 'granted';
}


export async function saveFile(buffer: ArrayBuffer | Blob, fileName: string, mimeType: string): Promise<void> {
    const isNative = Capacitor.isNativePlatform();

    if (!isNative) {
        const { saveAs } = await import('file-saver');
        const blob = buffer instanceof Blob ? buffer : new Blob([buffer], { type: mimeType });
        saveAs(blob, fileName);
        return;
    }

    // ✅ Demande permission avant tout
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
        console.error('Permission stockage refusée');
        // tu peux afficher un toast ici
        return;
    }

    const ab = buffer instanceof Blob ? await buffer.arrayBuffer() : buffer;
    const base64 = await arrayBufferToBase64(ab);

    // ✅ Sauvegarde dans Downloads
    await Filesystem.writeFile({
        path: fileName,
        data: base64,
        directory: Directory.External,
        recursive: true,
    });

    // ✅ Sauvegarde dans Cache pour le partage
    const cacheResult = await Filesystem.writeFile({
        path: fileName,
        data: base64,
        directory: Directory.Cache,
        recursive: true,
    });

    // ✅ Dialogue de partage natif
    await Share.share({
        title: fileName,
        url: cacheResult.uri,
        dialogTitle: `Partager ou ouvrir ${fileName}`,
    });
}

function arrayBufferToBase64(buffer: ArrayBuffer): Promise<string> {
    return new Promise((resolve, reject) => {
        const blob = new Blob([buffer]);
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}