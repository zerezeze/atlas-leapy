import { sendMessageAction } from '../actions/send-message';
import { RagResponsePayload } from '@/features/rag/schemas/rag-response-schema';

export const chatService = {
  /**
   * Envia uma mensagem do usuário para a Server Action,
   * atuando como fachada para isolar a UI da implementação de chamadas.
   */
  async sendMessage(question: string): Promise<RagResponsePayload> {
    try {
      const response = await sendMessageAction(question);
      return response;
    } catch (error: unknown) {
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Falha na comunicação com o servidor.'
      );
    }
  },

  /**
   * Envia a mensagem consumindo a versão Server Action de Streaming (streamObject).
   * Chama onUpdate a cada chunck JSON parcial que chega.
   */
  async streamMessage(
    question: string,
    onUpdate: (partial: Partial<RagResponsePayload>) => void,
    conversationId?: string
  ) {
    try {
      const { sendMessageStreamAction } =
        await import('../actions/send-message');
      const { readStreamableValue } = await import('@ai-sdk/rsc');

      const {
        objectStream,
        sources,
        retrievalScore,
        hasContext,
        conversationId: newConvId,
      } = await sendMessageStreamAction(question, conversationId);

      let finalAnswer = '';
      let finalExplanation = '';

      for await (const partial of readStreamableValue(objectStream)) {
        if (partial) {
          if (partial.answer) finalAnswer = partial.answer;
          if (partial.explanation) finalExplanation = partial.explanation;
          onUpdate(partial as Partial<RagResponsePayload>);
        }
      }

      return {
        answer: finalAnswer,
        explanation: finalExplanation,
        sources,
        retrievalScore,
        hasContext,
        conversationId: newConvId,
      };
    } catch (error: unknown) {
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Falha na comunicação de streaming com o servidor.'
      );
    }
  },
};
