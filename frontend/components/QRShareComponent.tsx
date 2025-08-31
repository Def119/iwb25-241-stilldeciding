import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';
import { getPublicKey } from '@/lib/crypto-forge';
import { generateContactQRData, type WhisprContact } from '@/lib/qr-contact';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

interface QRShareComponentProps {
  style?: any;
}

export default function QRShareComponent({ style }: QRShareComponentProps) {
  const { user } = useAuth();
  const [qrData, setQrData] = useState<string>('');
  const [contactData, setContactData] = useState<WhisprContact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    generateQRData();
  }, [user]);

  const generateQRData = async () => {
    try {
      setLoading(true);
      setError('');

      if (!user?.email) {
        setError('No user email found');
        return;
      }

      // Get user's public key
      const publicKey = await getPublicKey();
      if (!publicKey) {
        setError('No public key found - please generate keys first');
        return;
      }

      // Generate contact data
      const contact = generateContactQRData(
        user.email,
        publicKey,
        user.user_metadata?.display_name
      );

      setContactData(contact);
      setQrData(JSON.stringify(contact));

      console.log('✅ QR data generated successfully');
    } catch (err) {
      console.error('❌ Error generating QR data:', err);
      setError(`Error: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!contactData) {
      Alert.alert('Error', 'No contact data available to share');
      return;
    }

    try {
      const shareContent = `🔐 Whispr Contact Share

📧 Email: ${contactData.email}
👤 Name: ${contactData.displayName || 'Not set'}
🔑 Public Key: Included for E2E encryption
📱 App: ${contactData.app} v${contactData.version}
🕒 Generated: ${new Date(contactData.timestamp).toLocaleString()}

Add me on Whispr for secure messaging!

Contact Data (JSON):
${JSON.stringify(contactData, null, 2)}`;

      if (Platform.OS === 'web') {
        // Web: Copy to clipboard
        await navigator.clipboard.writeText(shareContent);
        Alert.alert('Success', 'Contact info copied to clipboard!');
      } else {
        // Mobile: Share
        await Sharing.shareAsync('data:text/plain;base64,' + btoa(shareContent), {
          mimeType: 'text/plain',
          dialogTitle: 'Share Whispr Contact'
        });
      }
    } catch (error) {
      console.error('❌ Error sharing contact:', error);
      Alert.alert('Error', 'Failed to share contact info');
    }
  };

  const handleSaveQR = async () => {
    if (!qrData) {
      Alert.alert('Error', 'No QR data available');
      return;
    }

    try {
      // Create QR code as SVG and save
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `whispr-qr-${timestamp}.txt`;
      const fileUri = FileSystem.documentDirectory + filename;

      const qrContent = `Whispr QR Contact Code
Generated: ${new Date().toLocaleString()}
Email: ${user?.email}

Scan this QR code with Whispr to add me as a contact:

${qrData}`;

      await FileSystem.writeAsStringAsync(fileUri, qrContent);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/plain',
          dialogTitle: 'Save Whispr QR Code'
        });
      } else {
        Alert.alert('QR Saved', `QR code saved to: ${filename}`);
      }
    } catch (error) {
      console.error('❌ Error saving QR:', error);
      Alert.alert('Error', 'Failed to save QR code');
    }
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, style]}>
        <ThemedText style={styles.loadingText}>🔄 Generating QR code...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={[styles.container, style]}>
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>❌ {error}</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={generateQRData}>
            <ThemedText style={styles.retryText}>🔄 Retry</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, style]}>
      <ThemedText style={styles.title}>Share Your Contact</ThemedText>
      <ThemedText style={styles.description}>
        Let others scan this QR code to add you securely
      </ThemedText>

      {qrData ? (
        <View style={styles.qrContainer}>
          <View style={styles.qrWrapper}>
            <QRCode
              value={qrData}
              size={220}
              backgroundColor="white"
              color="black"
              logoSize={30}
              logoBackgroundColor="transparent"
            />
          </View>

          <View style={styles.contactInfo}>
            <ThemedText style={styles.email}>📧 {user?.email}</ThemedText>
            <ThemedText style={styles.encryption}>🔐 E2E Encryption Ready</ThemedText>
            <ThemedText style={styles.timestamp}>
              🕒 {new Date().toLocaleString()}
            </ThemedText>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <ThemedText style={styles.buttonText}>📤 Share Contact</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveQR}>
              <ThemedText style={styles.buttonText}>💾 Save QR</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.refreshButton} onPress={generateQRData}>
              <ThemedText style={styles.buttonText}>🔄 Refresh</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.placeholder}>
          <ThemedText style={styles.placeholderText}>
            No QR code available
          </ThemedText>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    color: '#6366f1',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.7,
    lineHeight: 20,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    padding: 40,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  qrContainer: {
    alignItems: 'center',
    width: '100%',
  },
  qrWrapper: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20,
  },
  contactInfo: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    width: '100%',
  },
  email: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  encryption: {
    fontSize: 12,
    color: '#059669',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 11,
    opacity: 0.6,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  shareButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
  },
  saveButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
  },
  refreshButton: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  placeholder: {
    backgroundColor: '#f3f4f6',
    padding: 40,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});