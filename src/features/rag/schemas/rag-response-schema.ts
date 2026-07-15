import { z } from 'zod';

// Validação estrita para o que recebemos de volta do provedor LLM
export const llmResponseSchema = z.object({
  answer: z
    .string()
    .min(1, 'A resposta principal (answer) não pode ser vazia.'),
  explanation: z
    .string()
    .min(1, 'A explicação (explanation) não pode ser vazia.'),
});

// Contrato final que será repassado ao Frontend
export const ragResponseSchema = z.object({
  answer: z.string(),
  explanation: z.string(),
  sources: z.array(
    z.object({
      title: z.string(),
      source: z.string(),
      chunkIndex: z.number().optional(),
      content: z.string().optional(),
    })
  ),
  retrievalScore: z.number(),
  hasContext: z.boolean(),
});

export type LlmResponsePayload = z.infer<typeof llmResponseSchema>;
export type RagResponsePayload = z.infer<typeof ragResponseSchema>;
