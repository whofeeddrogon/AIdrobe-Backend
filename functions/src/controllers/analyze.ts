import * as functions from "firebase-functions/v1";
import axios from "axios";
import { falKey, runtimeOptions } from "../config";
import { checkOrUpdateQuota } from "../utils/quota";
import { extractJson } from "../utils/helpers";
import { getRemoteConfigValue } from "../utils/remoteConfig";
import { DEFAULT_CLOTHING_ANALYSIS_PROMPT } from "../utils/constants";
import { AnalyzeRequestData, AnalyzeClothingImageResponse } from "../types";

/**
 * 1. KIYAFET ANALİZİ
 */
export const analyzeClothingImage = functions
    .runWith(runtimeOptions)
    .https.onCall(async (payload: any, context: functions.https.CallableContext): Promise<AnalyzeClothingImageResponse> => {
      
      const data: AnalyzeRequestData = payload.data || payload; 
      const { uuid, image_base_64 } = data;

      if (!uuid || !image_base_64) {
        throw new functions.https.HttpsError("invalid-argument", "Gerekli parametreler eksik (uuid, image_base_64).");
      }

      try {
        functions.logger.info("Clothing analysis started", { uuid });
        const newQuota = await checkOrUpdateQuota(uuid, "remainingClothAnalysis");

        const categoryList = [
          "T-Shirt", "Shirt", "Sweater", "Sweatshirt / Hoodie", "Blouse",
          "Pants", "Jeans", "Shorts", "Skirt",
          "Jacket", "Coat", "Blazer", "Vest",
          "Dress", "Jumpsuit",
          "Shoes", "Boots", "Sneakers", "Heels",
          "Hat", "Bag", "Belt", "Jewelry", "Scarf", "Sunglasses",
        ].join(", ");

        // Remote Config'den prompt'u çek (Cache mekanizmalı)
        // Eğer Remote Config'de "clothing_analysis_prompt" tanımlı değilse defaultPrompt kullanılır.
        let prompt = await getRemoteConfigValue("clothing_analysis_prompt", DEFAULT_CLOTHING_ANALYSIS_PROMPT);
        
        // Placeholder'ı gerçek kategori listesiyle değiştir
        prompt = prompt.replace("{{CATEGORY_LIST}}", categoryList);
        
        const apiKey = falKey.value();

        const bgResponse = await axios.post(
            "https://fal.run/fal-ai/birefnet/v2",
            {
              image_url: `data:image/jpeg;base64,${image_base_64}`,
              model_type: "General Use (Light)",
            },
            {
              headers: { "Authorization": `Key ${apiKey}`, "Content-Type": "application/json" },
            },
        );

        const bgRemovedImageUrl = bgResponse.data?.image?.url;
        if (!bgRemovedImageUrl) {
          functions.logger.error("fal-ai/birefnet/v2 Error", { response: bgResponse.data });
          throw new functions.https.HttpsError("internal", "fal-ai/birefnet/v2 Hatası");
        }

        const response = await axios.post(
            "https://fal.run/fal-ai/llava-next",
            {
              prompt,
              image_url: bgRemovedImageUrl,
              max_tokens: 256,
              temperature: 0.2,
            },
            {
              headers: { "Authorization": `Key ${apiKey}`, "Content-Type": "application/json" },
            },
        );
        
        const llmOutput: string = response.data?.output ?? "{}";
        try {
            const parsedJson = extractJson(llmOutput);

            const result = {
              category: parsedJson.category ?? "",
              description: parsedJson.description ?? "",
              name: parsedJson.name ?? "",
              image_url: bgRemovedImageUrl,
              new_quota: newQuota,
            };

            return result;
        } catch (e: any) {
            functions.logger.error("LLM JSON parse error", { llmOutput, error: e });
            throw new functions.https.HttpsError("internal", "Yapay zekanın cevabı anlaşılamadı. Lütfen tekrar deneyin.");
        }
      } catch (error: any) {
        if (error.code === "resource-exhausted" || error.code === "permission-denied") {
            functions.logger.warn("Quota exhausted", { uuid, feature: "Clothing Analysis" });
            throw error;
        }
        functions.logger.error("Fal API Error (analyzeClothingImage)", { error });
        throw new functions.https.HttpsError("internal", "Kıyafet analizi sırasında bir hata oluştu.");
      }
    });
