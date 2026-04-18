package com.digTrans.AnKe;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(android.os.Bundle savedInstanceState) {
        registerPlugin(BluetoothClassicPlugin.class); // ← Ajouter cette ligne
        super.onCreate(savedInstanceState);
    }
}
