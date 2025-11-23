import * as functions from "firebase-functions/v1";
import axios, { AxiosError } from "axios";
import { falKey, runtimeOptions } from "../config";
import { checkOrUpdateQuota } from "../utils/quota";
import { SuggestionRequestData } from "../types";

/**
 * 3. KOMBİN ÖNERİSİ
 */
export const getOutfitSuggestion = functions
    .runWith(runtimeOptions)
    .https.onCall(async (payload: any, context: functions.https.CallableContext) => {
      
      const data: SuggestionRequestData = payload.data || payload;
      const { adapty_user_id, user_request, clothing_items } = data;

      if (!adapty_user_id || !user_request || !Array.isArray(clothing_items)) {
        throw new functions.https.HttpsError("invalid-argument", "Gerekli parametreler eksik (adapty_user_id, user_request, clothing_items).");
      }

      if (clothing_items.length < 10) {
        throw new functions.https.HttpsError("invalid-argument", "Kombin önerisi için gardırobunuzda en az 10 kıyafet bulunmalıdır. Şu anda " + clothing_items.length + " kıyafetiniz var.");
      }

      try {
        console.log(`Outfit suggestion başlatılıyor - User: ${adapty_user_id}, Items: ${clothing_items.length}`);
        
        await checkOrUpdateQuota(adapty_user_id, "remainingSuggestions");

        const clothingJsonArray = JSON.stringify(clothing_items, null, 2);
        
        const finalPrompt = `You are an expert fashion stylist. Your task is to create an outfit combination from a provided list of clothes based on a user's request.

**USER REQUEST:**
"${user_request}"

**AVAILABLE CLOTHES (WARDROBE):**
${clothingJsonArray}

**YOUR TASK:**
Analyze the user's request and the detailed descriptions of all available clothes. Select the best items to form a coherent and stylish outfit that matches the user's needs (like weather, occasion, or color theme).

**IMPORTANT RULES:**
- Only use items from the provided wardrobe list
- Each recommended item ID must exist in the provided clothing_items array
- If the wardrobe doesn't have suitable items for the request, suggest the best available alternatives
- **OUTFIT COMPLETENESS RULE**: Every outfit MUST include:
  * EITHER: At least 1 bottom wear (pants/jeans/shorts/skirt) AND at least 1 top wear (t-shirt/shirt/blouse/sweater)
  * OR: 1 full-body garment (dress/jumpsuit) that covers both top and bottom
  * You CANNOT recommend only bottoms, only tops, or only accessories - the outfit must be wearable!
  * Example valid: ["jeans_ID", "shirt_ID"]
  * Example valid: ["dress_ID", "jacket_ID"]
  * Example INVALID: ["skirt_ID", "pants_ID"] (only bottoms, no top)
  * Example INVALID: ["hat_ID", "bag_ID"] (only accessories)
- **CRITICAL LAYERING ORDER**: Order the recommendation array from innermost to outermost layers (bottom to top, inside to outside). This is essential for virtual try-on technology. Follow this sequence:
  1. Base layers (underwear if visible)
  2. Bottom wear (pants, jeans, shorts, skirts)
  3. Top wear base layer (t-shirts, shirts, blouses)
  4. Mid layers (sweaters, vests)
  5. Outer layers (jackets, coats, blazers)
  6. Footwear (shoes, boots, sneakers)
  7. Accessories (hats, scarves, bags, jewelry, sunglasses)
  Example correct order: ["pants_ID", "shirt_ID", "jacket_ID", "shoes_ID", "hat_ID"]
  Example WRONG order: ["jacket_ID", "shirt_ID", "pants_ID"]

**OUTPUT FORMAT:**
Your response MUST be a single, valid JSON object. Do not add any text, explanations, or markdown formatting before or after the JSON object. The JSON object must contain exactly two keys: "recommendation" and "description".

1.  \`recommendation\`: An array of strings ordered by layering sequence (innermost first, outermost last). Each string MUST be the ID of a selected clothing item from the provided wardrobe list.
2.  \`description\`: A helpful and stylish explanation **in English** detailing why you chose this combination. It should justify your choices based on the user's request and how the items complement each other.

**EXAMPLE RESPONSE:**
{
  "recommendation": ["ID_23", "ID_34", "ID_76"],
  "description": "I've created a stylish and functional outfit for a cool, rainy day. The water-resistant trench coat will keep you dry, while the wool sweater provides warmth. The dark pants are suitable for an office environment and are less likely to show splashes."
}`;

        console.log("FAL AI Outfit Suggestion API'sine istek gönderiliyor...");
        
        const apiKey = falKey.value();
        
        const response = await axios.post(
            "https://fal.run/fal-ai/any-llm/enterprise",
            { 
              model: "google/gemini-2.5-flash",
              prompt: finalPrompt,
              max_tokens: 1024,
              temperature: 0.7,
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
          
          if (!parsedJson.recommendation || !parsedJson.description) {
            throw new Error("Response eksik alanlar içeriyor: 'recommendation' veya 'description' bulunamadı.");
          }
          
          if (!Array.isArray(parsedJson.recommendation) || parsedJson.recommendation.length === 0) {
            throw new Error("Recommendation array boş veya geçersiz.");
          }

          console.log(`Outfit suggestion başarıyla tamamlandı - User: ${adapty_user_id}, Recommended items: ${parsedJson.recommendation.length}`);
          return parsedJson;
          
        } catch (e: any) {
          console.error("LLM JSON parse hatası:", llmOutput, e);
          throw new functions.https.HttpsError("internal", "Stil danışmanının cevabı anlaşılamadı. Lütfen tekrar deneyin.");
        }
      } catch (error: any) {
        if (error.code === "resource-exhausted" || error.code === "permission-denied") {
            console.log(`Quota exhausted for user ${adapty_user_id} - Outfit Suggestion`);
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
