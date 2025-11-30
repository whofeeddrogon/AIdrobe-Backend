import * as functions from "firebase-functions/v1";
import axios, { AxiosError } from "axios";
import { falKey, runtimeOptions } from "../config";
import { checkOrUpdateQuota } from "../utils/quota";
import { extractJson } from "../utils/helpers";
import { getRemoteConfigValue } from "../utils/remoteConfig";
import { DEFAULT_SUGGESTION_PROMPT } from "../utils/constants";
import { SuggestionRequestData, GetOutfitSuggestionResponse } from "../types";

/**
 * 3. KOMBİN ÖNERİSİ
 */
export const getOutfitSuggestion = functions
    .runWith(runtimeOptions)
    .https.onCall(async (payload: any, context: functions.https.CallableContext): Promise<GetOutfitSuggestionResponse> => {
      
      const data: SuggestionRequestData = payload.data || payload;
      const { uuid, user_request, scenario, wardrobe, user_info } = data;
      
      // Default değerler
      const temperature = data.temperature ?? 0.7;
      const useRandomModel = data.useRandomModel ?? false;

      if (!uuid) {
        throw new functions.https.HttpsError("invalid-argument", "Gerekli parametreler eksik (uuid).");
      }

      try {
        functions.logger.info("Outfit suggestion started", { uuid, scenario, useRandomModel });
        
        const newQuota = await checkOrUpdateQuota(uuid, "remainingSuggestions");

        // Kullanıcı isteği veya senaryo içeriğini belirle
        let requestContent = "";

        if (scenario) {
            // Senaryo varsa, önce Remote Config'den bu senaryoya özel promptu çekmeye çalış
            const scenarioKey = `suggestion_prompt_${scenario}`;
            
            // Eğer Remote Config'de bu senaryo yoksa kullanılacak vurgulu varsayılan metin
            const defaultScenarioContent = `**SCENARIO:** ${scenario.toUpperCase()}\nCreate an outfit recommendation that is PERFECTLY suited for this specific scenario/occasion.`;
            
            functions.logger.info("Scenario detected", { scenario, configKey: scenarioKey });
            requestContent = await getRemoteConfigValue(scenarioKey, defaultScenarioContent);
        } else if (user_request) {
            // Senaryo yoksa direkt kullanıcının yazdığı isteği kullan
            requestContent = user_request;
        } else {
            throw new functions.https.HttpsError("invalid-argument", "User request veya scenario gereklidir.");
        }

        // Her zaman ana prompt şablonunu kullan (Remote Config: suggestion_main_prompt)
        const configKey = "suggestion_main_prompt";
        
        let template = await getRemoteConfigValue(configKey, DEFAULT_SUGGESTION_PROMPT);
        
        // Placeholder'ları doldur
        template = template.replace("{{WARDROBE}}", wardrobe || "");
        template = template.replace("{{USER_INFO}}", user_info || "");
        // Artık {{SCENARIO}} yerine {{USER_REQUEST}} kullanıyoruz
        template = template.replace("{{USER_REQUEST}}", requestContent);
        
        const prompt = template;

        // Model Seçimi
        const defaultModel = "google/gemini-2.5-flash";
        const randomModels = [
          "google/gemini-2.5-flash",
          "google/gemini-2.5-flash-lite",
          "openai/gpt-4o-mini",
          "meta-llama/llama-3.1-70b-instruct",
          "meta-llama/llama-4-scout"
        ];

        let selectedModel = defaultModel;
        if (useRandomModel) {
          const randomIndex = Math.floor(Math.random() * randomModels.length);
          selectedModel = randomModels[randomIndex];
        }

        functions.logger.info("Model selected", { model: selectedModel, temperature });
        
        const apiKey = falKey.value();
        
        const response = await axios.post(
            "https://fal.run/fal-ai/any-llm/enterprise",
            { 
              model: selectedModel,
              prompt: prompt,
              max_tokens: 1024,
              temperature: temperature,
            },
            { 
              headers: { "Authorization": `Key ${apiKey}`, "Content-Type": "application/json" },
            },
        );

        functions.logger.info("FAL AI response received", { status: response.status });

        const llmOutput: string = response.data?.output ?? "{}";
        try {
          const parsedJson = extractJson(llmOutput);
          
          // Basit validasyon - artık recommendation içeriğini kontrol etmiyoruz çünkü prompt tamamen dışarıdan geliyor
          // Ancak yine de JSON dönmesini bekliyoruz
          
          functions.logger.info("Outfit suggestion completed", { uuid });

          const result: GetOutfitSuggestionResponse = {
            recommendation: parsedJson.recommendation ?? [],
            description: parsedJson.description ?? "",
            category: parsedJson.category ?? "Casual",
            name: parsedJson.name ?? "Stylish Outfit",
            new_quota: newQuota,
          };
          
          return result;
          
        } catch (e: any) {
          functions.logger.error("LLM JSON parse error", { llmOutput, error: e });
          throw new functions.https.HttpsError("internal", "Stil danışmanının cevabı anlaşılamadı. Lütfen tekrar deneyin.");
        }
      } catch (error: any) {
        if (error.code === "resource-exhausted" || error.code === "permission-denied") {
            functions.logger.warn("Quota exhausted", { uuid, feature: "Outfit Suggestion" });
            throw error;
        }
        
        const axiosError = error as AxiosError;
        if (axiosError.response) {
            functions.logger.error("FAL AI API Error", {
                status: axiosError.response.status,
                data: axiosError.response.data
            });
        } else {
            functions.logger.error("FAL AI General Error", { error: error.message });
        }
        
        throw new functions.https.HttpsError("internal", "Kombin önerisi alınırken bir hata oluştu.");
      }
    });
