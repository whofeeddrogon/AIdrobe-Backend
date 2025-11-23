import * as functions from "firebase-functions/v1";
import { db, adaptySecretKey } from "../config";
import { createNewUser } from "../utils/quota";
import { getAdaptyProfile, calculateQuotaFromAdapty } from "../utils/adapty";
import { GetUserTierRequestData, SyncUserRequestData, UserData } from "../types";

/**
 * 4. KULLANICI TIER BİLGİSİ
 */
export const getUserTier = functions
    .runWith({secrets: [adaptySecretKey]})
    .https.onCall(async (payload: any, context: functions.https.CallableContext) => {
      
      const data: GetUserTierRequestData = payload.data || payload;
      const { adapty_user_id } = data;

      if (!adapty_user_id) {
        throw new functions.https.HttpsError("invalid-argument", "Gerekli parametreler eksik (adapty_user_id).");
      }

      try {
        console.log(`User tier bilgisi isteniyor - User: ${adapty_user_id}`);
        
        const userRef = db.collection("users").doc(adapty_user_id);
        const userDoc = await userRef.get();
        
        let userData: UserData;
        
        if (!userDoc.exists) {
          console.log(`User ${adapty_user_id} bulunamadı, yeni kullanıcı oluşturuluyor...`);
          userData = await createNewUser(adapty_user_id);
        } else {
          userData = userDoc.data() as UserData;
        }

        console.log(`User bilgisi döndürülüyor - User: ${adapty_user_id}, Tier: ${userData.tier}`);
        return userData;

      } catch (error: any) {
        console.error(`getUserTier hatası - User: ${adapty_user_id}:`, error);
        if (error.code === "permission-denied") throw error;
        throw new functions.https.HttpsError("internal", "Kullanıcı bilgileri alınırken bir hata oluştu.");
      }
    });

/**
 * 5. ADAPTY İLE SENKRONİZASYON
 */
export const syncUserWithAdapty = functions
    .runWith({secrets: [adaptySecretKey]})
    .https.onCall(async (payload: any, context: functions.https.CallableContext) => {
      
      const data: SyncUserRequestData = payload.data || payload;
      const { adapty_user_id } = data;

      if (!adapty_user_id) {
        throw new functions.https.HttpsError("invalid-argument", "Gerekli parametreler eksik (adapty_user_id).");
      }

      try {
        console.log(`Adapty senkronizasyonu başlatılıyor - User: ${adapty_user_id}`);
        
        const adaptyProfile = await getAdaptyProfile(adapty_user_id);
        
        if (!adaptyProfile) {
          throw new functions.https.HttpsError("not-found", "Kullanıcı Adapty'de bulunamadı.");
        }

        const newQuotas = calculateQuotaFromAdapty(adaptyProfile);
        
        const userRef = db.collection("users").doc(adapty_user_id);
        
        const userDataToSet: Partial<UserData> = {
          ...newQuotas,
          lastSyncedWithAdapty: new Date(),
        };
        
        // set(..., {merge: true}) = Varsa güncelle, yoksa oluştur.
        // Oluşturma sırasında createdAt alanı da eklenmeli
        if (!(await userRef.get()).exists) {
          userDataToSet.createdAt = new Date();
        }

        await userRef.set(userDataToSet, { merge: true }); 
        
        console.log(`User ${adapty_user_id} synced successfully with tier: ${newQuotas.tier}`);
        
        // Güncellenmiş veriyi döndür
        const updatedData = (await userRef.get()).data() as UserData;
        return {
          tier: updatedData.tier,
          remainingTryOns: updatedData.remainingTryOns,
          remainingSuggestions: updatedData.remainingSuggestions,
          remainingClothAnalysis: updatedData.remainingClothAnalysis,
          lastSyncedWithAdapty: updatedData.lastSyncedWithAdapty,
        };

      } catch (error: any) {
        console.error(`syncUserWithAdapty hatası - User: ${adapty_user_id}:`, error);
        
        if (error.code === "not-found") {
          throw error;
        }
        
        throw new functions.https.HttpsError("internal", "Adapty senkronizasyonu sırasında bir hata oluştu.");
      }
    });
