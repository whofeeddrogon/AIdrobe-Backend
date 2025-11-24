# **AIdrobe Master Dokümantasyonu**

Versiyon: 1.4.0  
Tarih: 24 Kasım 2025  
Özet: AIdrobe, yapay zeka destekli sanal stilistinizdir. Gardırobunu dijitalleştirir, kişiselleştirilmiş kombinler önerir ve gelişmiş sanal deneme teknolojisi ile kıyafetleri üzerinizde görmenizi sağlar.

## **1\. Ürün Vizyonu ve Özellikleri**

### **1.1. Temel Amaç**

Kullanıcıların "Bugün ne giysem?" sorununu ortadan kaldırmak, gardıroplarındaki potansiyeli maksimuma çıkarmak ve alışveriş öncesi deneme deneyimini dijitalleştirmek.

### **1.2. Ana Özellikler**

* **📸 Gardırop Dijitalleştirme:**  
  * Kullanıcı kıyafetinin fotoğrafını çeker.  
  * **Yapay Zeka (Fal AI \- Florence-2/LLaVA):** Kıyafeti analiz eder; kategorisini, rengini, desenini ve stilini otomatik olarak etiketler.  
  * **Gelişmiş Arka Plan Temizleme (Fal AI \- BiRefNet v2):** Kıyafetin arka planını, en son sürüm yapay zeka (v2) ile saç teli hassasiyetinde temizleyerek stüdyo kalitesinde (PNG) görsel oluşturur.  
* **👗 Akıllı Sanal Deneme (Dynamic Virtual Try-On):**  
  * Kullanıcı kendi boydan fotoğrafını yükler.  
  * **Tekli Deneme (1 Parça):** Sadece tek bir parça kıyafet (örn: sadece tişört) denendiğinde **Standart Model (IDM-VTON)** kullanılır. Bu model parça başına ücretlendirilir.  
  * **Çoklu Kombin Deneme (2+ Parça):** 2 veya daha fazla parça içeren kombinlerde (örn: üst+alt), sistem otomatik olarak **Nano Banana Pro** modeline geçer. Bu model, özellikle 3 ve üzeri parça denemelerinde büyük bir maliyet avantajı sağlayan sabit bir ücrete sahiptir.  
* **🧠 Akıllı Stilist (AI Suggestions):**  
  * Kullanıcı doğal dille istekte bulunur (örn: *"Yarın hava yağmurlu, iş toplantısı için şık bir kombin öner"*).  
  * LLM, kullanıcının gardırobunu analiz eder ve en uygun kombini önerir.

## **2\. Teknik Mimari ve Altyapı**

Uygulama, **Serverless (Sunucusuz)** mimari üzerine kurulmuştur.

* **Frontend:** iOS (Swift & SwiftUI)  
* **Backend:** Firebase (BaaS)  
  * **Authentication:** Kullanıcı kimlik doğrulama.  
  * **Firestore:** Veri ve kota takibi.  
  * **Cloud Functions:** İş mantığı ve akıllı model yönlendirme (Smart Routing).  
* **Yapay Zeka (AI) Motoru (Fal.ai):**  
  * **Analiz:** Florence-2 / LLaVA-NeXT  
  * **Arka Plan:** BiRefNet v2 (Yüksek Hassasiyet)  
  * **Try-On (1 Parça):** IDM-VTON (Parça başı \~$0.04)  
  * **Try-On** (2 Parça): Nano Banana (Parça başı \~$0.039 \- Toplam \~$0.078)  
  * **Try-On (3+ Parça):** Nano Banana Pro (Sabit \~$0.15)  
* **Gelir Yönetimi:** Adapty  
* **Reklam Ağı:** AppLovin (MAX)

## **3\. İş Modeli ve Fiyatlandırma Stratejisi**

### **3.1. Abonelik Katmanları**

| Özellik | Freemium | Premium ($9.99/ay) | Ultra Premium ($19.99/ay) |
| :---- | :---- | :---- | :---- |
| **Reklamlar** | ✅ Var | 🚫 Yok | 🚫 Yok |
| **Gardırop Limiti** | 50 Parça | 100 Parça | **Sınırsız** |
| **Kıyafet Analizi** | 20 (Tek Sefer) | 100 / ay | 300 / ay |
| **Sanal Deneme** | 3 (Tek Sefer) | 50 / ay | 100 / ay |
| **Kombin Önerisi** | 30 (Tek Sefer) | 200 / ay | 300 / ay |
| **Özel Özellikler** | \- | \- | Otomatik Günlük Öneri, Temalar |

### **3.2. Maliyet Optimizasyon Stratejisi (Smart Routing)**

Sanal Deneme özelliğinde kârlılığı korumak için dinamik bir yönlendirme algoritması kullanılır:

* **Senaryo A (1 Parça):** Standart model (IDM-VTON) kullanılır.  
  * Maliyet: **$0.04**  
* **Senaryo B (2 Parça):** Nano Banana kullanılır.  
  * Maliyet: 2 x $0.039 \= $0.078 (Standart modelden çok az daha ucuz)  
* **Senaryo C (3+ Parça):** Nano Banana Pro kullanılır.  
  * Maliyet: **$0.15 (Sabit)**  
  * **Kâr/Zarar Analizi:**  
    * **3 Parça:** Standart olsaydı $0.12 tutardı. Pro ile $0.15 ödenir. **(\~$0.03 Zarar)** \- Ancak kalite artışı ve tek seferde işleme avantajı için kabul edilebilir.  
    * **4 Parça:** Standart olsaydı $0.16 tutardı. Pro ile $0.15 ödenir. **(\~$0.01 Kâr)**  
    * **5 Parça:** Standart olsaydı $0.20 tutardı. Pro ile $0.15 ödenir. **(\~$0.05 Kâr)**  
  * **Sonuç:** Kullanıcı daha karmaşık ve zengin kombinler (4+ parça) denedikçe, birim maliyetimiz sabit kalır ve kârlılığımız artar. 3 parçalı denemelerdeki küçük maliyet artışı, daha karmaşık kombinlerdeki tasarruflarla dengelenir.

## **4\. Finansal Projeksiyon (1. Yıl)**

Adapty reklam sponsorluğu ve $4.000 Fal AI kredisi ile desteklenen büyüme stratejisi.

* **Hedeflenen Kullanıcı Sayısı:** 100.000  
* **Tahmini Brüt Gelir:** \~$111.000  
* **Tahmini Net Kâr:** **\~$86.000**  
* **Strateji:** Reklam gelirleri ve **çoklu ürün optimizasyonu** sayesinde, en karmaşık kombin denemelerinde bile pozitif marj korunur.

## **5\. Kullanıcı Akışı ve Deneyimi**

1. **Onboarding:** Gizlilik odaklı karşılama.  
2. **Tutorial:** İnteraktif kullanım kılavuzu.  
3. **Ana Ekran (Dashboard):** Özelliklere hızlı erişim ve gardırop özeti.  
4. **Paywall:** Tekil paketler ve abonelik planlarının sunumu.

## **6\. Gizlilik ve Güvenlik**

* **Client-Side Depolama:** Kullanıcı fotoğrafları sunucuda saklanmaz.  
* **Anonim İşleme:** AI işlemleri için gönderilen veriler işlem sonrası silinir.