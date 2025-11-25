import * as functions from "firebase-functions/v1";
import axios, { AxiosError } from "axios";
import { falKey, runtimeOptions } from "../config";
import { checkOrUpdateQuota } from "../utils/quota";
import { TryOnRequestData } from "../types";

/**
 * 2. SANAL DENEME
 */
export const virtualTryOn = functions
    .runWith(runtimeOptions)
    .https.onCall(async (payload: any, context: functions.https.CallableContext) => {
      
      const data: TryOnRequestData = payload.data || payload;
      const { uuid, pose_image_base_64, clothing_images_base_64, model_type } = data;

      // Artık sadece array kabul ediyoruz
      const clothingImages = clothing_images_base_64 || [];

      if (!uuid || !pose_image_base_64 || !Array.isArray(clothingImages) || clothingImages.length === 0) {
        throw new functions.https.HttpsError("invalid-argument", "Gerekli parametreler eksik (uuid, pose_image_base_64, clothing_images_base_64).");
      }

      try {
        console.log(`Virtual try-on başlatılıyor - User: ${uuid}`);
        
        // Maliyet hesaplama: Her kıyafet için 1 token
        const cost = clothingImages.length;
        console.log(`Try-on cost calculated: ${cost} tokens for ${clothingImages.length} items.`);

        const newQuota = await checkOrUpdateQuota(uuid, "remainingTryOns", cost);

        const apiKey = falKey.value();
        let resultImageUrl: string | undefined;

        // Model seçimi ve mantığı
        // 1. Nano Banana Pro: 3+ kıyafet VEYA model_type='nano-banana-pro'
        // 2. Nano Banana: 2 kıyafet VEYA model_type='nano-banana'
        // 3. Legacy: Diğer durumlar (Tek kıyafet)

        const proPrompt = `**GENERATE ONLY A SINGLE, HIGH-FIDELITY IMAGE.**

                            **PRIMARY TASK: Perform a Photorealistic Virtual Try-On using ALL provided garment references.** The subject from the main input image (referred to as the 'input_image' or 'pose_image') will receive the new clothing.

                            **CRITICAL PRESERVATION RULES (from 'input_image' ONLY):**
                            1.  **Facial Identity & Expression:** The subject's face and facial expression from the 'input_image' **MUST remain absolutely unchanged**.
                            2.  **Body Pose & Positioning:** The subject's exact body pose, hand placement, and overall body structure from the 'input_image' **MUST be strictly preserved**.
                            3.  **Background Environment:** The **ENTIRE background environment of the 'input_image' MUST NOT be altered or replaced in any way.** It must remain exactly as it is.
                            4.  **Existing Unreferenced Garments:** Any clothing or accessories already on the subject in the 'input_image' that were **NOT** supplied as separate reference garments **MUST be preserved exactly as they are**.

                            **CLOTHING INTEGRATION & LAYERING RULES (from reference garments):**
                            1.  **Full Integration:** You MUST use **EACH and EVERY provided reference garment** and integrate them onto the subject.
                            2.  **Sequential Layering:** Systematically process and integrate these garments in a clear dimensional sequence. Prioritize outermost layers first (e.g., coat, jacket), then mid-layers (e.g., shirt, sweater), and finally innermost layers or accessories (e.g., t-shirt, tie) to prevent omission or confusion.
                            3.  **Old Garment Removal:** Completely erase all remnants of the previous clothing **ONLY for the areas where new garments are being placed**.
                            4.  **Realism & Blending:** Ensure seamless, realistic integration with natural fabric drape, texture, and fit according to the subject's body shape. The new garments must flawlessly match the 'input_image' scene's original lighting, shadows, and color grading.

                            **FINAL OUTPUT QUALITY:** The final image must be high-fidelity and appear as an imperceptible, photorealistic edit.`;

        // Model seçimi ve mantığı
        // 1. Nano Banana Pro: 3+ kıyafet VEYA model_type='nano-banana-pro'
        // 2. Nano Banana: 2 kıyafet
        // 3. Legacy: 1 kıyafet

        // Ortak resim listesi hazırlığı (Pose + Kıyafetler) - Nano Banana modelleri için
        const allImages = [
            `data:image/jpeg;base64,${pose_image_base_64}`,
            ...clothingImages.map(img => `data:image/jpeg;base64,${img}`)
        ];

        if (model_type === "nano-banana-pro" || clothingImages.length >= 3) {
            console.log("FAL AI Nano Banana Pro API'sine istek gönderiliyor...");
            
            const response = await axios.post(
                "https://fal.run/fal-ai/nano-banana-pro/edit",
                {
                    prompt: proPrompt,
                    image_urls: allImages,
                },
                {
                    headers: {
                        "Authorization": `Key ${apiKey}`,
                        "Content-Type": "application/json",
                    },
                },
            );
            
            console.log("FAL AI Nano Banana Pro response alındı:", response.status);
            // /edit endpoint'i genellikle 'image' objesi döner, standart endpointler 'images' array döner. Her ikisini de kontrol edelim.
            resultImageUrl = response.data?.image?.url || response.data?.images?.[0]?.url;

        } else if (clothingImages.length === 2) {
            console.log("FAL AI Nano Banana API'sine istek gönderiliyor...");

            const response = await axios.post(
                "https://fal.run/fal-ai/nano-banana/edit",
                {
                    prompt: proPrompt,
                    image_urls: allImages,
                },
                {
                    headers: {
                        "Authorization": `Key ${apiKey}`,
                        "Content-Type": "application/json",
                    },
                },
            );
            
            console.log("FAL AI Nano Banana response alındı:", response.status);
            resultImageUrl = response.data?.image?.url || response.data?.images?.[0]?.url;

        } else {
            // Varsayılan (Mevcut) Model - Tek kıyafet
            console.log("FAL AI Standard Virtual Try-On API'sine istek gönderiliyor...");
            
            const response = await axios.post(
                "https://fal.run/fal-ai/image-apps-v2/virtual-try-on",
                {
                    person_image_url: `data:image/jpeg;base64,${pose_image_base_64}`,
                    clothing_image_url: `data:image/jpeg;base64,${clothingImages[0]}`,
                    preserve_pose: true,
                },
                {
                    headers: {
                        "Authorization": `Key ${apiKey}`,
                        "Content-Type": "application/json",
                    },
                },
            );

            console.log("FAL AI Standard Virtual Try-On response alındı:", response.status);
            resultImageUrl = response.data?.images?.[0]?.url;
        }

        if (!resultImageUrl) {
            // Hata durumunda loglama biraz daha detaylı olabilir çünkü response yapısı modele göre değişebilir
            throw new functions.https.HttpsError("internal", "Sanal deneme sonucu oluşturulamadı. Lütfen tekrar deneyin.");
        }

        console.log(`Virtual try-on başarıyla tamamlandı - User: ${uuid}`);
        return { result_image_url: resultImageUrl, newQuota };

    } catch (error: any) {
      if (error.code === "resource-exhausted" || error.code === "permission-denied") {
          console.log(`Quota exhausted for user ${uuid} - Virtual Try-On`);
          throw error;
      }
      
      const axiosError = error as AxiosError;
      if (axiosError.response) {
          console.error("FAL AI Virtual Try-On API hatası:", {
              status: axiosError.response.status,
              data: axiosError.response.data,
              headers: axiosError.response.headers
          });
      } else if (axiosError.request) {
          console.error("FAL AI Virtual Try-On network hatası:", axiosError.request);
      } else {
          console.error("FAL AI Virtual Try-On genel hatası:", error.message);
      }
      
      throw new functions.https.HttpsError("internal", "Sanal deneme sırasında bir hata oluştu. Lütfen tekrar deneyin.");
    }
});
