import QRScannerComponent from '@/components/QRScannerComponent';
import { ThemedView } from '@/components/ThemedView';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';

export default function ScannerScreen() {
  const handleContactAdded = (contact: any) => {
    console.log('Contact added successfully:', contact);
    // Navigate back after adding contact
    router.back();
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <QRScannerComponent 
        onContactAdded={handleContactAdded}
        onClose={handleClose}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});