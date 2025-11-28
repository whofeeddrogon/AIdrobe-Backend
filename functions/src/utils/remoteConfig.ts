import * as admin from "firebase-admin";

// Basit bir in-memory cache yapısı
interface CacheEntry {
  value: any;
  timestamp: number;
}

const cache: Record<string, CacheEntry> = {};
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 saat (İsteğe göre düşürülebilir)

/**
 * Firebase Remote Config'den bir parametre değerini getirir.
 * Performans için sonucu belirli bir süre (CACHE_DURATION_MS) önbellekte tutar.
 * 
 * @param key Remote Config parametre anahtarı (örn: "clothing_analysis_prompt")
 * @param defaultValue Eğer değer bulunamazsa veya hata olursa dönecek varsayılan değer
 * @returns Parametre değeri (string)
 */
export async function getRemoteConfigValue(key: string, defaultValue: string): Promise<string> {
  const now = Date.now();
  const cachedItem = cache[key];

  // 1. Cache kontrolü: Varsa ve süresi dolmamışsa direkt döndür
  if (cachedItem && (now - cachedItem.timestamp < CACHE_DURATION_MS)) {
    console.log(`Remote Config (Cache): ${key} getirildi.`);
    return cachedItem.value as string;
  }

  try {
    // 2. Cache yoksa veya süresi dolmuşsa Remote Config'den çek
    console.log(`Remote Config (Network): ${key} isteniyor...`);
    
    const remoteConfig = admin.remoteConfig();
    const template = await remoteConfig.getTemplate();
    
    const parameter = template.parameters[key];
    
    let value = defaultValue;

    if (parameter && parameter.defaultValue) {
      // defaultValue bir obje olabilir { value: "..." } veya direkt değer
      const valObj = parameter.defaultValue as any;
      if (valObj.value) {
        value = valObj.value;
      }
    }

    // 3. Yeni değeri cache'e kaydet
    cache[key] = {
      value: value,
      timestamp: now
    };

    return value;

  } catch (error) {
    console.error(`Remote Config hatası (${key}):`, error);
    // Hata durumunda cache'deki eski değeri (varsa) veya varsayılanı döndür
    return cachedItem ? cachedItem.value : defaultValue;
  }
}
