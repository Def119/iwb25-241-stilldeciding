import * as SecureStore from 'expo-secure-store';
import * as forge from 'node-forge';
import 'react-native-get-random-values';

export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

/**
 * Store private key securely, handling size limitations by chunking
 */
async function storePrivateKeySecurely(privateKey: string): Promise<void> {
  try {
    // If key is too large (>2048 bytes), split it
    if (privateKey.length > 2000) {
      console.log('🔑 Large key detected, splitting for storage...');
      const chunkSize = 2000;
      const chunks = [];
      
      for (let i = 0; i < privateKey.length; i += chunkSize) {
        chunks.push(privateKey.substring(i, i + chunkSize));
      }
      
      // Store number of chunks
      await SecureStore.setItemAsync('privateKey_chunks', chunks.length.toString());
      
      // Store each chunk
      for (let i = 0; i < chunks.length; i++) {
        await SecureStore.setItemAsync(`privateKey_${i}`, chunks[i]);
      }
      
      console.log(`🔑 Private key stored in ${chunks.length} chunks`);
    } else {
      // Store normally if small enough
      await SecureStore.setItemAsync('privateKey', privateKey);
      console.log('🔑 Private key stored normally');
    }
  } catch (error) {
    console.error('❌ Error storing private key:', error);
    throw error;
  }
}

/**
 * Generate a new RSA key pair using node-forge (proper PEM ASN.1 format)
 */
export async function generateKeyPair(): Promise<KeyPair> {
  try {
    console.log('🔑 Starting RSA key generation with node-forge...');
    
    // Generate RSA key pair using node-forge
    const keypair = forge.pki.rsa.generateKeyPair(2048);
    
    // Convert to PEM format (ASN.1)
    const privateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey);
    const publicKeyPem = forge.pki.publicKeyToPem(keypair.publicKey);
    
    console.log('🔑 Keys generated successfully');
    console.log('🔑 Private key length:', privateKeyPem.length);
    console.log('🔑 Public key length:', publicKeyPem.length);
    console.log('🔑 Private key format: PEM ASN.1');
    console.log('🔑 Public key format: PEM ASN.1');
    
    // Store private key securely with chunking if needed
    await storePrivateKeySecurely(privateKeyPem);
    console.log('🔑 Keys stored successfully');
    
    return {
      publicKey: publicKeyPem,
      privateKey: privateKeyPem,
    };
  } catch (error) {
    console.error('❌ Error generating key pair:', error);
    throw new Error('Failed to generate encryption keys: ' + (error as Error).message);
  }
}

/**
 * Get stored private key, handling chunked storage
 */
export async function getPrivateKey(): Promise<string | null> {
  try {
    // First try to get normally stored key
    const normalKey = await SecureStore.getItemAsync('privateKey');
    if (normalKey) {
      console.log('🔑 Private key retrieved normally');
      return normalKey;
    }
    
    // Try to get chunked key
    const chunksCountStr = await SecureStore.getItemAsync('privateKey_chunks');
    if (chunksCountStr) {
      const chunksCount = parseInt(chunksCountStr, 10);
      console.log(`🔑 Retrieving private key from ${chunksCount} chunks...`);
      
      let fullKey = '';
      for (let i = 0; i < chunksCount; i++) {
        const chunk = await SecureStore.getItemAsync(`privateKey_${i}`);
        if (!chunk) {
          throw new Error(`Missing chunk ${i} of private key`);
        }
        fullKey += chunk;
      }
      
      console.log('🔑 Private key reconstructed from chunks');
      return fullKey;
    }
    
    console.log('🔑 Private key retrieved: Not found');
    return null;
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
    const { supabase } = await import('./supabase');
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user?.user_metadata?.public_key) {
      console.log('🔑 Public key retrieved from user metadata');
      return user.user_metadata.public_key;
    }
    
    console.log('🔑 No public key found in user metadata');
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
    const privateKey = await getPrivateKey();
    return !!privateKey;
  } catch (error) {
    console.error('❌ Error checking keys:', error);
    return false;
  }
}

/**
 * Encrypt a message using the recipient's public key (node-forge)
 */
export async function encryptMessage(message: string, publicKeyPem: string): Promise<string> {
  try {
    console.log('🔐 Encrypting message with node-forge...');
    
    // Parse the PEM public key
    const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
    
    // Encrypt the message
    const encrypted = publicKey.encrypt(message, 'RSA-OAEP');
    
    // Convert to base64 for storage/transmission
    const encryptedBase64 = forge.util.encode64(encrypted);
    
    console.log('🔐 Message encrypted successfully');
    return encryptedBase64;
  } catch (error) {
    console.error('❌ Error encrypting message:', error);
    throw new Error('Failed to encrypt message: ' + (error as Error).message);
  }
}

/**
 * Decrypt a message using the user's private key (node-forge)
 */
export async function decryptMessage(encryptedBase64: string, privateKeyPem: string): Promise<string> {
  try {
    console.log('🔓 Decrypting message with node-forge...');
    
    // Parse the PEM private key
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
    
    // Decode from base64
    const encrypted = forge.util.decode64(encryptedBase64);
    
    // Decrypt the message
    const decrypted = privateKey.decrypt(encrypted, 'RSA-OAEP');
    
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
    // Clear normal key
    await SecureStore.deleteItemAsync('privateKey');
    
    // Clear chunked key if it exists
    const chunksCountStr = await SecureStore.getItemAsync('privateKey_chunks');
    if (chunksCountStr) {
      const chunksCount = parseInt(chunksCountStr, 10);
      console.log(`🗑️ Clearing ${chunksCount} key chunks...`);
      
      // Delete chunks count
      await SecureStore.deleteItemAsync('privateKey_chunks');
      
      // Delete each chunk
      for (let i = 0; i < chunksCount; i++) {
        await SecureStore.deleteItemAsync(`privateKey_${i}`);
      }
    }
    
    console.log('🗑️ Encryption keys cleared');
  } catch (error) {
    console.error('❌ Error clearing keys:', error);
  }
}

/**
 * Validate if a string is a valid PEM key
 */
export function validatePemKey(pemKey: string, type: 'public' | 'private'): boolean {
  try {
    if (type === 'public') {
      forge.pki.publicKeyFromPem(pemKey);
    } else {
      forge.pki.privateKeyFromPem(pemKey);
    }
    return true;
  } catch (error) {
    console.error(`❌ Invalid ${type} key format:`, error);
    return false;
  }
}

/**
 * Get key information (modulus, exponent, etc.)
 */
export function getKeyInfo(privateKeyPem: string): any {
  try {
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
    const publicKey = forge.pki.rsa.setPublicKey(privateKey.n, privateKey.e);
    
    return {
      keySize: privateKey.n.bitLength(),
      modulus: privateKey.n.toString(16),
      publicExponent: privateKey.e.toString(),
      algorithm: 'RSA',
      format: 'PEM ASN.1'
    };
  } catch (error) {
    console.error('❌ Error getting key info:', error);
    return null;
  }
}
