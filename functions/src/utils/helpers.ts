
/**
 * Extracts and parses a JSON object from a string that might contain other text or markdown.
 * @param text The string containing the JSON.
 * @returns The parsed object.
 * @throws Error if JSON cannot be found or parsed.
 */
export function extractJson(text: string): any {
  // 1. Try to find JSON within markdown code blocks (```json ... ```)
  const markdownMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (markdownMatch) {
    try {
      return JSON.parse(markdownMatch[1]);
    } catch (e) {
      // If parsing fails, continue to other methods
      console.warn("Failed to parse JSON from markdown block, trying fallback...");
    }
  }

  // 2. Try to find the first '{' and the last '}'
  // Note: This assumes a single top-level JSON object.
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const jsonString = text.substring(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(jsonString);
    } catch (e) {
       // 3. If that fails, it might be because of multiple JSONs or bad formatting.
       // We could try a non-greedy match or just fail.
       // For now, let's try to clean up common issues like newlines in strings if needed, 
       // but usually JSON.parse is strict.
       throw new Error(`JSON parsing failed: ${e}`);
    }
  }

  throw new Error("No valid JSON found in text.");
}
