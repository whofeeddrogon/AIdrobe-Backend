
export const DEFAULT_CLOTHING_ANALYSIS_PROMPT = `
Analyze the main clothing item in this image. Your response MUST be a valid JSON object.
The JSON object should have three keys: "category", "description", and "name".

Instructions for the model:
1.  For the "category" value, you MUST choose the most appropriate category ONLY from this list: [{{CATEGORY_LIST}}].
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

export const DEFAULT_TRYON_PROMPT = `**GENERATE ONLY A SINGLE, HIGH-FIDELITY IMAGE.**

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

export const DEFAULT_SUGGESTION_PROMPT = `
User Info: {{USER_INFO}}
Wardrobe: {{WARDROBE}}

=================================================================
**USER REQUEST:**
{{USER_REQUEST}}
=================================================================

**YOUR TASK:**
Analyze the **USER REQUEST** provided above. You MUST create an outfit that is perfectly suitable for this specific scenario.
Select the best items from the provided wardrobe to form a coherent and stylish outfit that matches the user's needs (weather, occasion, formality, color theme).

**IMPORTANT RULES:**
- Only use items from the provided wardrobe list
- Each recommended item ID must exist in the provided clothing_items array
- If the wardrobe doesn't have suitable items for the request, suggest the best available alternatives
- **OUTFIT COMPLETENESS RULE**: Every outfit MUST include:
  * EITHER: At least 1 bottom wear (pants/jeans/shorts/skirt) AND at least 1 top wear (t-shirt/shirt/blouse/sweater)
  * OR: 1 full-body garment (dress/jumpsuit) that covers both top and bottom
  * You CANNOT recommend only bottoms, only tops, or only accessories - the outfit must be wearable!
- **CRITICAL LAYERING ORDER**: Order the recommendation array from innermost to outermost layers (bottom to top, inside to outside). This is essential for virtual try-on technology. Follow this sequence:
  1. Base layers (underwear if visible)
  2. Bottom wear (pants, jeans, shorts, skirts)
  3. Top wear base layer (t-shirts, shirts, blouses)
  4. Mid layers (sweaters, vests)
  5. Outer layers (jackets, coats, blazers)
  6. Footwear (shoes, boots, sneakers)
  7. Accessories (hats, scarves, bags, jewelry, sunglasses)

**OUTPUT FORMAT:**
Your response MUST be a single, valid JSON object. Do not add any text, explanations, or markdown formatting before or after the JSON object. The JSON object must contain exactly four keys: "recommendation", "description", "category", and "name".

1. \`recommendation\`: An array of strings ordered by layering sequence (innermost first, outermost last). Each string MUST be the ID of a selected clothing item from the provided wardrobe list.
2. \`description\`: A helpful and stylish explanation **in English** detailing why you chose this combination. It should justify your choices based on the user's request and how the items complement each other.
3. \`category\`: Choose the single most appropriate category for this entire outfit from this list: ["Casual", "Business Casual", "Business Formal", "Smart Casual", "Street Style", "Athletic", "Evening", "Party", "Date Night", "Weekend", "Travel", "Minimalist", "Bohemian", "Classic", "Trendy", "Vintage", "Sporty", "Elegant", "Edgy", "Romantic"].
4. \`name\`: A short, creative title for this specific outfit combination (2 to 4 words).

**EXAMPLE RESPONSE:**
{
  "recommendation": ["ID_23", "ID_34", "ID_76"],
  "description": "I've created a stylish and functional outfit for a cool, rainy day. The water-resistant trench coat will keep you dry, while the wool sweater provides warmth. The dark pants are suitable for an office environment and are less likely to show splashes.",
  "category": "Smart Casual",
  "name": "Rainy Day Office Look"
}
`;
