// src/screens/ScanScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  Modal,
  ActivityIndicator,
  ScrollView,
  Animated,
  Dimensions,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useIsFocused } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import { useUser } from '../context/UserContext';
import { analyzeIngredients } from '../services/aiService';
import { getProductByBarcode, addBarcodeProduct } from '../services/firebaseService';
// Theme colors
const COLORS = {
  primary: '#4A7C59',
  primaryDark: '#3D6B4A',
  secondary: '#F5F1EB',
  background: '#FAF8F5',
  cardBackground: '#FFFFFF',
  text: '#2D3E32',
  textSecondary: '#6B7D6F',
  textLight: '#9BA89E',
  border: '#E8E4DE',
  white: '#FFFFFF',
  success: '#4CAF50',
  warning: '#FF9800',
  danger: '#E53935',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 50,
};

const FONTS = {
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 22,
  }
};

const { width } = Dimensions.get('window');

const ScanScreen = ({ navigation }) => {
  const { healthConditions, addToShelf: addToShelfContext } = useUser();
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const isFocused = useIsFocused();
  const [scanResult, setScanResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const cameraRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  // Barcode scanner states
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [barcodeReady, setBarcodeReady] = useState(false);
  const [barcodeValue, setBarcodeValue] = useState(null);
  const [barcodeProductName, setBarcodeProductName] = useState(null);
  const [barcodeManualName, setBarcodeManualName] = useState('');
  const [isBarcodeLoading, setIsBarcodeLoading] = useState(false);
  const [isBarcodeAdding, setIsBarcodeAdding] = useState(false);
  const barcodeCameraRef = useRef(null);

  // Ensure only one camera holds the resource; add a delay before mounting barcode camera
  useEffect(() => {
    if (showBarcodeScanner) {
      setBarcodeReady(false);
      // Longer delay to ensure main camera fully unmounts
      const t = setTimeout(() => setBarcodeReady(true), 500);
      return () => clearTimeout(t);
    } else {
      setBarcodeReady(false);
    }
  }, [showBarcodeScanner]);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  useEffect(() => {
    if (isScanning) {
      const scanLine = Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
      scanLine.start();
      return () => scanLine.stop();
    }
  }, [isScanning]);

  // Camera lifecycle management
  useEffect(() => {
    return () => {
      // Cleanup: stop any ongoing animations or camera operations
      if (cameraRef.current) {
        try {
          // Reset camera state if needed
        } catch (e) {
          console.log('Camera cleanup error:', e);
        }
      }
    };
  }, []);

  // Request camera permission on mount
  useEffect(() => {
    const requestCameraPermission = async () => {
      if (!permission?.granted) {
        await requestPermission();
      }
    };
    requestCameraPermission();
  }, []);

  // REAL SCAN FUNCTION - Takes photo and sends to AI
const handleScan = async () => {
  // Check camera permission first
  if (!permission?.granted) {
    const newPermission = await requestPermission();
    if (!newPermission?.granted) {
      Alert.alert('Error', 'Camera permission required to scan');
      return;
    }
  }

  if (!cameraRef.current) {
    Alert.alert('Error', 'Camera not ready. Please try again.');
    return;
  }

  setIsScanning(true);

  try {
    // 1. Take photo
    console.log('[v0] Taking photo...');
    
    let photo;
    try {
      photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: true, // Get base64 directly
        skipProcessing: false,
      });
      console.log('[v0] Photo taken successfully');
    } catch (photoError) {
      console.log('[v0] Error taking photo:', photoError);
      throw new Error('Failed to take photo');
    }

    if (!photo) {
      throw new Error('No photo captured');
    }

    console.log('[v0] Photo URI:', photo.uri);
    
    // 2. Get base64 - either from photo directly or convert
    let base64 = photo.base64;
    
    if (!base64) {
      console.log('[v0] Converting to base64...');
      try {
        base64 = await FileSystem.readAsStringAsync(photo.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      } catch (convertError) {
        console.log('[v0] Error converting to base64:', convertError);
        throw new Error('Failed to process image');
      }
    }

    console.log('[v0] Base64 length:', base64?.length || 0);

    if (!base64 || base64.length < 1000) {
      throw new Error('Invalid image data');
    }

    // 3. Send to AI for analysis
    console.log('[v0] Analyzing with AI...');
    const result = await analyzeIngredients(base64, healthConditions || []);

    if (!result || !result.ingredients) {
      throw new Error('Invalid analysis result');
    }

    console.log('[v0] Analysis complete:', result.productName);

    // 4. Show results
    setScanResult(result);
    setShowResult(true);

  } catch (error) {
    console.log('[v0] Scan error:', error.message);
    Alert.alert(
      'Scan Failed',
      `Error: ${error.message}\n\nPlease try again and make sure the ingredients list is clearly visible.`,
      [{ text: 'OK' }]
    );
  } finally {
    setIsScanning(false);
  }
};

  const addToShelf = () => {
    setShowResult(false);
    const productToSave = scanResult;
    setScanResult(null);
    // Add to shelf context
    addToShelfContext(productToSave);
    navigation.navigate('Rafti', { newProduct: productToSave });
  };

  const navigateTo = (screen) => {
    setMenuVisible(false);
    navigation.navigate(screen);
  };

  const toggleFlash = () => {
    setFlashEnabled(!flashEnabled);
  };

  // Handle barcode scanning
  const handleBarcodeScanned = async ({ data }) => {
    if (isBarcodeLoading || !data) return;

    setIsBarcodeLoading(true);
    setBarcodeValue(data);

    try {
      console.log('[Barcode] Scanned:', data);
      const result = await getProductByBarcode(data);
      // Log source for clarity: local, local-added, or local-miss
      if (result && result.source) {
        console.log('[Barcode] Source:', result.source);
      }

      if (result.found && result.name) {
        setBarcodeProductName(result.name);
        console.log('[Barcode] Product found:', result.name);
      } else {
        setBarcodeProductName(null);
        console.log('[Barcode] Product not found in database');
      }
    } catch (error) {
      console.error('[Barcode] Error:', error);
      setBarcodeProductName(null);
    } finally {
      setIsBarcodeLoading(false);
    }
  };

  // Add barcode product to database and shelf
  const handleAddBarcodeToPantry = async () => {
    const productName = barcodeProductName || barcodeManualName;

    if (!productName || !productName.trim()) {
      Alert.alert('Error', 'Please enter a product name');
      return;
    }

    setIsBarcodeAdding(true);

    try {
      // If manual name was entered and product wasn't in DB, add it
      if (!barcodeProductName && barcodeManualName && barcodeValue) {
        console.log('[Barcode] Adding new product to database');
        await addBarcodeProduct(barcodeValue, barcodeManualName);
      }

      // Create product object to save
      const product = {
        productName: productName,
        barcode: barcodeValue,
        overallSafe: true,
        ingredients: [],
        warnings: [],
        scannedAt: new Date().toISOString()
      };

      // Close barcode scanner and result modals
      setShowBarcodeScanner(false);
      setShowResult(false);
      setScanResult(null);

      // Reset barcode states
      setBarcodeValue(null);
      setBarcodeProductName(null);
      setBarcodeManualName('');

      // Add to shelf context
      addToShelfContext(product);

      // Navigate to shelf with new product
      navigation.navigate('Rafti', { newProduct: product });

      console.log('[Barcode] Product added successfully');
    } catch (error) {
      console.error('[Barcode] Error adding product:', error);
      Alert.alert('Error', 'Failed to add product. Please try again.');
    } finally {
      setIsBarcodeAdding(false);
    }
  };

  // Loading state
  if (!permission) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Kamera duke u hapur...</Text>
      </View>
    );
  }

  // No permission state
  if (!permission.granted) {
    return (
      <View style={styles.noPermissionContainer}>
        <View style={styles.noPermissionIcon}>
          <Ionicons name="camera-off" size={48} color={COLORS.primary} />
        </View>
        <Text style={styles.noPermissionTitle}>Kerkohet aksesi i kameres </Text>
        <Text style={styles.noPermissionText}>
          Ju lutem aksesoni kameren per te skanuar ingredientet e produkteve
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={requestPermission}>
          <Text style={styles.retryButtonText}>Autorizim </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Camera View (render only when focused and barcode modal closed) */}
      {isFocused && !showBarcodeScanner && (
        <View style={styles.cameraContainer}>
          <CameraView 
            style={StyleSheet.absoluteFillObject}
            ref={cameraRef} 
            facing="back"
            flash={flashEnabled ? 'on' : 'off'}
          />
          <View style={styles.overlay}>
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => setMenuVisible(true)}
            >
              <Ionicons name="menu" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>SKANO INGREDIENTET </Text>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => navigation.navigate('Profile')}
            >
              <Ionicons name="person-outline" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          {/* Instructions */}
          <View style={styles.instructionBanner}>
            <Ionicons name="information-circle" size={20} color={COLORS.white} />
            <Text style={styles.instructionBannerText}>
              Poziciono listen e ingredienteve brenda kornizes
            </Text>
          </View>

          {/* Scan Frame Area */}
          <View style={styles.scanFrameContainer}>
            <Animated.View style={[
              styles.scanFrame, 
              { transform: [{ scale: pulseAnim }] }
            ]}>
              {/* Corner decorations */}
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
              
              {/* Scan line animation */}
              {isScanning && (
                <Animated.View 
                  style={[
                    styles.scanLine,
                    {
                      transform: [{
                        translateY: scanLineAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, width * 0.75 - 20],
                        })
                      }]
                    }
                  ]} 
                />
              )}
            </Animated.View>
            
            <Text style={styles.instructionText}>
              {isScanning 
                ? 'Analyzing ingredients with AI...' 
                : 'Point camera at product ingredients list'}
            </Text>
          </View>

          {/* Health Conditions Display */}
          {healthConditions && healthConditions.length > 0 && (
            <View style={styles.healthConditionsBar}>
              <Text style={styles.healthConditionsLabel}>Kerko per: </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {healthConditions.map((condition) => (
                  <View key={condition.id} style={styles.conditionChip}>
                    <Text style={styles.conditionChipText}>{condition.name}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Bottom Controls */}
          <View style={styles.bottomControls}>
            <TouchableOpacity 
              style={[styles.sideButton, flashEnabled && styles.sideButtonActive]} 
              onPress={toggleFlash}
            >
              <Ionicons 
                name={flashEnabled ? "flash" : "flash-outline"} 
                size={24} 
                color={COLORS.white} 
              />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.captureButton, isScanning && styles.captureButtonScanning]}
              onPress={handleScan}
              disabled={isScanning}
            >
              {isScanning ? (
                <ActivityIndicator size="large" color={COLORS.primary} />
              ) : (
                <View style={styles.captureButtonInner}>
                  <Ionicons name="scan" size={32} color={COLORS.white} />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.sideButton}>
              <Ionicons name="images-outline" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          </View>
        </View>
      )}

      {/* Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Menu</Text>
              <TouchableOpacity onPress={() => setMenuVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('Home')}>
              <Ionicons name="home-outline" size={22} color={COLORS.primary} />
              <Text style={styles.menuItemText}>Home</Text>
              <Ionicons name="chevron-forward" size={22} color={COLORS.textLight} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('Rafti')}>
              <Ionicons name="bookmark-outline" size={22} color={COLORS.primary} />
              <Text style={styles.menuItemText}>Rafti</Text>
              <Ionicons name="chevron-forward" size={22} color={COLORS.textLight} />
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.menuItem, styles.menuItemActive]} onPress={() => setMenuVisible(false)}>
              <Ionicons name="scan" size={22} color={COLORS.primary} />
              <Text style={[styles.menuItemText, styles.menuItemTextActive]}>Skano</Text>
              <Ionicons name="chevron-forward" size={22} color={COLORS.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('Receta')}>
              <Ionicons name="restaurant-outline" size={22} color={COLORS.primary} />
              <Text style={styles.menuItemText}>Receta</Text>
              <Ionicons name="chevron-forward" size={22} color={COLORS.textLight} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={() => navigateTo('Profili')}>
              <Ionicons name="person-outline" size={22} color={COLORS.primary} />
              <Text style={styles.menuItemText}>Profili</Text>
              <Ionicons name="chevron-forward" size={22} color={COLORS.textLight} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Result Modal */}
      <Modal
        visible={showResult}
        transparent
        animationType="slide"
        onRequestClose={() => setShowResult(false)}
      >
        <View style={styles.resultOverlay}>
          <View style={styles.resultContainer}>
            <View style={styles.resultHandle} />
            
            {/* Status Icon */}
            <View style={[
              styles.statusIcon,
              scanResult?.overallSafe ? styles.statusIconSafe : styles.statusIconWarning
            ]}>
              <Ionicons 
                name={scanResult?.overallSafe ? 'checkmark-circle' : 'warning'} 
                size={48} 
                color={COLORS.white} 
              />
            </View>

            <Text style={styles.resultTitle}>
              {scanResult?.overallSafe ? 'E sigurt për konsum' : 'Përmban alergjenë'}
            </Text>
            
            <Text style={styles.productName}>{scanResult?.productName}</Text>

            {/* Warnings */}
            {scanResult?.warnings && scanResult.warnings.length > 0 && (
              <View style={styles.warningsContainer}>
                {scanResult.warnings.map((warning, index) => (
                  <View key={index} style={styles.warningItem}>
                    <Ionicons name="alert-circle" size={16} color={COLORS.danger} />
                    <Text style={styles.warningText}>{warning}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Ingredients List */}
            <ScrollView style={styles.ingredientsList}>
              <Text style={styles.ingredientsTitle}>
                Ingredientet e detektuar ({scanResult?.ingredients?.length || 0}):
              </Text>
              {scanResult?.ingredients?.map((ingredient, index) => (
                <View key={index} style={styles.ingredientRow}>
                  <View style={styles.ingredientInfo}>
                    <View style={[
                      styles.ingredientDot,
                      ingredient.safe ? styles.dotSafe : styles.dotUnsafe
                    ]} />
                    <Text style={[
                      styles.ingredientName,
                      !ingredient.safe && styles.ingredientNameUnsafe
                    ]}>
                      {ingredient.name}
                    </Text>
                  </View>
                  <Ionicons 
                    name={ingredient.safe ? 'checkmark-circle' : 'alert-circle'} 
                    size={20} 
                    color={ingredient.safe ? COLORS.success : COLORS.danger} 
                  />
                </View>
              ))}
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.resultActions}>
              {(() => {
                const productName = scanResult?.productName?.trim();
                const isUnknown = !productName || ['Produkt i panjohur', 'Unknown Product'].includes(productName);
                return !isUnknown;
              })() ? (
                <TouchableOpacity 
                  style={styles.addToShelfButton}
                  onPress={addToShelf}
                >
                  <Ionicons name="add" size={20} color={COLORS.white} />
                  <Text style={styles.addToShelfText}>Shto ne raft</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={[styles.addToShelfButton, { backgroundColor: COLORS.primaryDark }]}
                  onPress={() => {
                    setShowResult(false);
                    setShowBarcodeScanner(true);
                  }}
                >
                  <Ionicons name="barcode-outline" size={20} color={COLORS.white} />
                  <Text style={styles.addToShelfText}>Skano Barcode</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={styles.scanAgainButton}
                onPress={() => {
                  setShowResult(false);
                  setScanResult(null);
                }}
              >
                <Text style={styles.scanAgainText}>Skano Serish</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Barcode Scanner Modal */}
      <Modal
        visible={showBarcodeScanner}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowBarcodeScanner(false)}
      >
        <View style={styles.barcodeContainer}>
          <StatusBar barStyle="light-content" />

          {/* Header */}
          <View style={styles.barcodeHeaderBar}>
            <TouchableOpacity
              style={styles.barcodeCloseButton}
              onPress={() => {
                setShowBarcodeScanner(false);
                setBarcodeValue(null);
                setBarcodeProductName(null);
                setBarcodeManualName('');
              }}
            >
              <Ionicons name="close" size={28} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.barcodeHeaderTitle}>Barcode Scanner</Text>
          </View>

          {/* Camera Box */}
          <View style={styles.barcodeCameraBox}>
            {/* Permission gate and delayed mount to avoid black camera */}
            {!permission?.granted ? (
              <View style={styles.noPermissionContainer}>
                <View style={styles.noPermissionIcon}>
                  <Ionicons name="camera" size={48} color={COLORS.primary} />
                </View>
                <Text style={styles.noPermissionTitle}>Kerkohet aksesi i kameres</Text>
                <Text style={styles.noPermissionText}>Ju lutem jepni leje për kamerën për të skanuar barkode.</Text>
                <TouchableOpacity style={styles.retryButton} onPress={requestPermission}>
                  <Text style={styles.retryButtonText}>Autorizo</Text>
                </TouchableOpacity>
              </View>
            ) : !barcodeReady ? (
              <View style={styles.barcodeLoadingOverlay}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.barcodeLoadingText}>Duke hapur kamerën…</Text>
              </View>
            ) : (
              <CameraView
                key="barcode-camera"
                ref={barcodeCameraRef}
                style={styles.barcodeCamera}
                facing="back"
                onBarcodeScanned={handleBarcodeScanned}
                barcodeScannerSettings={{
                  barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39'],
                }}
              />
            )}
            <View style={styles.barcodeFrameBorder} pointerEvents="none" />
            {isBarcodeLoading && (
              <View style={styles.barcodeLoadingOverlay}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.barcodeLoadingText}>Duke lexuar…</Text>
              </View>
            )}
          </View>

          {/* Result Card */}
          <View style={styles.barcodeResultContainer}>
            {!barcodeValue ? (
              <View style={styles.barcodeInfoCard}>
                <Ionicons name="barcode-outline" size={32} color={COLORS.primary} />
                <Text style={styles.barcodeInfoText}>
                  Vendos barkodin në kornizë – skanimi automatik
                </Text>
              </View>
            ) : (
              <View style={styles.barcodeResultCard}>
                <View style={styles.barcodeBadge}>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                  <Text style={styles.barcodeBadgeText}>Barkodi: {barcodeValue}</Text>
                  <TouchableOpacity
                    style={styles.barcodeRescanButton}
                    onPress={() => {
                      setBarcodeValue(null);
                      setBarcodeProductName(null);
                      setBarcodeManualName('');
                    }}
                  >
                    <Ionicons name="refresh" size={18} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>

                {barcodeProductName ? (
                  <Text style={styles.barcodeProductText}>Produkt: {barcodeProductName}</Text>
                ) : (
                  <>
                    <Text style={styles.barcodeWarningText}>
                      Nuk u gjet produkt. Shto emrin manualisht.
                    </Text>
                    <TextInput
                      style={styles.barcodeInput}
                      placeholder="Emri i produktit"
                      placeholderTextColor={COLORS.textLight}
                      value={barcodeManualName}
                      onChangeText={setBarcodeManualName}
                    />
                  </>
                )}

                <TouchableOpacity
                  style={[
                    styles.barcodePrimaryButton,
                    isBarcodeAdding && styles.barcodeButtonDisabled
                  ]}
                  onPress={handleAddBarcodeToPantry}
                  disabled={isBarcodeAdding || (!barcodeProductName && !barcodeManualName)}
                >
                  <Ionicons name="basket" size={18} color={COLORS.white} />
                  <Text style={styles.barcodePrimaryButtonText}>
                    {isBarcodeAdding ? 'Duke shtuar…' : 'Shto ne Raft'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 45,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 1,
  },

  // Instruction Banner
  instructionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(74, 124, 89, 0.9)',
    marginHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
  },
  instructionBannerText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
  },
  
  // Scan Frame
  scanFrameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: width * 0.75,
    height: width * 0.75,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    position: 'relative',
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: COLORS.primary,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: RADIUS.lg,
  },
  topRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: RADIUS.lg,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: RADIUS.lg,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: RADIUS.lg,
  },
  scanLine: {
    position: 'absolute',
    left: 10,
    right: 10,
    height: 3,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },
  instructionText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    marginTop: SPACING.xxl,
    textAlign: 'center',
    fontWeight: '500',
  },
  
  // Health Conditions Bar
  healthConditionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    backgroundColor: 'rgba(0,0,0,0.6)',
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.xl,
  },
  healthConditionsLabel: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    marginRight: SPACING.md,
    fontWeight: '500',
  },
  conditionChip: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    marginRight: SPACING.sm,
  },
  conditionChipText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
  },
  
  // Bottom Controls
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 50 : 40,
    paddingHorizontal: SPACING.xxxl,
    gap: SPACING.xxxl,
  },
  sideButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sideButtonActive: {
    backgroundColor: COLORS.primary,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  captureButtonScanning: {
    backgroundColor: COLORS.secondary,
  },
  captureButtonInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Loading & No Permission States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.lg,
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  noPermissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.xxxl,
  },
  noPermissionIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  noPermissionTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  noPermissionText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    marginTop: SPACING.xl,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
  },
  
  // Menu Modal
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  menuContainer: {
    width: '75%',
    height: '100%',
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'ios' ? 60 : 45,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: '700',
    color: COLORS.text,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuItemActive: {
    backgroundColor: `${COLORS.primary}15`,
  },
  menuItemText: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.text,
    marginLeft: SPACING.lg,
    fontWeight: '500',
  },
  menuItemTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  
  // Result Modal
  resultOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  resultContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.xl,
    maxHeight: '85%',
  },
  resultHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.xl,
  },
  statusIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: SPACING.lg,
  },
  statusIconSafe: {
    backgroundColor: COLORS.success,
  },
  statusIconWarning: {
    backgroundColor: COLORS.danger,
  },
  resultTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  productName: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  warningsContainer: {
    backgroundColor: '#FFF3E0',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  warningText: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
    color: COLORS.danger,
  },
  ingredientsList: {
    maxHeight: 200,
    marginBottom: SPACING.xl,
  },
  ingredientsTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  ingredientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  ingredientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ingredientDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.md,
  },
  dotSafe: {
    backgroundColor: COLORS.success,
  },
  dotUnsafe: {
    backgroundColor: COLORS.danger,
  },
  ingredientName: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    flex: 1,
  },
  ingredientNameUnsafe: {
    color: COLORS.danger,
    fontWeight: '600',
  },
  resultActions: {
    gap: SPACING.md,
  },
  addToShelfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  addToShelfText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
  },
  scanAgainButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.lg,
  },
  scanAgainText: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
  },

  // Barcode Scanner Styles
  barcodeContainer: {
    flex: 1,
    backgroundColor: '#9FB5A4',
    paddingTop: Platform.OS === 'ios' ? 60 : 45,
    paddingHorizontal: 20,
  },
  barcodeHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  barcodeCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  barcodeHeaderTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  barcodeCameraBox: {
    position: 'relative',
    width: '100%',
    height: 320,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#B8E1C2',
    marginBottom: 16,
  },
  barcodeCamera: {
    flex: 1,
  },
  barcodeFrameBorder: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    borderWidth: 2,
    borderColor: '#B8E1C2',
    borderRadius: 16,
  },
  barcodeLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
  },
  barcodeLoadingText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
  },
  barcodeResultContainer: {
    flex: 1,
  },
  barcodeInfoCard: {
    backgroundColor: '#E8EFE6',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },
  barcodeInfoText: {
    color: '#2F3E34',
    fontSize: FONTS.sizes.md,
    textAlign: 'center',
  },
  barcodeResultCard: {
    backgroundColor: '#E8EFE6',
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  barcodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#C7D3C1',
  },
  barcodeBadgeText: {
    color: '#2F3E34',
    fontWeight: '600',
    fontSize: FONTS.sizes.md,
    flex: 1,
  },
  barcodeRescanButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF3EC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  barcodeProductText: {
    color: '#2F3E34',
    fontSize: 16,
    fontWeight: '600',
  },
  barcodeWarningText: {
    color: '#2F3E34',
    fontSize: FONTS.sizes.sm,
  },
  barcodeInput: {
    backgroundColor: '#EEF3EC',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    color: '#2F3E34',
    fontSize: FONTS.sizes.md,
  },
  barcodePrimaryButton: {
    backgroundColor: '#7E9B8D',
    paddingVertical: 12,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  barcodeButtonDisabled: {
    backgroundColor: '#B8C7B8',
    opacity: 0.6,
  },
  barcodePrimaryButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: FONTS.sizes.lg,
  },
  barcodeResultCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    margin: SPACING.xl,
    gap: SPACING.md,
  },
  barcodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  barcodeValue: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  productFound: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.secondary,
    padding: SPACING.md,
    borderRadius: RADIUS.sm,
  },
  productFoundText: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.text,
    fontWeight: '500',
    flex: 1,
  },
  productNotFound: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: '#FFF3E0',
    padding: SPACING.md,
    borderRadius: RADIUS.sm,
  },
  productNotFoundText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  manualInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  addButtonDisabled: {
    backgroundColor: COLORS.textLight,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
  },
  barcodeFrameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  barcodeScanFrame: {
    width: '100%',
    height: width * 0.6,
    borderRadius: RADIUS.lg,
    borderWidth: 3,
    borderColor: COLORS.primary,
    position: 'relative',
  },
  barcodeLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
    borderRadius: RADIUS.md,
  },
  barcodeLoadingText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
  },
  barcodeBottomInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
  },
  loadingText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: '500',
  },
});

export default ScanScreen;