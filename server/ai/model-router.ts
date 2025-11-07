import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";

// Initialize clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

// Model types
export type TaskComplexity = "high" | "low";

export interface AIConfig {
  complexity: TaskComplexity;
  taskName: string;
}

// Model routing configuration
const MODEL_CONFIG = {
  high: {
    openai: "gpt-4-turbo-preview",
    gemini: "gemini-1.5-pro",
    provider: "openai" as const, // Default to OpenAI for high complexity
  },
  low: {
    openai: "gpt-4o-mini",
    gemini: "gemini-1.5-flash",
    provider: "gemini" as const, // Default to Gemini Flash for low complexity (faster + cheaper)
  },
};

/**
 * Model Router - Intelligently routes AI tasks to the most cost-effective model
 * 
 * High Complexity (GPT-4/Gemini Pro):
 * - SWOT Analysis
 * - Persona Generation
 * - Strategic Planning
 * 
 * Low Complexity (Gemini Flash/GPT-4-mini):
 * - Key Messages
 * - Campaign Ideas
 * - Standalone Actions
 */
export class ModelRouter {
  /**
   * Generate structured JSON response using the appropriate model
   */
  static async generateJSON<T>(
    config: AIConfig,
    systemPrompt: string,
    userPrompt: string,
    schema?: any
  ): Promise<T> {
    const modelConfig = MODEL_CONFIG[config.complexity];

    console.log(
      `[Model Router] Task: ${config.taskName}, Complexity: ${config.complexity}, Provider: ${modelConfig.provider}`
    );

    try {
      if (modelConfig.provider === "openai") {
        return await this.generateWithOpenAI<T>(
          modelConfig.openai,
          systemPrompt,
          userPrompt,
          schema
        );
      } else {
        return await this.generateWithGemini<T>(
          modelConfig.gemini,
          systemPrompt,
          userPrompt
        );
      }
    } catch (error) {
      console.error(`[Model Router] Error with ${modelConfig.provider}:`, error);
      
      // Fallback to alternative provider with correct model
      const fallbackProvider = modelConfig.provider === "openai" ? "gemini" : "openai";
      const fallbackModel = fallbackProvider === "openai" ? modelConfig.openai : modelConfig.gemini;
      
      console.log(`[Model Router] Falling back to ${fallbackProvider} with model ${fallbackModel}`);
      
      if (fallbackProvider === "openai") {
        return await this.generateWithOpenAI<T>(
          fallbackModel,
          systemPrompt,
          userPrompt,
          schema
        );
      } else {
        return await this.generateWithGemini<T>(
          fallbackModel,
          systemPrompt,
          userPrompt
        );
      }
    }
  }

  /**
   * Generate with OpenAI using structured outputs
   */
  private static async generateWithOpenAI<T>(
    model: string,
    systemPrompt: string,
    userPrompt: string,
    schema?: any
  ): Promise<T> {
    const messages: any[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    const params: any = {
      model,
      messages,
      temperature: 0.7,
    };

    // Use response_format for structured JSON output
    if (schema) {
      params.response_format = {
        type: "json_schema",
        json_schema: {
          name: "response",
          strict: true,
          schema,
        },
      };
    } else {
      params.response_format = { type: "json_object" };
    }

    const completion = await openai.chat.completions.create(params);
    const content = completion.choices[0].message.content;

    if (!content) {
      throw new Error("No content in OpenAI response");
    }

    return JSON.parse(content);
  }

  /**
   * Generate with Gemini
   */
  private static async generateWithGemini<T>(
    modelName: string,
    systemPrompt: string,
    userPrompt: string
  ): Promise<T> {
    const prompt = `${systemPrompt}\n\n${userPrompt}\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no explanations, just the JSON object.`;

    const result = await genAI.models.generateContent({
      model: modelName,
      contents: prompt,
    });

    const text = result.text;

    // Clean up markdown code blocks if present
    let jsonText = text.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.substring(7);
    }
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.substring(3);
    }
    if (jsonText.endsWith("```")) {
      jsonText = jsonText.substring(0, jsonText.length - 3);
    }

    return JSON.parse(jsonText.trim());
  }

  /**
   * Generate streaming response (for chat interface)
   */
  static async generateStream(
    config: AIConfig,
    systemPrompt: string,
    userPrompt: string
  ): AsyncGenerator<string> {
    const modelConfig = MODEL_CONFIG[config.complexity];

    if (modelConfig.provider === "openai") {
      return this.streamWithOpenAI(modelConfig.openai, systemPrompt, userPrompt);
    } else {
      return this.streamWithGemini(modelConfig.gemini, systemPrompt, userPrompt);
    }
  }

  private static async *streamWithOpenAI(
    model: string,
    systemPrompt: string,
    userPrompt: string
  ): AsyncGenerator<string> {
    const stream = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      stream: true,
      temperature: 0.7,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  }

  private static async *streamWithGemini(
    modelName: string,
    systemPrompt: string,
    userPrompt: string
  ): AsyncGenerator<string> {
    const prompt = `${systemPrompt}\n\n${userPrompt}`;

    const result = await genAI.models.generateContentStream({
      model: modelName,
      contents: prompt,
    });

    for await (const chunk of result) {
      const text = chunk.text;
      if (text) {
        yield text;
      }
    }
  }
}
