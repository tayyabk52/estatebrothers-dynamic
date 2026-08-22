"use server";

import { GoogleGenAI, Type } from "@google/genai";
import { requireAdmin } from "@/lib/admin/auth";

export interface AIListingFacts {
  listing_type_slug: string;
  phase: string;
  city: string;
  block: string;
  project: string;
  size_label: string;
  price_label: string;
  bedrooms: string;
  bathrooms: string;
}

export interface AIGeneratedContent {
  title: string;
  summary: string;
  description: string;
  meta_title: string;
  meta_description: string;
}

export async function generateListingSEOData(facts: AIListingFacts): Promise<{ data?: AIGeneratedContent; error?: string }> {
  // Ensure only authenticated admins can call the AI
  await requireAdmin();

  if (!process.env.GEMINI_API_KEY) {
    return { error: "GEMINI_API_KEY is not configured on the server." };
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const prompt = `You are an expert Pakistani real estate copywriter specializing in DHA Lahore and high-end property listings.
Write high-converting, professional, and factually accurate SEO content for a property listing.

Here are the raw facts for the property:
- Type: ${facts.listing_type_slug}
- City: ${facts.city}
- Phase: ${facts.phase}
- Block: ${facts.block}
- Project: ${facts.project}
- Size: ${facts.size_label}
- Price: ${facts.price_label}
- Bedrooms: ${facts.bedrooms}
- Bathrooms: ${facts.bathrooms}

Instructions:
1. 'title': A clean, readable listing title (e.g., "1 Kanal Modern House in DHA Phase 6"). Max 70 chars.
2. 'summary': A punchy 1-2 sentence overview for feed cards.
3. 'description': A detailed, persuasive description of the property. Avoid generic filler like "hot deal" or "golden opportunity". Focus on lifestyle, investment value, location perks, and factual features. Use line breaks.
4. 'meta_title': An SEO-optimized title tag (Recommended 50-60 chars, max 70).
5. 'meta_description': An SEO-optimized meta description (Recommended 130-160 chars, max 180).

Return ONLY the structured JSON matching the requested schema.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "Listing title (max 70 chars)",
            },
            summary: {
              type: Type.STRING,
              description: "Brief 1-2 sentence overview",
            },
            description: {
              type: Type.STRING,
              description: "Detailed description of features and selling points",
            },
            meta_title: {
              type: Type.STRING,
              description: "SEO Meta title (max 70 chars)",
            },
            meta_description: {
              type: Type.STRING,
              description: "SEO Meta description (max 180 chars)",
            },
          },
          required: ["title", "summary", "description", "meta_title", "meta_description"],
        },
      },
    });

    if (!response.text) {
      throw new Error("Empty response from AI");
    }

    const parsed = JSON.parse(response.text) as AIGeneratedContent;
    return { data: parsed };
  } catch (err: any) {
    console.error("AI Generation Error:", err);
    return { error: err.message || "Failed to generate content." };
  }
}
