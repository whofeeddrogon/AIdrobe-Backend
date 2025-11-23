import * as functions from "firebase-functions/v1";
import { db, adaptySecretKey } from "../config";
import { UserData, SyncUserRequestData } from "../types";
import { getAdaptyProfile, calculateQuotaFromAdapty } from "../utils/adapty";

/**
 * 5. KULLANICI BİLGİLERİNİ GETİR
 */
export const getUserInfo = functions
    .runWith({secrets: [adaptySecretKey]})
    .https.onCall(async (payload: any, context: functions.https.CallableContext) => {
      
      const data = payload.data || payload;
      const { adapty_user_id } = data;

      if (!adapty_user_id) {
        throw new functions.https.HttpsError("invalid-argument", "Gerekli parametreler eksik (adapty_user_id).");
      }

      try {
        console.log(`User bilgisi isteniyor - User: ${adapty_user_id}`);
        
        const userRef = db.collection("users").doc(adapty_user_id);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
          console.log(`User ${adapty_user_id} bulunamadı.`);
          // Artık otomatik oluşturmuyoruz, null veya hata dönebiliriz.
          // Frontend'in bunu handle etmesi gerekecek.
          throw new functions.https.HttpsError("not-found", "Kullanıcı bulunamadı.");
        }

        const userData = userDoc.data() as UserData;
        console.log(`User bilgisi döndürülüyor - User: ${adapty_user_id}, Tier: ${userData.tier}`);
        return userData;

      } catch (error: any) {
        console.error(`getUserInfo hatası - User: ${adapty_user_id}:`, error);
        if (error.code === "not-found") throw error;
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

/**
 * 6. GÜVENLİ KULLANICI BAŞLATMA (ONBOARDING SONRASI)
 * Client sadece UID gönderir, Tier bilgisini Adapty'den biz çekeriz.
 */
export const initializeUser = functions
    .runWith({secrets: [adaptySecretKey]})
    .https.onCall(async (payload: any, context: functions.https.CallableContext) => {
      const { uid, email } = payload.data || payload;

      if (!uid) {
        throw new functions.https.HttpsError("invalid-argument", "Gerekli parametreler eksik (uid).");
      }

      try {
        console.log(`Kullanıcı başlatılıyor (Secure Init) - User: ${uid}`);

        // 1. Adapty'den gerçek durumu sorgula
        const adaptyProfile = await getAdaptyProfile(uid);
        
        // Eğer kullanıcı Adapty'de henüz yoksa (çok nadir), Freemium olarak varsay
        let quotas;
        if (adaptyProfile) {
           quotas = calculateQuotaFromAdapty(adaptyProfile);
        } else {
           console.log("Adapty profili bulunamadı, Freemium varsayılıyor.");
           quotas = {
             tier: "freemium",
             remainingTryOns: 20,
             remainingSuggestions: 20,
             remainingClothAnalysis: 20,
           };
        }

        // 2. DB Kaydını Oluştur/Güncelle
        const userRef = db.collection("users").doc(uid);
        const userDoc = await userRef.get();

        const userData: UserData = {
          tier: quotas.tier as "freemium" | "premium" | "ultra_premium",
          remainingTryOns: quotas.remainingTryOns,
          remainingSuggestions: quotas.remainingSuggestions,
          remainingClothAnalysis: quotas.remainingClothAnalysis,
          createdAt: userDoc.exists ? (userDoc.data()?.createdAt || new Date()) : new Date(),
          lastSyncedWithAdapty: new Date(),
          email: email || (userDoc.exists ? userDoc.data()?.email : null)
        };

        await userRef.set(userData, { merge: true });
        console.log(`Kullanıcı güvenli şekilde başlatıldı: ${uid} - Tier: ${userData.tier}`);
        
        return { success: true, user: userData };

      } catch (error: any) {
        console.error(`initializeUser hatası - User: ${uid}:`, error);
        throw new functions.https.HttpsError("internal", "Kullanıcı başlatılırken hata oluştu.");
      }
    });
