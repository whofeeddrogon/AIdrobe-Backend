# **AIdrobe Master Dokümantasyonu**

Versiyon: 2.1.0 (Güncel Backend Mimarisi)  
Tarih: 24 Kasım 2025  
Özet: AIdrobe, yapay zeka destekli sanal stilistinizdir. Gardırobunu dijitalleştirir, kişiselleştirilmiş kombinler önerir ve gelişmiş sanal deneme teknolojisi ile kıyafetleri üzerinizde görmenizi sağlar.

## **1. Ürün Vizyonu ve Özellikleri**

### **1.1. Temel Amaç**

Kullanıcıların "Bugün ne giysem?" sorununu ortadan kaldırmak, gardıroplarındaki potansiyeli maksimuma çıkarmak ve alışveriş öncesi deneme deneyimini dijitalleştirmek.

### **1.2. Ana Özellikler**

* **📸 Gardırop Dijitalleştirme:** Kullanıcı kıyafetinin fotoğrafını çeker. Yapay zeka (Fal AI - Florence-2 / BiRefNet) kıyafeti analiz eder, etiketler ve arka planını stüdyo kalitesinde temizler.
* **👗 Akıllı Sanal Deneme (Virtual Try-On):** Kullanıcı kendi fotoğrafına gardırobundaki kıyafetleri giydirir. Kıyafet sayısına göre otomatik model seçimi yapan hibrit bir yapı kullanılır.
* **🧠 Akıllı Stilist (AI Suggestions):** LLM (Gemini 2.5 Flash ve diğerleri), kullanıcıdan gelen serbest metin (prompt) doğrultusunda en uygun kombini önerir. "Remote Config" yapısı ile promptlar dinamik olarak yönetilir.

## **2. Teknik Mimari**

* **Frontend:** iOS (Swift & SwiftUI)
* **Backend:** Firebase (BaaS)
  * **Auth:** Anonim / Adapty ID eşleşmesi.
  * **Firestore:** Kullanıcı verileri, abonelik durumu, kota takibi, sistem konfigürasyonları (`system_configs`).
  * **Cloud Functions:** İş mantığı, API köprüsü, akıllı model yönlendirme.
* **Yapay Zeka Modelleri:**
  * **Analiz:** Fal AI (Florence-2 / LLaVA)
  * **Arka Plan:** Fal AI (BiRefNet v2)
  * **Try-On:**
    * **Tekli:** Fal AI (Image Apps v2 - Legacy)
    * **İkili:** Fal AI (Nano Banana - Edit Endpoint)
    * **Çoklu (3+):** Fal AI (Nano Banana Pro - Edit Endpoint)
  * **Suggestion:** Fal AI (Any LLM Enterprise)
    * **Default:** Google Gemini 2.5 Flash
    * **Alternatifler:** GPT-4o-mini, Llama 3.1, GPT-5-mini vb. (Random seçim opsiyonu)
* **Gelir & Analitik:** Adapty (Abonelik yönetimi, Paywall A/B testleri)
* **Reklam:** AppLovin MAX with Google AdMob (Bidding) ve Meta Audience Network (Freemium monetizasyonu) 

## **3. İş Modeli ve Fiyatlandırma**

### **3.1. Birim Maliyetler (Tahmini API)**

* **Kıyafet Analizi:** ~$0.016
* **Sanal Deneme (1 Parça):** ~$0.04
* **Sanal Deneme (2 Parça):** ~$0.08 (Nano Banana)
* **Sanal Deneme (3+ Parça):** ~$0.15 (Nano Banana Pro)
* **Kombin Önerisi:** ~$0.001

### **3.2. Abonelik Katmanları ve Kotalar**

| Özellik | Freemium (Tek Seferlik) | Basic (Aylık Yenilenen) | Pro (Aylık Yenilenen) |
| :---- | :---- | :---- | :---- |
| **Reklamlar** | ✅ Var | 🚫 Yok | 🚫 Yok |
| **Analiz Hakkı** | 20 | 100 / ay | 300 / ay |
| **Try-On Hakkı** | 3 | 50 / ay | 100 / ay |
| **Öneri Hakkı** | 30 | 200 / ay | 300 / ay |

* **Not:** Freemium hakları kullanıcı ilk oluştuğunda tanımlanır ve yenilenmez. Basic/Pro hakları ise Adapty webhook'ları ile her ay yenilenir.
* **Önemli:** Sanal Deneme (Try-On) işleminde, kullanılan kıyafet sayısı kadar hak düşülür. (Örn: 2 kıyafetli bir deneme 2 Try-On hakkı harcar.)

### **3.3. Finansal Analiz ve Kârlılık**

**A. Freemium Kullanıcı Ekonomisi (Reklam Destekli)**

Freemium kullanıcılar, yapay zeka maliyetlerini reklam izleyerek finanse ederler.
* **Reklam Modeli:** 5 saniyelik geçilebilir (skippable) reklamlar.
* **Tahmini Gelir (eCPM):** ~$11.00 (1000 gösterim başına $11).
* **Reklam Başına Gelir:** ~$0.011

**Senaryo: Power User (Tam Kullanım - %100)**
Tüm hakların sonuna kadar kullanıldığı senaryodur.

1.  **Kıyafet Analizi (20 Hak):**
    *   **Kural:** İlk 3 analiz reklamsız. Kalan 17 analiz için her birinde 1 reklam.
    *   **Gelir:** 17 * $0.011 = **$0.187** | **Maliyet:** 20 * $0.016 = **$0.32**
2.  **Sanal Deneme (3 Hak):**
    *   **Kural:** Her deneme için art arda 2 reklam.
    *   **Gelir:** 6 * $0.011 = **$0.066** | **Maliyet:** 3 * $0.04 = **$0.12**
3.  **Kombin Önerisi (30 Hak):**
    *   **Kural:** İlk öneri reklamsız. Kalan 29 öneri için her birinde 1 reklam.
    *   **Gelir:** 29 * $0.011 = **$0.319** | **Maliyet:** 30 * $0.001 = **$0.03**

*   **Toplam Net Kâr (Power User):** **+$0.102**
*   *(Not: Ortalama bir kullanıcı (%50 kullanım) için de sistem kârlıdır (~$0.02), ancak marj düşüktür. Freemium'un asıl amacı kullanıcı kazanımıdır.)*

**B. Basic Abonelik Ekonomisi ($9.99 / Ay)**

*   **Net Gelir (Mağaza Kesintisi Sonrası):** ~$8.49
*   **Yıllık Plan:** $95.90 (%20 İndirim) -> Aylık ~$7.99

1.  **Power User (Tam Kullanım - %100):**
    *   Kullanıcı tüm kotalarını (100 Analiz, 50 Try-On, 200 Öneri) bitirir.
    *   **Toplam Maliyet:** $3.80
    *   **Net Kâr:** **$4.69 / Ay**

2.  **Average User (Ortalama Kullanım - %50):**
    *   Kullanıcı kotaların yarısını (50 Analiz, 25 Try-On, 100 Öneri) kullanır.
    *   **Toplam Maliyet:** $1.90
    *   **Net Kâr:** **$6.59 / Ay**

**C. Pro Abonelik Ekonomisi ($19.99 / Ay)**

*   **Net Gelir (Mağaza Kesintisi Sonrası):** ~$16.99
*   **Yıllık Plan:** $191.90 (%20 İndirim) -> Aylık ~$15.99

1.  **Power User (Tam Kullanım - %100):**
    *   Kullanıcı tüm kotalarını (300 Analiz, 100 Try-On, 300 Öneri) bitirir.
    *   **Toplam Maliyet:** $9.10
    *   **Net Kâr:** **$7.89 / Ay**

2.  **Average User (Ortalama Kullanım - %50):**
    *   Kullanıcı kotaların yarısını (150 Analiz, 50 Try-On, 150 Öneri) kullanır.
    *   **Toplam Maliyet:** $4.55
    *   **Net Kâr:** **$12.44 / Ay**

### **3.4. 'A La Carte' Paketler (Tek Seferlik Satın Alım)**

Abonelik istemeyen veya kotası dolan kullanıcılar için yüksek kâr marjlı ek paketler.
*(Net Gelir hesabı %15 Apple kesintisi sonrası yapılmıştır.)*

| Paket Adı | Satış Fiyatı | Net Gelir | Tahmini Maliyet | Net Kâr | Kâr Marjı |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **10 Ek Kıyafet Analizi** | $1.99 | ~$1.69 | $0.16 | **$1.53** | %90 |
| **50 Ek Kıyafet Analizi** | $4.99 | ~$4.24 | $0.80 | **$3.44** | %81 |
| **10 Ek Sanal Deneme** | $2.99 | ~$2.54 | $0.40 | **$2.14** | %84 |
| **30 Ek Sanal Deneme** | $5.99 | ~$5.09 | $1.20 | **$3.89** | %76 |
| **20 Ek Kombin Önerisi** | $1.99 | ~$1.69 | $0.02 | **$1.67** | %98 |
| **50 Ek Kombin Önerisi** | $2.99 | ~$2.54 | $0.05 | **$2.49** | %98 |

## **4. API Endpoint Detayları (Cloud Functions)**

Tüm fonksiyonlar `https://us-central1-aidrobe-backend.cloudfunctions.net/<functionName>` adresinde çalışır.

### **4.1. `virtualTryOn` (Sanal Deneme)**

Kıyafet sayısına göre otomatik model seçimi yapar ve kullanılan kıyafet sayısı kadar kota düşer.

* **Input (`data` objesi içinde):**
  * `uuid` (string): Kullanıcı ID (Adapty ID veya Global UUID).
  * `pose_image_base_64` (string): Kullanıcının fotoğrafı (Base64, header yok).
  * `clothing_images_base_64` (string[]): Kıyafet fotoğrafları dizisi (Base64, header yok).
  * `model_type` (string, opsiyonel): `"nano-banana-pro"` gönderilirse, kıyafet sayısına bakılmaksızın Pro model kullanılır.

* **Mantık:**
  1.  **3+ Kıyafet** VEYA `model_type="nano-banana-pro"` -> **Nano Banana Pro** (`/edit` endpoint, `image_urls` array).
  2.  **2 Kıyafet** -> **Nano Banana** (`/edit` endpoint, `image_urls` array).
  3.  **1 Kıyafet** -> **Legacy Model** (`virtual-try-on` endpoint).
  4.  **Kota:** `clothing_images_base_64.length` kadar `remainingTryOns` düşülür.

* **Output:** `{ "result_image_url": "https://..." }`

### **4.2. `getOutfitSuggestion` (Kombin Önerisi)**

Kullanıcıdan gelen serbest metni (prompt) yapay zekaya iletir.

* **Input (`data` objesi içinde):**
  * `uuid` (string): Kullanıcı ID (Adapty ID veya Global UUID).
  * `user_request` (string): Frontend tarafından oluşturulmuş tam prompt metni (Kullanıcı isteği + Gardırop JSON + Sistem talimatları).
  * `temperature` (number, opsiyonel): Yaratıcılık seviyesi (Default: 0.7).
  * `useRandomModel` (boolean, opsiyonel): `true` ise havuzdan rastgele bir model seçer.

* **Output:**
  ```json
  {
    "recommendation": ["ID_1", "ID_2"],
    "description": "Kombin açıklaması..."
  }
  ```

### **4.3. `initializeUser` (Kullanıcı Başlatma)**

Uygulama açılışında veya login sonrası güvenli kullanıcı kaydı oluşturur.

* **Input:** `{ "uuid": "..." }`
* **İşlev:** Adapty'den kullanıcının abonelik durumunu kontrol eder. Eğer yoksa Freemium kotalarını tanımlar. Varsa ilgili paketin kotalarını tanımlar. `email` parametresi artık kullanılmamaktadır.

### **4.4. `syncUserWithAdapty` (Senkronizasyon)**

Manuel "Restore Purchase" işlemi için kullanılır.

* **Input:** `{ "uuid": "..." }`
* **İşlev:** Adapty'den güncel durumu çeker ve Firestore'daki kotaları günceller.

### **4.5. `adaptyWebhook` (Otomatik Güncelleme)**

Adapty'den gelen sunucu bildirimlerini dinler. Abonelik yenilendiğinde, iptal edildiğinde veya yükseltildiğinde Firestore'daki kotaları otomatik günceller.

## **5. Veritabanı Yapısı (Firestore)**

### **`users/{userId}`**
* `tier`: "freemium" | "basic" | "pro"
* `remainingTryOns`: number
* `remainingSuggestions`: number
* `remainingClothAnalysis`: number
* `createdAt`: timestamp
* `lastSyncedWithAdapty`: timestamp

### **`system_configs/outfit_prompts`**
* `school`: Map `{ prompt: "...", img: "..." }`
* `office`: Map `{ prompt: "...", img: "..." }`
* ... (Diğer modlar buraya dinamik olarak eklenebilir)

## **6. Gizlilik ve Güvenlik**

* **Veri Saklama:** Kullanıcı fotoğrafları (pozlar ve kıyafetler) sadece kullanıcının kendi cihazında (Local Storage) saklanır. Sunucularımızda kalıcı olarak depolanmaz.
* **İşleme:** Yapay zeka işlemleri için görseller anlık olarak API'ye gönderilir, işlenir ve işlem biter bitmez sunucudan silinir.

## **7. 3 Yıllık Finansal Projeksiyon ve Gelişim Planı**

Bu plan, agresif büyüme yerine sürdürülebilir kârlılık ve teknik stabilite üzerine kurulmuştur. Hesaplamalar **%20 Kurumlar Vergisi** düşüldükten sonraki net kârı gösterir.

**Varsayımlar:**
*   **Yıllık İndirim:** Yıllık alımlarda %20 indirim uygulanır.
*   **A La Carte:** Free kullanıcıların %3-%5'i ek paket satın alır (Ort. Kâr: $2.05/paket).
*   **Mağaza Kesintisi:** %15 (Small Business Program).
*   **Ortalama Kâr Marjı (Ağırlıklı):** Basic: ~$6.25/ay, Pro: ~$11.76/ay.

### **1. Yıl: Pazar Uyumu (Survival Mode)**
*   **Hedef:** 10.000 Aylık Aktif Kullanıcı (MAU).
*   **Dönüşüm:** %3 Ücretli Abone (300 Kişi).
*   **Dağılım:** 210 Basic, 90 Pro.
*   **Finansal Tablo (Aylık):**
    *   **Abonelik Kârı:** (210 * $6.25) + (90 * $11.76) = **$2,370**
    *   **Freemium (Reklam + A La Carte):** (9,700 * $0.02) + (194 * $2.05) = **$591**
    *   **Toplam Aylık Net Kâr (Vergi Öncesi):** ~$2,961
    *   **Yıllık Net Kâr (Vergi Sonrası):** **~$28,425**

### **2. Yıl: Büyüme ve Optimizasyon (Growth Mode)**
*   **Hedef:** 50.000 MAU.
*   **Dönüşüm:** %5 Ücretli Abone (2.500 Kişi).
*   **Dağılım:** 1.500 Basic, 1.000 Pro.
*   **Gelişmeler:** Android sürümü, Sosyal özellikler.
*   **Finansal Tablo (Aylık):**
    *   **Abonelik Kârı:** (1.500 * $6.25) + (1.000 * $11.76) = **$21,135**
    *   **Freemium (Reklam + A La Carte):** (47,500 * $0.03) + (1.425 * $2.05) = **$4,346**
    *   **Toplam Aylık Net Kâr (Vergi Öncesi):** ~$25,481
    *   **Yıllık Net Kâr (Vergi Sonrası):** **~$244,617**

### **3. Yıl: Ölçeklenme ve B2B (Scale Mode)**
*   **Hedef:** 200.000 MAU.
*   **Dönüşüm:** %6 Ücretli Abone (12.000 Kişi).
*   **Dağılım:** 7.200 Basic, 4.800 Pro.
*   **Gelişmeler:** Kendi GPU sunucularımız, B2B API Satışı.
*   **Finansal Tablo (Aylık):**
    *   **Abonelik Kârı:** (7.200 * $6.25) + (4.800 * $11.76) = **$101,448**
    *   **Freemium (Reklam + A La Carte):** ~$17,200
    *   **B2B / Affiliate Geliri:** ~$10,000
    *   **Toplam Aylık Net Kâr (Vergi Öncesi):** ~$128,650
    *   **Yıllık Net Kâr (Vergi Sonrası):** **~$1,235,040**

## **8. Kârlılığı Artırma Stratejileri (Action Plan)**

Mevcut abonelik ve reklam gelirlerini destekleyecek yan stratejiler:

### **1. Affiliate Marketing (Satış Ortaklığı)**
*   **Mantık:** Kullanıcının dolabındaki kıyafetlere uygun eksik parçaları (örn: "Bu eteğin üzerine şu beyaz gömlek harika olur") önerirken Amazon/Trendyol linki vermek.
*   **Potansiyel:** %5-%10 arası satış komisyonu. Abonelik satamasanız bile free user'dan para kazanmanızı sağlar.

### **2. Hibrit Model Kullanımı (Model Distillation)**
*   **Mantık:** Her istek için en pahalı modeli kullanmak yerine, basit istekler (örn: "Siyah tişört kombinle") için daha ucuz modelleri (Gemini Flash Lite, Llama 3 8B), karmaşık istekler için pahalı modelleri kullanmak.
*   **Etki:** API maliyetlerinde %30-%50 tasarruf.

### **3. "Boost" Paketleri (Micro-Transactions)**
*   **Mantık:** Free userlar için sırada bekleme veya yavaş işlem süresi (queue) koyup, "Hızlı Sonuç" için tek seferlik küçük ödemeler veya reklam izleme zorunluluğu getirmek.

### **4. Sezonluk ve Tematik Paketler**
*   **Mantık:** Cadılar Bayramı, Yılbaşı veya Düğün Sezonu için özel arka planlar ve promptlar içeren "Limited Time" paketler satmak. (Örn: "Gelinlik Deneme Paketi" - $4.99).

### **5. Veri İçgörüleri (Anonim)**
*   **Mantık:** Hangi bölgede hangi renklerin veya markaların daha çok denendiğine dair anonim verilerin moda markalarına rapor olarak sunulması.

* **Şeffaflık:** Kullanıcı verileri satılmaz veya izinsiz üçüncü taraflarla paylaşılmaz.

## **9. Detailed Cost & Revenue Analysis (US Market)**

This section details the unit economics for Free Users, specifically focusing on the Ad-Supported model (Interstitial & Rewarded Ads).

### **9.1. Cost Structure (Expenses)**

| Feature | Model / Logic | Cost per Request (USD) |
| :--- | :--- | :--- |
| **Suggestion** | Gemini Flash / Llama 3 | **$0.001** (Fixed) |
| **Analysis** | BiRefNet + LLaVA | **~$0.01** (Avg. Compute Time) |
| **Try-On (1 Item)** | Standard Model | **$0.04** (1 Credit) |
| **Try-On (2 Items)** | Nano Banana | **$0.039** (2 Credits) |
| **Try-On (3+ Items)** | Nano Banana Pro | **$0.15** (Fixed, N Credits) |

### **9.2. Revenue Assumptions (AdMob US)**

Based on average eCPM rates for Tier-1 countries (USA).

| Ad Format | eCPM (Est.) | Revenue per View |
| :--- | :--- | :--- |
| **Interstitial** | ~$20.00 | **$0.02** |
| **Rewarded Video** | ~$30.00 | **$0.03** |

### **9.3. Profitability Formulas (Free User Flow)**

#### **A. Standard Usage (Using Initial Quota)**
*User watches Interstitial ads while consuming their initial free rights.*

1.  **Analysis ($P_{analysis}$)**
    *   **Flow:** 1 Interstitial Ad displayed.
    *   $$P_{analysis} = Revenue_{int} - Cost_{analysis}$$
    *   $$P_{analysis} = \$0.02 - \$0.01 = \mathbf{+\$0.01}$$ (Profit)

2.  **Suggestion ($P_{suggestion}$)**
    *   **Flow:** 1 Interstitial Ad displayed.
    *   $$P_{suggestion} = Revenue_{int} - Cost_{suggestion}$$
    *   $$P_{suggestion} = \$0.02 - \$0.001 = \mathbf{+\$0.019}$$ (High Profit)

3.  **Try-On ($P_{tryon}$)**
    *   **Flow:** 2 Interstitial Ads displayed back-to-back.
    *   **Scenario 1 (1 Item):**
        *   $$P = (2 \times \$0.02) - \$0.04 = \mathbf{\$0.00}$$ (Break-even)
    *   **Scenario 2 (2 Items):**
        *   $$P = (2 \times \$0.02) - \$0.039 = \mathbf{+\$0.001}$$ (Marginal Profit)
    *   **Scenario 3 (3+ Items):**
        *   $$P = (2 \times \$0.02) - \$0.15 = \mathbf{-\$0.11}$$ (Loss)
        *   *Risk Note:* Multi-item try-ons are loss leaders for free users unless they have accumulated credits via Rewarded Ads.

#### **B. Refill Usage (Rewarded Ads)**
*User runs out of credits and watches a Rewarded Ad to refill, THEN watches Interstitials while using them.*

1.  **Refill: 3 Analysis Credits**
    *   **Action:** Watch 1 Rewarded Ad (+$0.03).
    *   **Usage:** Perform 3 Analyses (Watch 3 Interstitials: 3 * $0.02 = +$0.06).
    *   **Total Revenue:** $0.09
    *   **Total Cost:** 3 * $0.01 = $0.03
    *   **Net Profit:** **+$0.06**

2.  **Refill: 3 Suggestion Credits**
    *   **Action:** Watch 1 Rewarded Ad (+$0.03).
    *   **Usage:** Perform 3 Suggestions (Watch 3 Interstitials: 3 * $0.02 = +$0.06).
    *   **Total Revenue:** $0.09
    *   **Total Cost:** 3 * $0.001 = $0.003
    *   **Net Profit:** **+$0.087**

3.  **Refill: 1 Try-On Credit (Standard)**
    *   **Action:** Watch 1 Rewarded Ad (+$0.03).
    *   **Usage:** Perform 1 Try-On (1 Item). Watch 2 Interstitials (+$0.04).
    *   **Total Revenue:** $0.07
    *   **Cost:** $0.04
    *   **Net Profit:** **+$0.03**

4.  **Multi-Item Try-On (3+ Items)**
    *   **Status:** **PREMIUM ONLY**
    *   **Reason:** Since users can only refill when their balance is 0 and receive small credit packs (e.g., 1 Credit), they cannot accumulate enough free credits to perform a multi-item Try-On (which requires 3+ credits).
    *   **Strategic Value:** This creates a "Hard Paywall" for the most expensive feature ($0.15 cost), forcing users to buy credits or subscribe to Pro. It eliminates the risk of financial loss on free users.

### 9.4. Strategic Conclusion

*   **Cash Cows:** Analysis and Suggestion features are highly profitable.
*   **Try-On Strategy:** Free users are limited to Single-Item Try-Ons (profitable). The advanced Multi-Item Try-On is effectively reserved for paying users. This strategy protects margins and creates a strong incentive for upgrading to the Pro plan.

## **10. Revenue Projections (Realistic Early-Stage)**

Acknowledging that reaching 100k users is a long-term challenge, this projection focuses on **achievable early milestones**. Even with a modest user base, the high-margin subscription model generates significant income.

**Assumptions:**
*   **Net Revenue:** Basic ~$8.50, Pro ~$17.00.
*   **Usage Profile:** Average User (50% quota usage).
*   **Conversion:** 8% Total (5% Basic, 3% Pro).

| Metric | Phase 1: Validation | Phase 2: Salary Replacement | Phase 3: Small Business |
| :--- | :--- | :--- | :--- |
| **Monthly Active Users (MAU)** | **1,000** | **5,000** | **25,000** |
| **Free Users (92%)** | 920 | 4,600 | 23,000 |
| **Basic Subscribers (5%)** | 50 | 250 | 1,250 |
| **Pro Subscribers (3%)** | 30 | 150 | 750 |
| | | | |
| **Ad Revenue (Free Users)** | $230 | $1,150 | $5,750 |
| **Basic Sub Revenue** | $425 | $2,125 | $10,625 |
| **Pro Sub Revenue** | $510 | $2,550 | $12,750 |
| | | | |
| **TOTAL MONTHLY REVENUE** | **$1,165** | **$5,825** | **$29,125** |
| *Est. API Costs (~18%)* | *-$210* | *-$1,048* | *-$5,242* |
| **NET PROFIT (Monthly)** | **$955** | **$4,777** | **$23,883** |

### **Reality Check**
1.  **1,000 Users:** This is the "Proof of Concept" stage. Even here, the app covers its own server costs and generates ~$1k pocket money.
2.  **5,000 Users:** This is a very achievable target with decent marketing (TikTok/Reels). At this stage, the app generates a **full-time salary (~$4.7k)**. You don't need millions of users to be financially free.
3.  **25,000 Users:** This is a successful, stable app business. It generates ~$24k/month, allowing for hiring a small team or aggressive marketing reinvestment.

## **11. Retention Strategy & Churn Management (Risk Analizi)**

Kullanıcı tutundurma (Retention), kullanıcı kazanımından (Acquisition) daha kritiktir. "Bir ay kullanıp gitme" riskini minimize etmek için AIdrobe'un yapısal avantajları ve stratejileri:

### **11.1. The "Lock-in" Effect (Kilitlenme Etkisi)**
*   **Fark:** AIdrobe, tek seferlik eğlence sunan bir "Avatar" uygulaması değildir. Bir "Utility" (Araç) uygulamasıdır.
*   **Yatırım:** Kullanıcı gardırobunu dijitalleştirmek için emek harcar (fotoğraf çeker, yükler).
*   **Sonuç:** 10+ kıyafet yükleyen bir kullanıcının uygulamayı silme oranı (Churn), hiç yüklemeyen birine göre **%60-%70 daha düşüktür**. Kullanıcının verisi (dijital dolabı) içeride olduğu için uygulama vazgeçilmez hale gelir.

### **11.2. "Content Treadmill" (İçerik Döngüsü)**
Kullanıcı sıkılmasın diye sürekli yeni "Senaryolar" sunulur:
*   *"Bu hafta sonu yağmurlu, işte yağmura uygun kombinlerin."* (Hava durumu entegrasyonu ile)
*   *"Sevgililer günü yaklaşıyor, dolabındaki şu kırmızı elbiseyi denedin mi?"*
*   **Amaç:** Kullanıcıya uygulamayı açması için sürekli yeni bir "Bahane" vermek.

### **11.3. Churn Matematiği ve LTV**
*   Mobil dünyada ortalama aylık Churn %15 civarındadır. Yani her ay 100 kullanıcının 15'i gider.
*   **Hedef:** LTV (Lifetime Value) > CAC (Customer Acquisition Cost).
*   **Hesap:** Bir "Pro" kullanıcının ortalama ömrü 4 ay olsa bile, bu kullanıcıdan **~$68** gelir elde edilir. Eğer yeni bir kullanıcı kazanmanın maliyeti (Reklam) $10 ise, şirket her kullanıcıdan **$58** kar eder ve bu bütçeyi giden kullanıcının yerini doldurmak için kullanır.

