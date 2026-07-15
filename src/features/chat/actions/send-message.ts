'use server';

import { ragService } from '@/features/rag/services/rag-service';
import { RagResponsePayload } from '@/features/rag/schemas/rag-response-schema';

import { auth } from '@/auth';

/**
 * Server Action que recebe a pergunta da UI, valida e aciona o RAG de forma segura.
 * Por rodar no servidor, as chaves de API (OpenAI/Supabase) nunca vazam para o cliente.
 */
export async function sendMessageAction(
  question: string
): Promise<RagResponsePayload> {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Não autorizado.');
  }

  if (!question || typeof question !== 'string') {
    throw new Error('Pergunta inválida fornecida.');
  }

  try {
    const organizationId = session.user.organizationId;
    const response = await ragService.generateResponse({
      question,
      organizationId,
    });
    return response;
  } catch (error: unknown) {
    console.error('[ServerAction sendMessageAction] Erro:', error);
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Ocorreu um erro interno ao processar sua pergunta.'
    );
  }
}

import { ragStreamService } from '@/features/rag/services/rag-stream-service';
import { createStreamableValue } from '@ai-sdk/rsc';
import { conversationService } from '@/features/conversations/services/conversation-service';

export async function sendMessageStreamAction(
  question: string,
  conversationId?: string
) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Não autorizado.');
  }

  if (!question || typeof question !== 'string') {
    throw new Error('Pergunta inválida fornecida.');
  }

  try {
    const organizationId = session.user.organizationId;
    const conversation = await conversationService.ensureConversation(
      organizationId,
      conversationId,
      question,
      session.user.id
    );
    await conversationService.addMessage(conversation.id, 'user', question);

    const { stream, sources, retrievalScore, hasContext } =
      await ragStreamService.generateStreamResponse({
        question,
        organizationId,
      });

    const streamable = createStreamableValue();

    if (!hasContext || !stream) {
      const fallbackAnswer =
        'Não encontrei essa informação na base de conhecimento disponível.';
      const fallbackExplanation =
        'Nenhum documento relevante foi encontrado para a pergunta feita.';

      streamable.done({
        answer: fallbackAnswer,
        explanation: fallbackExplanation,
      });

      await conversationService.addMessage(
        conversation.id,
        'assistant',
        fallbackAnswer,
        'completed'
      );

      return {
        conversationId: conversation.id,
        objectStream: streamable.value,
        sources,
        retrievalScore,
        hasContext,
      };
    }

    // Processa o stream no background de forma assíncrona
    (async () => {
      let finalAnswer = '';
      let finalExplanation = '';
      try {
        for await (const partialObject of stream.partialObjectStream) {
          streamable.update(partialObject);
          if (partialObject.answer) finalAnswer = partialObject.answer;
          if (partialObject.explanation)
            finalExplanation = partialObject.explanation;
        }
        streamable.done();

        await conversationService.addMessage(
          conversation.id,
          'assistant',
          finalAnswer,
          'completed',
          sources,
          retrievalScore,
          { explanation: finalExplanation } // Storing explanation in metadata just in case
        );
      } catch (err) {
        streamable.error(err);
        await conversationService.addMessage(
          conversation.id,
          'assistant',
          'Ocorreu um erro ao gerar a resposta.',
          'error',
          sources,
          retrievalScore
        );
      }
    })();

    return {
      conversationId: conversation.id,
      objectStream: streamable.value,
      sources,
      retrievalScore,
      hasContext,
    };
  } catch (error: unknown) {
    console.error('[ServerAction sendMessageStreamAction] Erro:', error);
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Ocorreu um erro interno ao processar sua pergunta em modo stream.'
    );
  }
}
