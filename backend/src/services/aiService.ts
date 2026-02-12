import OpenAI from 'openai';
import { ExtractedValues } from '../types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class AIService {
  /**
   * Extract label information from an image using GPT-4 Vision
   */
  async extractLabelInfo(imageBase64: string): Promise<ExtractedValues> {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `You are analyzing an alcohol beverage label. Extract the following information EXACTLY as it appears on the label:

1. Brand Name
2. Class/Type (e.g., "Kentucky Straight Bourbon Whiskey", "Premium Vodka")
3. Alcohol Content (e.g., "40% Alc./Vol.", "80 Proof")
4. Net Contents (e.g., "750 mL", "1 L")
5. Government Warning (the complete warning text - this is CRITICAL)

Return ONLY a JSON object with these exact keys (no other text):
{
  "brandName": "...",
  "classType": "...",
  "alcoholContent": "...",
  "netContents": "...",
  "governmentWarning": "..."
}

IMPORTANT: 
- Extract text EXACTLY as shown, preserving capitalization and punctuation
- For the government warning, include the complete text starting with "GOVERNMENT WARNING:"
- If any field is not visible or unclear, use "NOT FOUND" as the value`,
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 500,
        temperature: 0, // Deterministic output
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      // Parse the JSON response
      const extracted = this.parseExtractedData(content);
      return extracted;
    } catch (error) {
      console.error('Error extracting label info:', error);
      throw new Error(
        `Failed to extract label information: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Parse the JSON response from GPT-4 Vision
   */
  private parseExtractedData(content: string): ExtractedValues {
    try {
      // Remove markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/```\n?/g, '');
      }

      // Check if GPT-4 couldn't extract (returned a message instead of JSON)
      if (!cleanContent.startsWith('{')) {
        console.warn('GPT-4 could not extract label data. Response:', cleanContent);
        // Return "NOT FOUND" for all fields
        return {
          brandName: 'NOT FOUND',
          classType: 'NOT FOUND',
          alcoholContent: 'NOT FOUND',
          netContents: 'NOT FOUND',
          governmentWarning: 'NOT FOUND',
        };
      }

      const parsed = JSON.parse(cleanContent);

      // Validate required fields
      const required = ['brandName', 'classType', 'alcoholContent', 'netContents', 'governmentWarning'];
      for (const field of required) {
        if (!(field in parsed)) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      return {
        brandName: parsed.brandName || 'NOT FOUND',
        classType: parsed.classType || 'NOT FOUND',
        alcoholContent: parsed.alcoholContent || 'NOT FOUND',
        netContents: parsed.netContents || 'NOT FOUND',
        governmentWarning: parsed.governmentWarning || 'NOT FOUND',
      };
    } catch (error) {
      console.error('Error parsing extracted data:', error);
      console.error('Content:', content);
      
      // If parsing fails, return NOT FOUND instead of crashing
      // This handles edge cases where the image isn't a proper label
      return {
        brandName: 'NOT FOUND',
        classType: 'NOT FOUND',
        alcoholContent: 'NOT FOUND',
        netContents: 'NOT FOUND',
        governmentWarning: 'NOT FOUND',
      };
    }
  }
}

export const aiService = new AIService();