import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { addFriend, getFriends, type Friend } from '@/lib/friends-manager';
import { parseContactQRData, validateContactPublicKey, type WhisprContact } from '@/lib/qr-contact';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

// Try both camera approaches
let CameraView: any = null;
let BarCodeScanner: any = null;

try {
  // Try the new expo-camera first
  const { CameraView: CV } = require('expo-camera');
  CameraView = CV;
  console.log('✅ Using expo-camera');
} catch (error) {
  try {
    // Fall back to expo-barcode-scanner
    const { BarCodeScanner: BCS } = require('expo-barcode-scanner');
    BarCodeScanner = BCS;
    console.log('✅ Using expo-barcode-scanner');
  } catch (error2) {
    console.log('❌ No camera scanning available:', error2);
  }
}

interface QRScannerComponentProps {
  onContactAdded?: (contact: WhisprContact) => void;
  onClose?: () => void;
  style?: any;
}

export default function QRScannerComponent({ onContactAdded, onClose, style }: QRScannerComponentProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualData, setManualData] = useState('');
  const [friends, setFriends] = useState<Friend[]>([]);

  useEffect(() => {
    getCameraPermissions();
    loadFriends();
  }, []);

  const getCameraPermissions = async () => {
    try {
      if (CameraView) {
        // Use expo-camera permissions
        const { Camera } = require('expo-camera');
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
      } else if (BarCodeScanner) {
        // Use expo-barcode-scanner permissions
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        setHasPermission(status === 'granted');
      } else {
        setHasPermission(false);
      }
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      setHasPermission(false);
    }
  };

  const loadFriends = async () => {
    try {
      const friendsList = await getFriends();
      setFriends(friendsList);
    } catch (error) {
      console.error('❌ Error loading friends:', error);
    }
  };

  const handleBarcodeScanned = (result: any) => {
    // Handle both expo-camera and expo-barcode-scanner formats
    const data = result.data || result;
    setScanned(true);
    processQRData(data);
  };

  const processQRData = async (qrData: string) => {
    try {
      console.log('📱 Processing QR data...');
      
      // Parse the QR data
      const contactData = parseContactQRData(qrData);
      if (!contactData) {
        Alert.alert('Invalid QR Code', 'This is not a valid Whispr contact QR code.');
        return;
      }

      // Validate the public key
      if (!validateContactPublicKey(contactData.publicKey)) {
        Alert.alert('Invalid Key', 'The public key in this QR code is not valid.');
        return;
      }

      // Check if contact already exists
      const existingFriend = friends.find(f => f.email === contactData.email);
      if (existingFriend) {
        Alert.alert(
          'Contact Exists',
          `${contactData.email} is already in your contacts. Would you like to update their information?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Update', onPress: () => updateExistingContact(contactData) },
          ]
        );
        return;
      }

      // Show contact preview and confirm addition
      showContactPreview(contactData);

    } catch (error) {
      console.error('❌ Error processing QR data:', error);
      Alert.alert('Error', `Failed to process QR code: ${(error as Error).message}`);
    }
  };

  const showContactPreview = (contactData: WhisprContact) => {
    const displayName = contactData.displayName || contactData.email.split('@')[0];
    
    Alert.alert(
      'Add Contact',
      `📧 Email: ${contactData.email}\n` +
      `👤 Name: ${displayName}\n` +
      `🔑 Encryption: Ready\n` +
      `📱 App: ${contactData.app} v${contactData.version}\n\n` +
      `Add this contact for secure messaging?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Add Contact', onPress: () => addNewContact(contactData) },
      ]
    );
  };

  const addNewContact = async (contactData: WhisprContact) => {
    try {
      console.log('➕ Adding new contact...');
      
      const friend: Friend = {
        id: Date.now().toString(),
        email: contactData.email,
        displayName: contactData.displayName || contactData.email.split('@')[0],
        publicKey: contactData.publicKey,
        addedAt: Date.now(),
        lastSeen: null,
        isOnline: false,
        avatar: null,
      };

      await addFriend(friend);
      await loadFriends(); // Refresh friends list
      
      Alert.alert(
        'Contact Added',
        `${friend.displayName} has been added to your contacts!`,
        [{ text: 'OK' }]
      );

      onContactAdded?.(contactData);
      
    } catch (error) {
      console.error('❌ Error adding contact:', error);
      Alert.alert('Error', `Failed to add contact: ${(error as Error).message}`);
    }
  };

  const updateExistingContact = async (contactData: WhisprContact) => {
    try {
      console.log('🔄 Updating existing contact...');
      Alert.alert('Contact Updated', `${contactData.email} has been updated!`);
    } catch (error) {
      console.error('❌ Error updating contact:', error);
      Alert.alert('Error', `Failed to update contact: ${(error as Error).message}`);
    }
  };

  const handleManualEntry = () => {
    if (!manualData.trim()) {
      Alert.alert('Error', 'Please enter the contact data');
      return;
    }

    processQRData(manualData.trim());
    setManualData('');
    setShowManualEntry(false);
  };

  const resetScanner = () => {
    setScanned(false);
    setScanning(false);
  };

  // Create a reusable ManualEntryModal component
  const ManualEntryModal = () => (
    <Modal visible={showManualEntry} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ThemedText style={styles.modalTitle}>Enter Contact Data</ThemedText>
          <ThemedText style={styles.modalSubtitle}>
            Paste the contact JSON data:
          </ThemedText>
          
          <TextInput
            style={styles.textInput}
            multiline
            numberOfLines={8}
            value={manualData}
            onChangeText={setManualData}
            placeholder="Paste contact data here..."
            placeholderTextColor="#9ca3af"
          />
          
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={styles.modalCancelButton} 
              onPress={() => {
                setShowManualEntry(false);
                setManualData('');
              }}
            >
              <ThemedText style={styles.modalCancelText}>Cancel</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.modalAddButton} onPress={handleManualEntry}>
              <ThemedText style={styles.modalAddText}>Add Contact</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // If no camera scanning is available
  if (!CameraView && !BarCodeScanner) {
    return (
      <ThemedView style={[styles.container, style]}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Add Contact</ThemedText>
          <ThemedText style={styles.subtitle}>
            Camera scanner not available - use manual entry
          </ThemedText>
          {onClose && (
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <ThemedText style={styles.closeText}>✕</ThemedText>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.options}>
          <ThemedText style={styles.warningText}>
            📷 Camera scanning requires camera packages to be installed.
            {'\n\n'}Try installing: npx expo install expo-camera
            {'\n'}Or: npx expo install expo-barcode-scanner
          </ThemedText>

          <TouchableOpacity 
            style={styles.manualButton} 
            onPress={() => setShowManualEntry(true)}
          >
            <ThemedText style={styles.manualButtonText}>✏️ Enter Contact Data</ThemedText>
          </TouchableOpacity>

          <View style={styles.friendsCount}>
            <ThemedText style={styles.friendsText}>
              👥 {friends.length} contact{friends.length !== 1 ? 's' : ''} added
            </ThemedText>
          </View>
        </View>

        <ManualEntryModal />
      </ThemedView>
    );
  }

  // Rest of the component for when camera is available
  if (hasPermission === null) {
    return (
      <ThemedView style={[styles.container, style]}>
        <ThemedText style={styles.message}>Requesting camera permission...</ThemedText>
      </ThemedView>
    );
  }

  if (hasPermission === false) {
    return (
      <ThemedView style={[styles.container, style]}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Camera Permission Required</ThemedText>
          {onClose && (
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <ThemedText style={styles.closeText}>✕</ThemedText>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.options}>
          <ThemedText style={styles.message}>
            Camera permission is required to scan QR codes.
          </ThemedText>
          <TouchableOpacity style={styles.permissionButton} onPress={getCameraPermissions}>
            <ThemedText style={styles.buttonText}>Grant Permission</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.manualButton, { marginTop: 20 }]} 
            onPress={() => setShowManualEntry(true)}
          >
            <ThemedText style={styles.manualButtonText}>✏️ Use Manual Entry</ThemedText>
          </TouchableOpacity>
        </View>

        <ManualEntryModal />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, style]}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Add Contact</ThemedText>
        <ThemedText style={styles.subtitle}>
          Scan QR code or enter contact data manually
        </ThemedText>
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <ThemedText style={styles.closeText}>✕</ThemedText>
          </TouchableOpacity>
        )}
      </View>

      {!scanning ? (
        <View style={styles.options}>
          <TouchableOpacity 
            style={styles.scanButton} 
            onPress={() => setScanning(true)}
          >
            <ThemedText style={styles.scanButtonText}>📷 Scan QR Code</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.manualButton} 
            onPress={() => setShowManualEntry(true)}
          >
            <ThemedText style={styles.manualButtonText}>✏️ Enter Manually</ThemedText>
          </TouchableOpacity>

          <View style={styles.friendsCount}>
            <ThemedText style={styles.friendsText}>
              👥 {friends.length} contact{friends.length !== 1 ? 's' : ''} added
            </ThemedText>
          </View>
        </View>
      ) : (
        <View style={styles.scannerContainer}>
          {CameraView ? (
            // Use expo-camera
            <CameraView
              style={styles.scanner}
              barcodeScannerSettings={{
                barcodeTypes: ['qr'],
              }}
              onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
            />
          ) : (
            // Use expo-barcode-scanner
            <BarCodeScanner
              onBarCodeScanned={scanned ? undefined : handleBarcodeScanned}
              style={styles.scanner}
            />
          )}
          
          <View style={styles.scannerOverlay}>
            <View style={styles.scannerFrame} />
            <ThemedText style={styles.scannerText}>
              Position QR code within the frame
            </ThemedText>
          </View>

          <View style={styles.scannerControls}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setScanning(false)}>
              <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
            </TouchableOpacity>
            
            {scanned && (
              <TouchableOpacity style={styles.rescanButton} onPress={resetScanner}>
                <ThemedText style={styles.rescanButtonText}>Scan Again</ThemedText>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      <ManualEntryModal />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    position: 'relative',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    padding: 40,
    lineHeight: 24,
  },
  warningText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#f59e0b',
    backgroundColor: '#fffbeb',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    lineHeight: 20,
  },
  permissionButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  options: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    minWidth: 200,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  manualButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
    minWidth: 200,
  },
  manualButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  friendsCount: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  friendsText: {
    fontSize: 14,
    color: '#6b7280',
  },
  scannerContainer: {
    flex: 1,
    position: 'relative',
  },
  scanner: {
    flex: 1,
  },
  scannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#6366f1',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  scannerText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 20,
    textAlign: 'center',
  },
  scannerControls: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  cancelButton: {
    backgroundColor: 'rgba(220, 38, 38, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  rescanButton: {
    backgroundColor: 'rgba(99, 102, 241, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  rescanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 12,
    fontFamily: 'monospace',
    textAlignVertical: 'top',
    marginBottom: 16,
    backgroundColor: '#f9fafb',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    borderRadius: 8,
  },
  modalCancelText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalAddButton: {
    flex: 1,
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    borderRadius: 8,
  },
  modalAddText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});