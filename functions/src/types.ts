import * as admin from "firebase-admin";

// Adapty'den gelen abonelik verisi
export interface AdaptySubscription {
  is_active: boolean;
  is_in_grace_period?: boolean;
  is_refund?: boolean;
  expires_at?: string | null;
  store_product_id?: string;
}

// Adapty'den gelen erişim seviyesi verisi
export interface AdaptyAccessLevel {
  is_active: boolean;
  expires_at?: string | null;
}

// Adapty'den gelen ana profil verisi
export interface AdaptyProfileData {
  profile_id: string;
  customer_user_id?: string;
  access_levels?: Record<string, AdaptyAccessLevel>;
  subscriptions?: Record<string, AdaptySubscription>;
}

// Adapty API cevabının tam yapısı
export interface AdaptyProfileResponse {
  data: {
    data: AdaptyProfileData;
  };
}

// Firestore'da sakladığımız kullanıcı verisinin yapısı
export interface UserData {
  tier: "freemium" | "premium" | "ultra_premium";
  remainingTryOns: number;
  remainingSuggestions: number;
  remainingClothAnalysis: number;
  createdAt: admin.firestore.Timestamp | Date;
  lastSyncedWithAdapty: admin.firestore.Timestamp | Date;
}

// Kota tiplerini güvenli bir şekilde yönetmek için
export type QuotaType = "remainingTryOns" | "remainingSuggestions" | "remainingClothAnalysis";

// Firestore'a yazılacak kota verisi tipi
export type QuotaData = Omit<UserData, "createdAt" | "lastSyncedWithAdapty">;

// Swift'ten gelmesini beklediğimiz veri yapıları
export interface AnalyzeRequestData {
  adapty_user_id: string;
  image_base_64: string;
}

export interface TryOnRequestData {
  adapty_user_id: string;
  pose_image_base_64: string;
  clothing_image_base_64?: string; // Tekli kıyafet için (Geriye dönük uyumluluk)
  clothing_images_base_64?: string[]; // Çoklu kıyafet için
  model_type?: "standard" | "nano-banana-pro"; // Model seçimi
}

export interface SuggestionRequestItem {
  id: string;
  category: string;
  description: string;
}

export interface SuggestionRequestData {
  adapty_user_id: string;
  user_request: string;
  clothing_items: SuggestionRequestItem[];
}

export interface GetUserTierRequestData {
  adapty_user_id: string;
}

export interface SyncUserRequestData {
  adapty_user_id: string;
}
