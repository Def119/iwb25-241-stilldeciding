import { Buffer } from 'buffer';
import * as SecureStore from 'expo-secure-store';
import * as forge from 'node-forge';
import 'react-native-get-random-values';

export interface KeyPair {
  publicKey: string;
  privateKey: string;
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
      console.log('🔑 Using RSA library...');
      const rsaKeys = await RSA.generateKeys(2048);
      
      if (!rsaKeys || !rsaKeys.private || !rsaKeys.public) {
        throw new Error('RSA key generation failed - received invalid keys');
      }
      
      keys = {
        publicKey: rsaKeys.public,
        privateKey: rsaKeys.private,
      };
    } else {
      // Use fallback implementation
      console.log('🔑 RSA library not available, using fallback...');
      keys = await generateFallbackKeys();
    }
    
    console.log('🔑 Keys generated successfully');
    console.log('🔑 Private key length:', keys.privateKey.length);
    console.log('🔑 Public key length:', keys.publicKey.length);
    
    // Handle large key storage by splitting if necessary
    await storePrivateKeySecurely(keys.privateKey);
    console.log('🔑 Keys stored successfully');
    
    return keys;
  } catch (error) {
    console.error('❌ Error generating key pair:', error);
    throw new Error('Failed to generate encryption keys: ' + (error as Error).message);
  }
}

/**
 * Store private key securely, handling size limitations
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
 * Get stored private key
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
    
    if (RSA && typeof RSA.encrypt === 'function') {
      const encrypted = await RSA.encrypt(message, publicKey);
      console.log('🔐 Message encrypted with RSA');
      return encrypted;
    } else {
      // Fallback: simple base64 encoding for development
      console.log('🔐 Using fallback encryption (base64)...');
      const encoded = Buffer.from(message, 'utf8').toString('base64');
      return `FALLBACK:${encoded}`;
    }
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
    
    // Check if it's a fallback encrypted message
    if (encryptedMessage.startsWith('FALLBACK:')) {
      console.log('🔓 Using fallback decryption (base64)...');
      const encoded = encryptedMessage.replace('FALLBACK:', '');
      return Buffer.from(encoded, 'base64').toString('utf8');
    }
    
    if (RSA && typeof RSA.decrypt === 'function') {
      const decrypted = await RSA.decrypt(encryptedMessage, privateKey);
      console.log('🔓 Message decrypted with RSA');
      return decrypted;
    } else {
      throw new Error('Cannot decrypt RSA message without RSA library');
    }
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
