import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { addBarcodeProduct, addToPantry, getProductByBarcode } from '../src/services/firebaseService';

export default function BarcodeScanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [barcode, setBarcode] = useState<string | null>(null);
  const [productName, setProductName] = useState<string | null>(null);
  const [manualName, setManualName] = useState('');
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleScanned = async ({ data }: { data: string }) => {
    if (!scanning || barcode) return;
    setScanning(false);
    setBarcode(data);
    setLoading(true);
    try {
      const result = await getProductByBarcode(data);
      setProductName(result?.productName ?? null);
      if (result?.productName) {
        Alert.alert('Produkt u gjet', `${result.productName}\nBarkod: ${data}`);
      }
    } catch (err) {
      console.log('[BarcodeScanner] lookup error:', (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!barcode) {
      Alert.alert('Skano barkodin', 'Skano barkodin para se të shtosh në raft.');
      return;
    }
    const nameToUse = productName || manualName;
    if (!nameToUse.trim()) {
      Alert.alert('Emri mungon', 'Shkruaj emrin e produktit nëse nuk u gjet automatikisht.');
      return;
    }
    setAdding(true);
    try {
      if (!productName) {
        await addBarcodeProduct(barcode, nameToUse);
      }
      await addToPantry('demoUser', { name: nameToUse, quantity: 1, unit: 'pcs', barcode });
      Alert.alert('U shtua në raft', `${nameToUse} u ruajt me barkod ${barcode}.`);
    } catch (err) {
      Alert.alert('Gabim', (err as Error).message);
    } finally {
      setAdding(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4A7C59" />
        <Text style={styles.info}>Duke kontrolluar lejet...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Ionicons name="camera" size={48} color="#2F3E34" />
        <Text style={styles.title}>Kërkohet leja e kamerës</Text>
        <TouchableOpacity style={styles.primary} onPress={requestPermission}>
          <Text style={styles.primaryText}>Autorizo kamerën</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Barcode Scanner</Text>
      <View style={styles.cameraBox}>
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39'] }}
          onBarcodeScanned={scanning ? handleScanned : undefined}
        />
        <View style={styles.frame} pointerEvents="none" />
      </View>

      <View style={styles.actions}>
        {!barcode ? (
          <TouchableOpacity
            style={[styles.primary, scanning && styles.primaryActive]}
            onPress={() => {
              setBarcode(null);
              setProductName(null);
              setManualName('');
              setScanning(true);
              Alert.alert('Skano Barkodën', 'Vendos barkodin në kornizë – skanimi automatik.');
            }}
          >
            <Ionicons name="barcode" size={18} color="#fff" />
            <Text style={styles.primaryText}>Skano Barkodën</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.badgeRow}>
            <Ionicons name="checkmark-circle" size={18} color="green" />
            <Text style={styles.badgeText}>Barkodi: {barcode}</Text>
            <TouchableOpacity
              style={styles.secondary}
              onPress={() => {
                setBarcode(null);
                setProductName(null);
                setManualName('');
                setScanning(true);
              }}
            >
              <Ionicons name="refresh" size={16} color="#2F3E34" />
              <Text style={styles.secondaryText}>Skano sërish</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.resultCard}>
        {loading ? (
          <Text style={styles.info}>Duke kërkuar produktin…</Text>
        ) : productName ? (
          <Text style={styles.product}>Produkt: {productName}</Text>
        ) : barcode ? (
          <Text style={styles.info}>Nuk u gjet produkt. Shto emrin manualisht.</Text>
        ) : (
          <Text style={styles.info}>Skano një barkod për të marrë emrin.</Text>
        )}

        {!productName && barcode && (
          <TextInput
            style={styles.input}
            placeholder="Emri i produktit"
            placeholderTextColor="#556B5F"
            value={manualName}
            onChangeText={setManualName}
          />
        )}

        {barcode && (
          <TouchableOpacity style={[styles.primary, styles.fullWidth]} onPress={handleAdd} disabled={adding}>
            <Ionicons name="basket" size={18} color="#fff" />
            <Text style={styles.primaryText}>{adding ? 'Duke shtuar…' : 'Add to Pantry'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#9FB5A4',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C7D3C1',
    gap: 12,
  },
  header: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  cameraBox: {
    position: 'relative',
    width: '100%',
    height: 320,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#B8E1C2',
    marginBottom: 16,
  },
  camera: { flex: 1 },
  frame: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    borderWidth: 2,
    borderColor: '#B8E1C2',
    borderRadius: 16,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badgeText: {
    color: '#2F3E34',
    fontWeight: '600',
  },
  resultCard: {
    backgroundColor: '#E8EFE6',
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  product: {
    color: '#2F3E34',
    fontSize: 16,
    fontWeight: '600',
  },
  info: { color: '#2F3E34' },
  input: {
    backgroundColor: '#EEF3EC',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    color: '#2F3E34',
  },
  primary: {
    backgroundColor: '#7E9B8D',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryActive: {
    backgroundColor: '#5f8e7a',
  },
  primaryText: {
    color: '#fff',
    fontWeight: '600',
  },
  secondary: {
    backgroundColor: '#EEF3EC',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  secondaryText: {
    color: '#2F3E34',
    fontWeight: '600',
  },
  fullWidth: { justifyContent: 'center' },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2F3E34',
    marginBottom: 12,
    textAlign: 'center',
  },
});
