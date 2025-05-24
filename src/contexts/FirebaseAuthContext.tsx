
import React, { createContext, useState, useEffect, useContext } from 'react';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  User
} from "firebase/auth";
import { auth } from '@/integrations/firebase/client';

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username?: string) => Promise<void>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const FirebaseAuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useFirebaseAuth = () => {
  const context = useContext(FirebaseAuthContext);
  if (!context) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
};

export const FirebaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // Verificar se é admin
        const adminEmail = "ricoandrade01@gmail.com";
        setIsAdmin(firebaseUser.email === adminEmail);
        
        // Criar ou atualizar perfil do usuário no Firestore
        try {
          const { createUserProfile, getUserProfile } = await import("@/services/firebaseUserService");
          
          const existingProfile = await getUserProfile(firebaseUser.uid);
          if (!existingProfile) {
            await createUserProfile({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || '',
              photoURL: firebaseUser.photoURL || ''
            });
          }
        } catch (error) {
          console.error("Erro ao criar/atualizar perfil do usuário:", error);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error("Login failed:", error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    await login(email, password);
  };

  const signUp = async (email: string, password: string, username?: string) => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Criar perfil do usuário no Firestore
      const { createUserProfile } = await import("@/services/firebaseUserService");
      await createUserProfile({
        uid: userCredential.user.uid,
        email: email,
        displayName: username || '',
        photoURL: ''
      });
      
    } catch (error: any) {
      console.error("Signup failed:", error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
    } catch (error: any) {
      console.error("Logout failed:", error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOutFunc = async () => {
    await logout();
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error("Reset password failed:", error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    isAdmin,
    login,
    signIn,
    signUp,
    logout,
    signOut: signOutFunc,
    resetPassword
  };

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};
