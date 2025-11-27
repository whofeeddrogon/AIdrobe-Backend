import * as admin from "firebase-admin";

// ============================================================================
// ADAPTY TYPES
// ============================================================================
// Adapty abonelik yönetimi servisinden gelen veri yapıları

export interface AdaptySubscription {
  is_active: boolean;
  is_in_grace_period?: boolean;
  is_refund?: boolean;
  expires_at?: string | null;
  store_product_id?: string;
}

export interface AdaptyAccessLevel {
  is_active: boolean;
  expires_at?: string | null;
}

export interface AdaptyProfileData {
  profile_id: string;
  customer_user_id?: string;
  access_levels?: Record<string, AdaptyAccessLevel>;
  subscriptions?: Record<string, AdaptySubscription>;
}

export interface AdaptyProfileResponse {
  data: {
    data: AdaptyProfileData;
  };
}

// ============================================================================
// USER & QUOTA TYPES
// ============================================================================
// Firestore'da saklanan kullanıcı verileri ve kota yönetimi

export interface UserData {
  tier: "freemium" | "basic" | "pro";
  remainingTryOns: number;
  remainingSuggestions: number;
  remainingClothAnalysis: number;
  createdAt: admin.firestore.Timestamp | Date;
  lastSyncedWithAdapty: admin.firestore.Timestamp | Date;
}

export type QuotaType = "remainingTryOns" | "remainingSuggestions" | "remainingClothAnalysis";

export type QuotaData = Omit<UserData, "createdAt" | "lastSyncedWithAdapty">;

// ============================================================================
// SHARED TYPES
// ============================================================================
// Birden fazla request/response'da kullanılan ortak type'lar

export interface ClothingImage {
  base64: string;
  name: string;
  description: string;
  category: string;
}

// ============================================================================
// REQUEST TYPES
// ============================================================================
// Client'tan (Swift/iOS) gelen request veri yapıları

export interface AnalyzeRequestData {
  uuid: string;
  image_base_64: string;
}

export interface TryOnRequestData {
  uuid: string;
  pose_image_base_64: string;
  clothing_items: ClothingImage[];
  model_type?: "standard" | "nano-banana-pro";
}

export interface SuggestionRequestData {
  uuid: string;
  user_request: string;
  temperature?: number;
  useRandomModel?: boolean;
}

export interface GetUserTierRequestData {
  uuid: string;
}

export interface SyncUserRequestData {
  uuid: string;
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================
// Backend'den client'a dönen response veri yapıları

export interface AnalyzeClothingImageResponse {
  category: string;
  description: string;
  name: string;
  image_url: string;
  new_quota: number;
}

export interface VirtualTryOnResponse {
  name: string;
  description: string;
  category: string;
  result_image_url: string;
  new_quota: number;
}

export interface OutfitRecommendationItem {
  id: string;
  name: string;
  category: string;
}

export interface GetOutfitSuggestionResponse {
  recommendation?: string[];
  description?: string;
  category?: string;
  name?: string;
  [key: string]: any; // LLM'den gelen diğer alanlar için
  new_quota: number;
}

export interface GetUserInfoResponse extends UserData {}

export interface SyncUserWithAdaptyResponse {
  tier: "freemium" | "basic" | "pro";
  remainingTryOns: number;
  remainingSuggestions: number;
  remainingClothAnalysis: number;
  lastSyncedWithAdapty: admin.firestore.Timestamp | Date;
}

export interface InitializeUserResponse {
  success: boolean;
  user: UserData;
}

export interface AdaptyWebhookResponse {
  status: "success" | "ignored" | "profile_not_found";
  tier?: "freemium" | "basic" | "pro";
  reason?: string;
  event_type?: string;
  profile_id?: string;
}
