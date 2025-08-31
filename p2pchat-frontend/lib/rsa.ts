// Mobile app crypto service client
export class CryptoService {
  private baseUrl = 'http://your-server:9095/crypto';

  async generateKeyPair(userId: string, keySize: number = 2048): Promise<KeyPair> {
    try {
      const response = await fetch(`${this.baseUrl}/generate-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          keySize,
          algorithm: 'RSA'
        }),
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Key generation failed');
      }

      // Store private key securely on device
      await this.storePrivateKeySecurely(result.keyPair.privateKey);
      
      return result.keyPair;
    } catch (error) {
      console.error('❌ Error generating keys:', error);
      throw error;
    }
  }

  async getPublicKey(userId: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/public-key/${userId}`);
      const result = await response.json();
      
      return result.success ? result.publicKey : null;
    } catch (error) {
      console.error('❌ Error fetching public key:', error);
      return null;
    }
  }

  async encryptMessage(message: string, publicKey: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/encrypt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          publicKey
        }),
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Encryption failed');
      }

      return result.encryptedMessage;
    } catch (error) {
      console.error('❌ Error encrypting message:', error);
      throw error;
    }
  }

  async decryptMessage(encryptedMessage: string): Promise<string> {
    try {
      const privateKey = await this.getPrivateKey();
      if (!privateKey) {
        throw new Error('Private key not found');
      }

      const response = await fetch(`${this.baseUrl}/decrypt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          encryptedMessage,
          privateKey
        }),
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Decryption failed');
      }

      return result.decryptedMessage;
    } catch (error) {
      console.error('❌ Error decrypting message:', error);
      throw error;
    }
  }

  // Keep your existing secure storage methods
  private async storePrivateKeySecurely(privateKey: string): Promise<void> {
    // Your existing chunked storage logic
  }

  private async getPrivateKey(): Promise<string | null> {
    // Your existing retrieval logic
  }
}