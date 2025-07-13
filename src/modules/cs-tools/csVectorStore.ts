import fs from 'fs/promises';
import path from 'path';
import { getEmbedding } from '../utils/ollamaClient';

interface Document {
    content: string;
    embedding: number[];
}

let csDocuments: Document[] = [];
const KNOWLEDGE_BASE_CS_PATH = path.join(__dirname, '..', '..', 'knowledge_base_cs.txt');

function cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0; let magnitudeA = 0; let magnitudeB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        magnitudeA += vecA[i] * vecA[i];
        magnitudeB += vecB[i] * vecB[i];
    }
    magnitudeA = Math.sqrt(magnitudeA); magnitudeB = Math.sqrt(magnitudeB);
    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    return dotProduct / (magnitudeA * magnitudeB);
}

function splitTextIntoChunks(text: string, chunkSize: number, chunkOverlap: number): string[] {
    const chunks: string[] = []; const lines = text.split('\n'); let currentChunk = '';
    for (const line of lines) {
        if ((currentChunk + line).length > chunkSize && currentChunk.length > 0) {
            chunks.push(currentChunk.trim());
            currentChunk = currentChunk.substring(currentChunk.length - chunkOverlap).trim() + ' ' + line;
        } else { currentChunk += (currentChunk.length > 0 ? '\n' : '') + line; }
    }
    if (currentChunk.length > 0) chunks.push(currentChunk.trim());
    return chunks;
}

export async function initializeCsVectorStore() {
    try {
        const knowledgeText = await fs.readFile(KNOWLEDGE_BASE_CS_PATH, 'utf-8');
        console.log("--- Agente CS - Construindo Vectorstore para RAG (pode levar alguns segundos)... ---");
        const chunks = splitTextIntoChunks(knowledgeText, 500, 100);
        csDocuments = [];
        for (const chunk of chunks) {
            const embedding = await getEmbedding(chunk);
            csDocuments.push({ content: chunk, embedding });
        }
        console.log(`--- Agente CS - Vectorstore construído com ${csDocuments.length} documentos. ---`);
    } catch (error) {
        console.error('Erro ao inicializar o Vector Store do Agente CS:', error);
        if (!(error instanceof Error && (error as NodeJS.ErrnoException).code === 'ENOENT')) {
            throw error;
        }
        console.warn(`AVISO: Arquivo '${KNOWLEDGE_BASE_CS_PATH}' não encontrado. RAG do Agente CS pode não funcionar.`);
    }
}

export async function addQaToKnowledgeBase(question: string, answer: string): Promise<void> {
    const newEntry = `\n\nFAQ: ${question}\nResposta: ${answer}`;
    try {
        await fs.appendFile(KNOWLEDGE_BASE_CS_PATH, newEntry, 'utf-8');
        console.log(`--- Agente CS - Nova Q&A adicionada à base de conhecimento. Recarregando Vectorstore... ---`);
        await initializeCsVectorStore();
        console.log(`--- Agente CS - Vectorstore recarregado com sucesso. ---`);
    } catch (error) {
        console.error('Erro ao adicionar Q&A à base de conhecimento:', error);
    }
}

export async function searchCsKnowledgeBase(query: string, k: number = 3): Promise<string[]> {
    if (csDocuments.length === 0) {
        await initializeCsVectorStore();
        if (csDocuments.length === 0) {
            return ["Nenhuma informação relevante encontrada na base de conhecimento ou a base não foi carregada."];
        }
    }
    try {
        const queryEmbedding = await getEmbedding(query);
        const results = csDocuments
            .map(doc => ({ content: doc.content, similarity: cosineSimilarity(queryEmbedding, doc.embedding) }))
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, k);

        if (results.length === 0 || results[0].similarity < 0.7) {
            return ["Nenhuma informação relevante encontrada na base de conhecimento para sua pergunta."];
        }
        return results.map(r => r.content);
    } catch (error) {
        console.error('Erro ao pesquisar na base de conhecimento do Agente CS:', error);
        return ["Erro ao buscar informações na base de conhecimento."];
    }
}