import * as functions from "firebase-functions/v1";
import axios, { AxiosError } from "axios";
import { falKey, runtimeOptions } from "../config";
import { checkOrUpdateQuota } from "../utils/quota";
import { TryOnRequestData, VirtualTryOnResponse } from "../types";
import { getRemoteConfigValue } from "../utils/remoteConfig";
import { DEFAULT_TRYON_PROMPT } from "../utils/constants";

/**
 * 2. SANAL DENEME
 */
export const virtualTryOn = functions
	.runWith(runtimeOptions)
	.https.onCall(async (payload: any, context: functions.https.CallableContext): Promise<VirtualTryOnResponse> => {
		const data: TryOnRequestData = payload.data || payload;
		const { uuid, pose_image_base_64, clothing_items, model_type } = data;
		// Artık sadece array kabul ediyoruz
		const clothingImages = clothing_items.map((item) => item.base64) || [];

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

            const proPrompt = await getRemoteConfigValue("tryon_pro_prompt", DEFAULT_TRYON_PROMPT);

			// Model seçimi ve mantığı
			// 1. Nano Banana Pro: 3+ kıyafet VEYA model_type='nano-banana-pro'
			// 2. Nano Banana: 2 kıyafet
			// 3. Legacy: 1 kıyafet

			// Ortak resim listesi hazırlığı (Pose + Kıyafetler) - Nano Banana modelleri için
			const allImages = [`data:image/jpeg;base64,${pose_image_base_64}`, ...clothingImages.map((img) => `data:image/jpeg;base64,${img}`)];

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
							Authorization: `Key ${apiKey}`,
							"Content-Type": "application/json",
						},
					}
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
							Authorization: `Key ${apiKey}`,
							"Content-Type": "application/json",
						},
					}
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
							Authorization: `Key ${apiKey}`,
							"Content-Type": "application/json",
						},
					}
				);

				console.log("FAL AI Standard Virtual Try-On response alındı:", response.status);
				resultImageUrl = response.data?.images?.[0]?.url;
			}

			if (!resultImageUrl) {
				// Hata durumunda loglama biraz daha detaylı olabilir çünkü response yapısı modele göre değişebilir
				throw new functions.https.HttpsError("internal", "Sanal deneme sonucu oluşturulamadı. Lütfen tekrar deneyin.");
			}

			console.log(`Virtual try-on başarıyla tamamlandı - User: ${uuid}`);

			// Outfit analizi için LLM çağrısı
			let outfitAnalysis = {
				name: "",
				description: "",
				category: "",
			};

			try {
				if (!clothing_items || clothing_items.length === 0) {
					throw new Error("clothing_items is empty");
				}

				console.log("Outfit analizi başlatılıyor...");

				const clothingItemsInfo = clothing_items
					.map((item, index) => `${index + 1}. ${item.name || "Item"} (${item.category || "Unknown"}): ${item.description || "No description"}`)
					.join("\n");

				const outfitAnalysisPrompt = `Analyze the outfit created by combining the following clothing items. Your response MUST be a valid JSON object with three keys: "name", "description", and "category".

                    Clothing Items in the Outfit:
                    ${clothingItemsInfo}

                    Instructions:
                    1. For the "name" value, provide a short, catchy name for this outfit combination (2-4 words). Examples: "Casual Summer Look", "Business Casual Ensemble", "Street Style Outfit", "Elegant Evening Attire".
                    2. For the "description" value, provide a comprehensive paragraph in English that:
                    - Describes how the outfit looks as a whole
                    - Highlights what the combination emphasizes (e.g., colors, style, formality level)
                    - Mentions the overall aesthetic and vibe
                    - Notes any standout features or how the pieces work together
                    3. For the "category" value, choose the most appropriate category from this list: ["Casual", "Business Casual", "Business Formal", "Smart Casual", "Street Style", "Athletic", "Evening", "Party", "Date Night", "Weekend", "Travel", "Minimalist", "Bohemian", "Classic", "Trendy", "Vintage", "Sporty", "Elegant", "Edgy", "Romantic"].

                    Example JSON response:
                    {
                    "name": "Casual Summer Look",
                    "description": "This outfit combines a relaxed white t-shirt with blue denim jeans, creating a timeless casual summer ensemble. The combination emphasizes comfort and effortless style, perfect for warm weather activities. The neutral color palette allows for versatile styling, while the classic pieces work together to create a clean, approachable aesthetic.",
                    "category": "Casual"
                    }

                    CRITICAL: Your response must be ONLY a valid JSON object. Do not include any text before or after the JSON.`;

				const llmResponse = await axios.post(
					"https://fal.run/fal-ai/any-llm/enterprise",
					{
						model: "google/gemini-2.5-flash",
						prompt: outfitAnalysisPrompt,
						max_tokens: 512,
						temperature: 0.7,
					},
					{
						headers: {
							Authorization: `Key ${apiKey}`,
							"Content-Type": "application/json",
						},
					}
				);

				const llmOutput: string = llmResponse.data?.output ?? "{}";
				const jsonMatch = llmOutput.match(/\{[\s\S]*\}/);

				if (jsonMatch) {
					const parsedAnalysis = JSON.parse(jsonMatch[0]);
					outfitAnalysis = {
						name: parsedAnalysis.name || "Outfit",
						description: parsedAnalysis.description || "",
						category: parsedAnalysis.category || "Casual",
					};
					console.log("Outfit analizi başarıyla tamamlandı:", outfitAnalysis);
				} else {
					console.warn("LLM'den geçerli JSON alınamadı, varsayılan değerler kullanılıyor");
				}
			} catch (analysisError: any) {
				console.error("Outfit analizi hatası (devam ediliyor):", analysisError);
				// Analiz hatası olsa bile try-on sonucunu döndürüyoruz
			}

			const result = {
				result_image_url: resultImageUrl,
				name: outfitAnalysis.name,
				description: outfitAnalysis.description,
				category: outfitAnalysis.category,
				new_quota: newQuota,
			};

            return result;
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
					headers: axiosError.response.headers,
				});
			} else if (axiosError.request) {
				console.error("FAL AI Virtual Try-On network hatası:", axiosError.request);
			} else {
				console.error("FAL AI Virtual Try-On genel hatası:", error.message);
			}

			throw new functions.https.HttpsError("internal", "Sanal deneme sırasında bir hata oluştu. Lütfen tekrar deneyin.");
		}
	});
