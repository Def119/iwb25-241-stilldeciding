import { Session, User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { clearKeys, generateKeyPair } from '../lib/crypto-forge';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Generate keys on first sign in if no keys exist
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          // Check if user already has a public key
          const hasPublicKey = session.user.user_metadata?.public_key;
          console.log('🔑 User public key exists:', !!hasPublicKey);
          
          if (!hasPublicKey) {
            console.log('🔑 Generating new key pair for user...');
            const keyPair = await generateKeyPair();
            
            // Store public key in user metadata
            const { error: updateError } = await supabase.auth.updateUser({
              data: {
                public_key: keyPair.publicKey,
              },
            });
            
            if (updateError) {
              console.error('❌ Error updating user metadata:', updateError);
            } else {
              console.log('✅ Public key stored in user metadata');
            }
          }
        } catch (error) {
          console.error('❌ Error generating/storing keys:', error);
          // Don't throw error here as it would prevent login
        }
      }

      // Clear keys on sign out
      if (event === 'SIGNED_OUT') {
        await clearKeys();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
