import axios, { AxiosError } from "axios";
import { adaptySecretKey } from "../config";
import { AdaptyProfileData, AdaptyProfileResponse, QuotaData } from "../types";

/**
 * Adapty API'sinden kullanıcı profilini çeker ve doğrular.
 * @param {string} userId Kullanıcının ID'si (profile_id).
 * @return {Promise<AdaptyProfileData|null>} Adapty'deki kullanıcı profili veya null.
 */
export async function getAdaptyProfile(userId: string): Promise<AdaptyProfileData | null> {
  const apiKey = adaptySecretKey.value();
  
  console.log(`Fetching Adapty profile for user: ${userId}`);
  console.log(`Using adapty-profile-id header...`);
  
  try {
    const response = await axios.get<AdaptyProfileResponse>(
      `https://api.adapty.io/api/v2/server-side-api/profile/`,
      {
        headers: {
          "Authorization": `Api-Key ${apiKey}`,
          "adapty-profile-id": userId,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );
    
    const profile = response.data?.data?.data;
    
    console.log(`✅ Profile found!`, {
      profileId: profile?.profile_id,
      customerUserId: profile?.customer_user_id,
      hasAccessLevels: !!(profile?.access_levels && Object.keys(profile.access_levels).length > 0),
      hasSubscriptions: !!(profile?.subscriptions && Object.keys(profile.subscriptions).length > 0),
    });
    
    return profile || null;
    
  } catch (error: any) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 404) {
      console.log(`❌ User ${userId} not found in Adapty (404)`);
      return null;
    }
    
    console.error(`Adapty API error for user ${userId}:`, {
      status: axiosError.response?.status,
      data: axiosError.response?.data,
      message: error.message,
    });
    
    if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
      console.error("❌ Adapty API Key authorization failed!");
    }
    
    throw error;
  }
}

/**
 * Adapty abonelik durumuna göre kota değerlerini hesaplar.
 * @param {AdaptyProfileData} adaptyProfile Adapty'den gelen kullanıcı profili.
 * @return {QuotaData} Kullanıcının tier'ına göre kota değerleri.
 */
export function calculateQuotaFromAdapty(adaptyProfile: AdaptyProfileData): QuotaData {
  const accessLevels = adaptyProfile?.access_levels ? Object.values(adaptyProfile.access_levels) : [];
  const subscriptions = adaptyProfile?.subscriptions ? Object.values(adaptyProfile.subscriptions) : [];
  
  console.log(`Calculating quota for profile - Access Levels: ${accessLevels.length}, Subscriptions: ${subscriptions.length}`);
  
  // Aktif access level var mı kontrol et
  const hasActiveAccess = accessLevels.some(access => 
    access.is_active === true || 
    (access.expires_at === null || (access.expires_at && new Date(access.expires_at) > new Date()))
  );
  
  // Aktif subscription var mı kontrol et
  const activeSubscriptions = subscriptions.filter(sub => {
    const isActive = sub.is_active !== false;
    const notInGracePeriod = !sub.is_in_grace_period;
    const notRefunded = !sub.is_refund;
    const notExpired = !sub.expires_at || new Date(sub.expires_at) > new Date();
    
    return isActive && notInGracePeriod && notRefunded && notExpired;
  });

  if (!hasActiveAccess && activeSubscriptions.length === 0) {
    // Freemium kullanıcı - aktif abonelik/access yok
    console.log("User has no active subscriptions - freemium tier");
    return {
      tier: "freemium",
      remainingTryOns: 20,
      remainingSuggestions: 20,
      remainingClothAnalysis: 20,
    };
  }

  // Premium kullanıcı - varsayılan
  let tier: "premium" | "ultra_premium" = "premium";
  let quotas = {
    remainingTryOns: 100,
    remainingSuggestions: 100,
    remainingClothAnalysis: 100,
  };

  // Product ID'ye göre tier belirleme
  for (const sub of activeSubscriptions) {
    const productId = sub.store_product_id?.toLowerCase() || "";
    
    console.log(`Checking subscription product: ${productId}`);
    
    // Ultra premium product ID'leri kontrol et
    if (productId.includes("ultra") || productId.includes("unlimited") || productId.includes("pro")) {
      tier = "ultra_premium";
      quotas = {
        remainingTryOns: 500,
        remainingSuggestions: 500,
        remainingClothAnalysis: 500,
      };
      console.log(`Ultra premium tier detected from product: ${productId}`);
      break;
    }
  }

  console.log(`Final tier: ${tier}`);
  return {
    tier,
    ...quotas,
  };
}
