import * as SecureStore from 'expo-secure-store';
import 'react-native-get-random-values';
import { RSA } from 'react-native-rsa-native';

export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

/**
 * Generate a new RSA key pair for end-to-end encryption
 */
export async function generateKeyPair(): Promise<KeyPair> {
  try {
    console.log('🔑 Starting key generation...');
    const keys = await RSA.generateKeys(2048);
    
    // Store private key securely
    await SecureStore.setItemAsync('privateKey', keys.private);
    console.log('🔑 Keys generated and stored successfully');
    
    return {
      publicKey: keys.public,
      privateKey: keys.private,
    };
  } catch (error) {
    console.error('❌ Error generating key pair:', error);
    throw new Error('Failed to generate encryption keys: ' + (error as Error).message);
  }
}

/**
 * Get stored private key
 */
export async function getPrivateKey(): Promise<string | null> {
  try {
    const privateKey = await SecureStore.getItemAsync('privateKey');
    console.log('🔑 Private key retrieved:', privateKey ? 'Found' : 'Not found');
    return privateKey;
  } catch (error) {
    console.error('❌ Error retrieving private key:', error);
    return null;
  }
}

/**
 * Get stored public key from user metadata
 */
export async function getPublicKey(): Promise<string | null> {
  try {
    // This would typically come from user metadata in Supabase
    // For now, we'll return null and let the profile show the status
    return null;
  } catch (error) {
    console.error('❌ Error retrieving public key:', error);
    return null;
  }
}

/**
 * Check if keys exist
 */
export async function hasKeys(): Promise<boolean> {
  try {
    const privateKey = await SecureStore.getItemAsync('privateKey');
    return !!privateKey;
  } catch (error) {
    console.error('❌ Error checking keys:', error);
    return false;
  }
}

/**
 * Encrypt a message using the recipient's public key
 */
export async function encryptMessage(message: string, publicKey: string): Promise<string> {
  try {
    console.log('🔐 Encrypting message...');
    const encrypted = await RSA.encrypt(message, publicKey);
    console.log('🔐 Message encrypted successfully');
    return encrypted;
  } catch (error) {
    console.error('❌ Error encrypting message:', error);
    throw new Error('Failed to encrypt message: ' + (error as Error).message);
  }
}

/**
 * Decrypt a message using the user's private key
 */
export async function decryptMessage(encryptedMessage: string, privateKey: string): Promise<string> {
  try {
    console.log('🔓 Decrypting message...');
    const decrypted = await RSA.decrypt(encryptedMessage, privateKey);
    console.log('🔓 Message decrypted successfully');
    return decrypted;
  } catch (error) {
    console.error('❌ Error decrypting message:', error);
    throw new Error('Failed to decrypt message: ' + (error as Error).message);
  }
}

/**
 * Clear all stored keys (for logout)
 */
export async function clearKeys(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync('privateKey');
    console.log('🗑️ Encryption keys cleared');
  } catch (error) {
    console.error('❌ Error clearing keys:', error);
  }
}
