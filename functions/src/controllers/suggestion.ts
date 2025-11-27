import * as functions from "firebase-functions/v1";
import axios, { AxiosError } from "axios";
import { falKey, runtimeOptions } from "../config";
import { checkOrUpdateQuota } from "../utils/quota";
import { SuggestionRequestData, GetOutfitSuggestionResponse } from "../types";

/**
 * 3. KOMBİN ÖNERİSİ
 */
export const getOutfitSuggestion = functions
    .runWith(runtimeOptions)
    .https.onCall(async (payload: any, context: functions.https.CallableContext): Promise<GetOutfitSuggestionResponse> => {
      
      const data: SuggestionRequestData = payload.data || payload;
      const { uuid, user_request, temperature, useRandomModel } = data;

      if (!uuid || !user_request) {
        throw new functions.https.HttpsError("invalid-argument", "Gerekli parametreler eksik (uuid, user_request).");
      }

      try {
        console.log(`Outfit suggestion başlatılıyor - User: ${uuid}`);
        
        const newQuota = await checkOrUpdateQuota(uuid, "remainingSuggestions");

        // Client artık tam prompt'u gönderiyor, ekleme yapmıyoruz.
        const prompt = user_request;

        // Model Seçimi
        const defaultModel = "google/gemini-2.5-flash";
        const randomModels = [
          "google/gemini-2.5-flash",
          "google/gemini-2.5-flash-lite",
          "openai/gpt-oss-120b",
          "openai/gpt-4o-mini",
          "openai/gpt-5-mini",
          "meta-llama/llama-3.1-70b-instruct",
          "meta-llama/llama-4-scout"
        ];

        let selectedModel = defaultModel;
        if (useRandomModel) {
          const randomIndex = Math.floor(Math.random() * randomModels.length);
          selectedModel = randomModels[randomIndex];
        }

        console.log(`Seçilen Model: ${selectedModel}, Temperature: ${temperature ?? 0.7}`);
        console.log("FAL AI Outfit Suggestion API'sine istek gönderiliyor...");
        
        const apiKey = falKey.value();
        
        const response = await axios.post(
            "https://fal.run/fal-ai/any-llm/enterprise",
            { 
              model: selectedModel,
              prompt: prompt,
              max_tokens: 1024,
              temperature: temperature ?? 0.7,
            },
            { 
              headers: { "Authorization": `Key ${apiKey}`, "Content-Type": "application/json" },
            },
        );

        console.log("FAL AI Outfit Suggestion response alındı:", response.status);

        const llmOutput: string = response.data?.output ?? "{}";
        try {
          const jsonMatch = llmOutput.match(/\{[\s\S]*\}/);
          if (!jsonMatch) {
            throw new Error("Cevapta geçerli bir JSON objesi bulunamadı.");
          }
          const parsedJson = JSON.parse(jsonMatch[0]);
          
          // Basit validasyon - artık recommendation içeriğini kontrol etmiyoruz çünkü prompt tamamen dışarıdan geliyor
          // Ancak yine de JSON dönmesini bekliyoruz
          
          console.log(`Outfit suggestion başarıyla tamamlandı - User: ${uuid}`);

          const result: GetOutfitSuggestionResponse = {
            recommendation: parsedJson.recommendation ?? [],
            description: parsedJson.description ?? "",
            category: parsedJson.category ?? "Casual",
            name: parsedJson.name ?? "Stylish Outfit",
            new_quota: newQuota,
          };
          
          return result;
          
        } catch (e: any) {
          console.error("LLM JSON parse hatası:", llmOutput, e);
          throw new functions.https.HttpsError("internal", "Stil danışmanının cevabı anlaşılamadı. Lütfen tekrar deneyin.");
        }
      } catch (error: any) {
        if (error.code === "resource-exhausted" || error.code === "permission-denied") {
            console.log(`Quota exhausted for user ${uuid} - Outfit Suggestion`);
            throw error;
        }
        
        const axiosError = error as AxiosError;
        if (axiosError.response) {
            console.error("FAL AI Outfit Suggestion API hatası:", {
                status: axiosError.response.status,
                data: axiosError.response.data
            });
        } else {
            console.error("FAL AI Outfit Suggestion genel hatası:", error.message);
        }
        
        throw new functions.https.HttpsError("internal", "Kombin önerisi alınırken bir hata oluştu.");
      }
    });
