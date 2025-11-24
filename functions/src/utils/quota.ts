import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import { db } from "../config";
import { UserData, QuotaType } from "../types";
import { getAdaptyProfile, calculateQuotaFromAdapty } from "./adapty";

/**
 * Firestore'da yeni bir kullanıcı profili oluşturur.
 * Önce Adapty'de kullanıcının gerçekten var olup olmadığını doğrular.
 */
export async function createNewUser(userId: string): Promise<UserData> {
  console.log(`Yeni kullanıcı oluşturuluyor: ${userId}`);
  
  const adaptyProfile = await getAdaptyProfile(userId);
  if (!adaptyProfile) {
    console.error(`User ${userId} does not exist in Adapty - blocking creation`);
    throw new functions.https.HttpsError(
      "permission-denied", 
      "Geçersiz kullanıcı. Lütfen uygulamaya giriş yaptığınızdan emin olun."
    );
  }

  console.log(`User ${userId} verified in Adapty, creating Firebase user...`);
  
  const quotaLimits = calculateQuotaFromAdapty(adaptyProfile);
  
  const userData: UserData = {
    ...quotaLimits,
    createdAt: new Date(),
    lastSyncedWithAdapty: new Date(),
  };
  
  await db.collection("users").doc(userId).set(userData);
  console.log(`User ${userId} created with tier: ${userData.tier}`);
  return userData;
}

/**
 * Kullanıcının belirli bir eylem için kotasını kontrol eder ve günceller.
 * @param userId Kullanıcı ID
 * @param quotaType Kota tipi (remainingTryOns, remainingOutfitAnalysis, remainingOutfitSuggestions)
 * @param amount Düşülecek miktar (varsayılan: 1)
 */
export async function checkOrUpdateQuota(userId: string, quotaType: QuotaType, amount: number = 1): Promise<void> {
  try {
    console.log(`Checking quota for user: ${userId}, quotaType: ${quotaType}, amount: ${amount}`);
    
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();
    
    let userData: UserData;
    
    if (!userDoc.exists) {
      console.log(`User ${userId} does not exist, creating new user...`);
      userData = await createNewUser(userId);
      console.log(`New user created successfully for ${userId}`);
    } else {
      userData = userDoc.data() as UserData;
      console.log(`Existing user found: ${userId}, current ${quotaType}: ${userData[quotaType]}`);
    }

    const quotaValue = userData[quotaType];
    // Kota kontrolü
    if (quotaValue === undefined || quotaValue < amount) {
      console.log(`Quota exhausted for user ${userId}, ${quotaType}: ${quotaValue ?? 'undefined'}, required: ${amount}`);
      throw new functions.https.HttpsError("resource-exhausted", `Bu işlem için yeterli hakkınız yok. Gerekli: ${amount}, Mevcut: ${quotaValue ?? 0}`);
    }

    // Kullanıcının kota hakkını düşür
    await userRef.update({
      [quotaType]: admin.firestore.FieldValue.increment(-amount),
    });
    
    console.log(`Quota updated successfully for user ${userId}, decremented ${quotaType} by ${amount}`);
    
  } catch (error: any) {
    if (error.code === "resource-exhausted" || error.code === "permission-denied") {
      throw error; // Kota veya izin hatalarını doğrudan geçir
    }
    
    console.error(`Error in checkOrUpdateQuota for user ${userId}:`, error);
    throw new functions.https.HttpsError("internal", "Kullanıcı kota kontrolünde hata oluştu.");
  }
}
