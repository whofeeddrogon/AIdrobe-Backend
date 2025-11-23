/**
 * Bu dosya, Gardırop AI uygulamasının tüm backend mantığını içerir.
 * TypeScript kullanılarak, tüm fonksiyonlar tip-güvenli (type-safe) hale getirilmiştir.
 */

// Controller'ları dışa aktar
export { analyzeClothingImage } from "./controllers/analyze";
export { virtualTryOn } from "./controllers/tryon";
export { getOutfitSuggestion } from "./controllers/suggestion";
export { getUserTier, syncUserWithAdapty } from "./controllers/user";
export { adaptyWebhook } from "./controllers/webhook";
