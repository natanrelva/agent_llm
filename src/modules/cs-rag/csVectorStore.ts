// src/modules/cs-rag/csVectorStore.ts
import fs from 'fs/promises';
import path from 'path';
import { getEmbedding } from '../utils/ollamaClient';

interface Document {
    content: string;
    embedding: number[];
}

let csDocuments: Document[] = [];
// Ajuste o caminho para a base de conhecimento. __dirname aponta para 'dist/modules/cs-rag' após a compilação,
// então precisamos subir dois níveis para a raiz do projeto (onde public/src estariam se fosse um monorepo real)
// e então acessar 'src/modules/cs-rag' para encontrar 'knowledge_base_cs.txt'.
// No entanto, para o ambiente de execução em 'dist', o caminho correto seria:
// __dirname (dist/modules/cs-rag) -> .. (dist/modules) -> .. (dist) -> src/modules/cs-rag/knowledge_base_cs.txt
// Isso está incorreto. O arquivo knowledge_base_cs.txt deve estar no mesmo diretório que o csVectorStore.ts no código fonte.
// Quando compilado, ele deve ser copiado para 'dist/modules/cs-rag'.
// Assumindo que knowledge_base_cs.txt será copiado para 'dist/modules/cs-rag' pelo processo de build,
// o caminho deve ser relativo ao próprio arquivo compilado.
const KNOWLEDGE_BASE_CS_PATH = path.join(__dirname, 'knowledge_base_cs.txt');


/**
 * Calcula a similaridade de cossenos entre dois vetores.
 * @param vecA O primeiro vetor.
 * @param vecB O segundo vetor.
 * @returns Um valor entre -1 e 1, onde 1 indica similaridade máxima.
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    // Calcula o produto escalar e as magnitudes
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        magnitudeA += vecA[i] * vecA[i];
        magnitudeB += vecB[i] * vecB[i];
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    // Evita divisão por zero
    if (magnitudeA === 0 || magnitudeB === 0) {
        return 0;
    }

    return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Divide um texto longo em "chunks" (pedaços) menores.
 * @param text O texto a ser dividido.
 * @param chunkSize O tamanho máximo de cada chunk.
 * @param chunkOverlap A quantidade de caracteres de sobreposição entre chunks.
 * @returns Um array de strings, onde cada string é um chunk.
 */
function splitTextIntoChunks(text: string, chunkSize: number, chunkOverlap: number): string[] {
    const chunks: string[] = [];
    const lines = text.split('\n');
    let currentChunk = '';

    for (const line of lines) {
        // Se adicionar a linha atual exceder o chunkSize e já houver algo no chunk, finalize o chunk atual
        if ((currentChunk + line).length > chunkSize && currentChunk.length > 0) {
            chunks.push(currentChunk.trim());
            // Inicia o próximo chunk com uma sobreposição
            currentChunk = currentChunk.substring(currentChunk.length - chunkOverlap).trim() + ' ' + line;
        } else {
            // Adiciona a linha ao chunk atual
            currentChunk += (currentChunk.length > 0 ? '\n' : '') + line;
        }
    }

    // Adiciona o último chunk, se houver
    if (currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
    }

    return chunks;
}

/**
 * Inicializa o Vector Store do Agente de Atendimento ao Cliente (CS) carregando a base de conhecimento.
 * Lê o arquivo de texto, divide em chunks e gera embeddings para cada chunk.
 */
export async function initializeCsVectorStore() {
    try {
        const knowledgeText = await fs.readFile(KNOWLEDGE_BASE_CS_PATH, 'utf-8');
        console.log("--- Agente CS - Construindo Vectorstore para RAG (pode levar alguns segundos)... ---");
        // Ajuste chunkSize e chunkOverlap conforme a necessidade para otimizar o RAG
        const chunks = splitTextIntoChunks(knowledgeText, 500, 100); // 500 caracteres, 100 de sobreposição
        csDocuments = []; // Limpa documentos existentes antes de recarregar
        for (const chunk of chunks) {
            const embedding = await getEmbedding(chunk);
            csDocuments.push({ content: chunk, embedding });
        }
        console.log(`--- Agente CS - Vectorstore construído com ${csDocuments.length} documentos. ---`);
    } catch (error) {
        // Verifica se o erro é de arquivo não encontrado
        if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
            console.warn(`AVISO: Arquivo de base de conhecimento '${KNOWLEDGE_BASE_CS_PATH}' não encontrado. O RAG do Agente CS pode não funcionar como esperado.`);
        } else {
            console.error('Erro ao inicializar o Vector Store do Agente CS:', error);
            throw error; // Lança outros erros inesperados
        }
    }
}

/**
 * Adiciona uma nova pergunta e resposta à base de conhecimento e recarrega o Vector Store.
 * @param question A pergunta a ser adicionada.
 * @param answer A resposta correspondente.
 */
export async function addQaToKnowledgeBase(question: string, answer: string): Promise<void> {
    const newEntry = `\n\nFAQ: ${question}\nResposta: ${answer}`;
    try {
        await fs.appendFile(KNOWLEDGE_BASE_CS_PATH, newEntry, 'utf-8');
        console.log(`--- Agente CS - Nova Q&A adicionada à base de conhecimento. Recarregando Vectorstore... ---`);
        // Recarrega o store para incluir a nova informação imediatamente
        await initializeCsVectorStore();
        console.log(`--- Agente CS - Vectorstore recarregado com sucesso. ---`);
    } catch (error) {
        console.error('Erro ao adicionar Q&A à base de conhecimento:', error);
    }
}

/**
 * Pesquisa na base de conhecimento por informações relevantes à query.
 * @param query A consulta do usuário.
 * @param k O número de resultados mais relevantes a serem retornados (padrão: 3).
 * @returns Um array de strings com o conteúdo dos documentos mais relevantes.
 */
export async function searchCsKnowledgeBase(query: string, k: number = 3): Promise<string[]> {
    // Garante que o Vector Store esteja inicializado antes de pesquisar
    if (csDocuments.length === 0) {
        await initializeCsVectorStore();
        // Se ainda estiver vazio após a inicialização, significa que o arquivo não foi carregado
        if (csDocuments.length === 0) {
            return ["Nenhuma informação relevante encontrada na base de conhecimento ou a base não foi carregada."];
        }
    }

    try {
        const queryEmbedding = await getEmbedding(query);
        const results = csDocuments
            .map(doc => ({ content: doc.content, similarity: cosineSimilarity(queryEmbedding, doc.embedding) }))
            .sort((a, b) => b.similarity - a.similarity) // Ordena por similaridade decrescente
            .slice(0, k); // Pega os top K resultados

        // Define um limiar de similaridade para considerar um resultado "relevante"
        // Este valor pode precisar ser ajustado com base nos seus dados e modelo de embedding
        if (results.length === 0 || results[0].similarity < 0.7) { // Limiar de 0.7 para relevância
            return ["Nenhuma informação relevante encontrada na base de conhecimento para sua pergunta."];
        }

        return results.map(r => r.content);
    } catch (error) {
        console.error('Erro ao pesquisar na base de conhecimento do Agente CS:', error);
        return ["Erro ao buscar informações na base de conhecimento."];
    }
}