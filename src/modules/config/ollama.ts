import dotenv from 'dotenv';
dotenv.config();

export const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
export const LLM_MODEL = process.env.LLM_MODEL || 'llama3';
export const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'nomic-embed-text';
export const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000; // Nova porta para o Express