// BluetoothClassicPlugin.java
package com.digTrans.AnKe;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.OutputStream;
import java.util.Set;
import java.util.UUID;

@CapacitorPlugin(name = "BluetoothClassic")
public class BluetoothClassicPlugin extends Plugin {

    private BluetoothSocket activeSocket = null;
    private OutputStream outputStream = null;

    // UUID SPP standard pour imprimantes Bluetooth Classique
    private static final UUID SPP_UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");

    @PluginMethod
    public void listPaired(PluginCall call) {
        try {
            BluetoothAdapter adapter = BluetoothAdapter.getDefaultAdapter();
            if (adapter == null) {
                call.reject("Bluetooth non supporté");
                return;
            }
            Set<BluetoothDevice> paired = adapter.getBondedDevices();
            JSArray devices = new JSArray();
            for (BluetoothDevice device : paired) {
                JSObject d = new JSObject();
                d.put("address", device.getAddress());
                d.put("name", device.getName() != null ? device.getName() : "");
                devices.put(d);
            }
            JSObject result = new JSObject();
            result.put("devices", devices);
            call.resolve(result);
        } catch (Exception e) {
            call.reject("Erreur: " + e.getMessage());
        }
    }

    @PluginMethod
    public void connect(PluginCall call) {
        String address = call.getString("address");
        if (address == null) {
            call.reject("Adresse manquante");
            return;
        }
        // Connexion en thread séparé pour ne pas bloquer l'UI
        new Thread(() -> {
            try {
                BluetoothAdapter adapter = BluetoothAdapter.getDefaultAdapter();
                BluetoothDevice device = adapter.getRemoteDevice(address);

                // Fermer la connexion précédente si existante
                if (activeSocket != null) {
                    try {
                        activeSocket.close();
                    } catch (Exception ignored) {
                    }
                }

                activeSocket = device.createRfcommSocketToServiceRecord(SPP_UUID);
                adapter.cancelDiscovery();
                activeSocket.connect();
                outputStream = activeSocket.getOutputStream();
                call.resolve();
            } catch (Exception e) {
                call.reject("Connexion échouée: " + e.getMessage());
            }
        }).start();
    }

    @PluginMethod
    public void disconnect(PluginCall call) {
        try {
            if (outputStream != null) {
                outputStream.close();
                outputStream = null;
            }
            if (activeSocket != null) {
                activeSocket.close();
                activeSocket = null;
            }
            call.resolve();
        } catch (Exception e) {
            call.reject("Déconnexion échouée: " + e.getMessage());
        }
    }

    @PluginMethod
    public void write(PluginCall call) {
        String base64 = call.getString("data");
        if (base64 == null) {
            call.reject("Données manquantes");
            return;
        }
        new Thread(() -> {
            try {
                if (outputStream == null) {
                    call.reject("Non connecté - outputStream null");
                    return;
                }

                byte[] bytes = android.util.Base64.decode(base64, android.util.Base64.NO_WRAP);

                // Debug via Capacitor bridge (affiche une alerte côté JS)
                StringBuilder hex = new StringBuilder();
                for (int i = 0; i < Math.min(bytes.length, 10); i++) {
                    hex.append(String.format("%02X ", bytes[i]));
                }

                // Notifier le JS avec les infos debug
                JSObject debugInfo = new JSObject();
                debugInfo.put("hex", hex.toString());
                debugInfo.put("totalBytes", bytes.length);
                notifyListeners("debugWrite", debugInfo);

                outputStream.write(bytes);
                outputStream.flush();
                call.resolve();
            } catch (Exception e) {
                call.reject("Erreur écriture: " + e.getMessage());
            }
        }).start();
    }

}