
import { db } from "@/integrations/firebase/client";
import { doc, setDoc, getDoc, updateDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  is_pro: boolean;
  plan_type: 'free' | 'pro' | 'premium';
  plan_period?: string;
  plan_expires_at?: string;
  created_at: string;
  updated_at: string;
  usage_count: number;
  usage_limit: number;
}

export interface CarouselData {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  layout_type: string;
  content?: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface GeneratedTextRecord {
  id: string;
  user_id: string;
  agent: string;
  texts: Array<{ id: number; text: string }>;
  form_data: any;
  created_at: string;
  updated_at: string;
}

export const createUserProfile = async (userData: {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}) => {
  try {
    const userProfile: UserProfile = {
      uid: userData.uid,
      email: userData.email,
      displayName: userData.displayName || '',
      photoURL: userData.photoURL || '',
      is_pro: false,
      plan_type: 'free',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      usage_count: 0,
      usage_limit: 10 // Limite para usuários gratuitos
    };

    await setDoc(doc(db, "users", userData.uid), userProfile);
    console.log("Perfil do usuário criado:", userData.uid);
    return userProfile;
  } catch (error) {
    console.error("Erro ao criar perfil do usuário:", error);
    throw error;
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Erro ao buscar perfil do usuário:", error);
    return null;
  }
};

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>) => {
  try {
    await updateDoc(doc(db, "users", uid), {
      ...updates,
      updated_at: new Date().toISOString()
    });
    console.log("Perfil do usuário atualizado:", uid);
  } catch (error) {
    console.error("Erro ao atualizar perfil do usuário:", error);
    throw error;
  }
};

export const upgradeUserToPro = async (uid: string, planType: 'pro' | 'premium', period: string) => {
  try {
    const expiresAt = new Date();
    if (period === 'monthly') {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else if (period === 'yearly') {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    await updateDoc(doc(db, "users", uid), {
      is_pro: true,
      plan_type: planType,
      plan_period: period,
      plan_expires_at: expiresAt.toISOString(),
      usage_limit: planType === 'pro' ? 100 : 500, // Aumentar limites para usuários Pro
      updated_at: new Date().toISOString()
    });

    console.log(`Usuário ${uid} atualizado para plano ${planType}`);
  } catch (error) {
    console.error("Erro ao atualizar plano do usuário:", error);
    throw error;
  }
};

export const incrementUserUsage = async (uid: string) => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      const currentUsage = userDoc.data().usage_count || 0;
      await updateDoc(doc(db, "users", uid), {
        usage_count: currentUsage + 1,
        updated_at: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error("Erro ao incrementar uso do usuário:", error);
  }
};

export const saveCarouselToFirestore = async (carouselData: Omit<CarouselData, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    const carouselRef = await addDoc(collection(db, "carousels"), {
      ...carouselData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    console.log("Carrossel salvo no Firestore:", carouselRef.id);
    return carouselRef.id;
  } catch (error) {
    console.error("Erro ao salvar carrossel:", error);
    throw error;
  }
};

export const saveImageToFirestore = async (imageData: {
  user_id: string;
  carousel_id?: string;
  image_url: string;
  image_name: string;
  image_size: number;
  mime_type: string;
}) => {
  try {
    const imageRef = await addDoc(collection(db, "images"), {
      ...imageData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    console.log("Imagem salva no Firestore:", imageRef.id);
    return imageRef.id;
  } catch (error) {
    console.error("Erro ao salvar imagem:", error);
    throw error;
  }
};
