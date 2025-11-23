import * as functions from "firebase-functions/v1";
import { defineSecret } from "firebase-functions/params";
import * as admin from "firebase-admin";

// --- Güvenli Anahtar Tanımlamaları ---
export const falKey = defineSecret("FAL_KEY");
export const adaptySecretKey = defineSecret("ADAPTY_SECRET_KEY");

// --- Firebase Servis Başlatma ---
if (admin.apps.length === 0) {
  admin.initializeApp();
}
export const db = admin.firestore();

// Fonksiyonlar için ortak çalışma zamanı ayarları
export const runtimeOptions: functions.RuntimeOptions = {
  timeoutSeconds: 180, // 3 dakika timeout
  secrets: [falKey, adaptySecretKey],
};
