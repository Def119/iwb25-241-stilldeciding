export interface WhisprContact {
  email: string;
  publicKey: string;
  displayName?: string;
  timestamp: number;
  app: string;
  version: string;
}

/**
 * Generate QR code data for sharing contact information
 */
export function generateContactQRData(email: string, publicKey: string, displayName?: string): WhisprContact {
  return {
    email,
    publicKey,
    displayName,
    timestamp: Date.now(),
    app: 'Whispr',
    version: '1.0'
  };
}

/**
 * Validate and parse QR code contact data
 */
export function parseContactQRData(qrData: string): WhisprContact | null {
  try {
    const parsed = JSON.parse(qrData);
    
    // Validate required fields
    if (!parsed.email || !parsed.publicKey || parsed.app !== 'Whispr') {
      console.error('❌ Invalid QR contact data: missing required fields');
      return null;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(parsed.email)) {
      console.error('❌ Invalid email format in QR data');
      return null;
    }
    
    // Validate public key format (should be PEM)
    if (!parsed.publicKey.includes('-----BEGIN PUBLIC KEY-----')) {
      console.error('❌ Invalid public key format in QR data');
      return null;
    }
    
    console.log('✅ Valid Whispr contact QR data parsed');
    return parsed as WhisprContact;
  } catch (error) {
    console.error('❌ Error parsing QR contact data:', error);
    return null;
  }
}

/**
 * Validate if a public key can be used for encryption
 */
export function validateContactPublicKey(publicKeyPem: string): boolean {
  try {
    const forge = require('node-forge');
    const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
    
    // Check key size (should be at least 2048 bits)
    const keySize = publicKey.n.bitLength();
    if (keySize < 2048) {
      console.error('❌ Public key too small:', keySize, 'bits');
      return false;
    }
    
    console.log('✅ Public key validated:', keySize, 'bits');
    return true;
  } catch (error) {
    console.error('❌ Error validating public key:', error);
    return false;
  }
}