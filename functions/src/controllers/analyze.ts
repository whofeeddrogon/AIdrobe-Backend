import * as functions from "firebase-functions/v1";
import axios from "axios";
import { falKey, runtimeOptions } from "../config";
import { checkOrUpdateQuota } from "../utils/quota";
import { AnalyzeRequestData } from "../types";

/**
 * 1. KIYAFET ANALİZİ
 */
export const analyzeClothingImage = functions
    .runWith(runtimeOptions)
    .https.onCall(async (payload: any, context: functions.https.CallableContext) => {
      
      const data: AnalyzeRequestData = payload.data || payload; 
      const { uuid, image_base_64 } = data;

      if (!uuid || !image_base_64) {
        throw new functions.https.HttpsError("invalid-argument", "Gerekli parametreler eksik (uuid, image_base_64).");
      }

      try {
        const newQuota = await checkOrUpdateQuota(uuid, "remainingClothAnalysis");

        const categoryList = [
          "T-Shirt", "Shirt", "Sweater", "Sweatshirt / Hoodie", "Blouse",
          "Pants", "Jeans", "Shorts", "Skirt",
          "Jacket", "Coat", "Blazer", "Vest",
          "Dress", "Jumpsuit",
          "Shoes", "Boots", "Sneakers", "Heels",
          "Hat", "Bag", "Belt", "Jewelry", "Scarf", "Sunglasses",
        ].join(", ");

        const prompt = `
          Analyze the main clothing item in this image. Your response MUST be a valid JSON object.
          The JSON object should have three keys: "category", "description", and "name".

          Instructions for the model:
          1.  For the "category" value, you MUST choose the most appropriate category ONLY from this list: [${categoryList}].
          2.  For the "description" value, provide a single, comprehensive paragraph in English. This paragraph must describe the item's physical details (material, fit, color, patterns) AND its context (formality level, suitable occasions, and appropriate weather conditions).
          3.  For the "name" value, provide a short, concise title for the item (e.g., "Red Cotton T-Shirt", "Blue Denim Jeans", "Floral Summer Dress"). It should be 2-3 words long. DO NOT use quotation marks ("") within the name.
          4.  CRITICAL RULE: Your description must ONLY be about the garment. DO NOT mention the background, the surface it is on, or how it is positioned (e.g., "laid flat", "on a hanger"). Focus strictly on the item's own features.
          5.  IMPORTANT: When describing text printed on the clothing, DO NOT use quotation marks (""). Instead, write the text directly without quotes. For example, if a shirt says "JUST DO IT", write: The shirt displays the text JUST DO IT in bold letters. WRONG: "The t-shirt has the phrase "GOOD VIBES ONLY" printed", CORRECT: "The t-shirt has the phrase GOOD VIBES ONLY printed"

          Example JSON response:
          {
            "category": "Shirt",
            "description": "A white, long-sleeved shirt made of a smooth, possibly cotton material. It features a classic collar, a button-down front, and a regular fit. This piece is suitable for casual or smart casual occasions in mild weather.",
            "name": "White Long-Sleeved Shirt"
          }
          
          Example with text on clothing:
          {
            "category": "T-Shirt",
            "description": "A black cotton t-shirt with the text RIDE ME NUTS printed on the front in bold white letters. The shirt has a crew neck and short sleeves, suitable for casual wear in warm weather.",
            "name": "Black Graphic T-Shirt"
          }
        `;
        
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
          console.error(`fal-ai/birefnet/v2 HATA: response:`, bgResponse);
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
            const jsonMatch = llmOutput.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
              throw new Error("Cevapta geçerli bir JSON objesi bulunamadı.");
            }
            
            let jsonString = jsonMatch[0];
            const parsedJson = JSON.parse(jsonString);

            return { ...parsedJson, image_url: bgRemovedImageUrl, newQuota };
        } catch (e: any) {
            console.error("LLM JSON parse hatası:", llmOutput, e);
            throw new functions.https.HttpsError("internal", "Yapay zekanın cevabı anlaşılamadı. Lütfen tekrar deneyin.");
        }
      } catch (error: any) {
        if (error.code === "resource-exhausted" || error.code === "permission-denied") {
            throw error;
        }
        console.error("Fal API hatası (analyzeClothingImage):", error);
        throw new functions.https.HttpsError("internal", "Kıyafet analizi sırasında bir hata oluştu.");
      }
    });
