import { Ollama } from 'ollama';
import { OLLAMA_HOST, LLM_MODEL, EMBEDDING_MODEL } from '../config/ollama';

const ollama = new Ollama({ host: OLLAMA_HOST });

interface OllamaMessage {
    role: string;
    content: string;
}

export async function getLlmResponse(
    messages: OllamaMessage[],
    model: string = LLM_MODEL
): Promise<string> {
    try {
        const response = await ollama.chat({
            model: model,
            messages: messages,
            stream: false,
        });
        return response.message.content;
    } catch (error) {
        console.error('Erro ao chamar o LLM do Ollama:', error);
        throw new Error('Falha ao obter resposta do LLM. Verifique se o Ollama está rodando e o modelo está baixado.');
    }
}

export async function getEmbedding(
    text: string,
    model: string = EMBEDDING_MODEL
): Promise<number[]> {
    try {
        const response = await ollama.embed({
            model: model,
            input: text,
        });
        return response.embeddings[0];
    } catch (error) {
        console.error('Erro ao obter embedding do Ollama:', error);
        throw new Error('Falha ao obter embedding. Verifique se o Ollama está rodando e o modelo está baixado.');
    }
}