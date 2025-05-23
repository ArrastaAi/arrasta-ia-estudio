import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, firestore } from "@/integrations/firebase/client";
import { useToast } from "@/hooks/use-toast";
import { FirebaseUserProfile } from "@/types/firebase.types";

interface FirebaseAuthContextProps {
  user: User | null;
  loading: boolean;
  profile: FirebaseUserProfile | null;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextProps | undefined>(undefined);

export const FirebaseAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<FirebaseUserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  // Função para carregar o perfil do usuário a partir do Firestore
  const loadUserProfile = async (userId: string) => {
    try {
      const userProfileRef = doc(firestore, 'profiles', userId);
      const userProfileSnap = await getDoc(userProfileRef);
      
      if (userProfileSnap.exists()) {
        const profileData = userProfileSnap.data() as FirebaseUserProfile;
        setProfile(profileData);
        setIsAdmin(profileData.is_admin || false);
      } else {
        console.log("Perfil de usuário não encontrado");
        setProfile(null);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
      setProfile(null);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    // Configurar o listener para mudanças de estado de autenticação
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        loadUserProfile(currentUser.uid);
      } else {
        setProfile(null);
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta ao ArrastaAí",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao fazer login",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      setLoading(true);
      
      // Criar o usuário no Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
      
      // Atualizar o perfil do usuário com o nome de usuário
      await updateProfile(newUser, {
        displayName: username
      });
      
      // Criar o perfil do usuário no Firestore
      const userProfile: FirebaseUserProfile = {
        id: newUser.uid,
        username: username,
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_admin: false
      };
      
      await setDoc(doc(firestore, 'profiles', newUser.uid), userProfile);
      
      toast({
        title: "Conta criada com sucesso!",
        description: "Bem-vindo ao ArrastaAí",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao criar conta",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await firebaseSignOut(auth);
      toast({
        title: "Logout realizado com sucesso",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao fazer logout",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <FirebaseAuthContext.Provider value={{ 
      user, 
      loading, 
      profile, 
      isAdmin, 
      signIn, 
      signUp, 
      signOut 
    }}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};

export const useFirebaseAuth = () => {
  const context = useContext(FirebaseAuthContext);
  if (context === undefined) {
    throw new Error("useFirebaseAuth must be used within a FirebaseAuthProvider");
  }
  return context;
};
