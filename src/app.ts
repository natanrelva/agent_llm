// src/app.ts
import express from 'express';
import path from 'path';
import { PORT } from './modules/config/ollama'; // Importa a porta do config
import agentsRouter from './routers/agentsRouters'; // Importa as rotas dos agentes
import { initializeCsVectorStore } from './modules/cs-rag/csVectorStore'; // Importa a inicialização do RAG do CS

const app = express();

// Middleware para parsear JSON no corpo das requisições
app.use(express.json());

// Serve arquivos estáticos da pasta 'public'
// Isso permitirá que você acesse seus arquivos HTML, CSS e JS do frontend
app.use(express.static(path.join(__dirname, '..', 'public')));

// Roteador para as APIs dos agentes (todos os endpoints de agente começarão com /api)
app.use('/api', agentsRouter);

// Rota padrão para a página inicial
app.get('/', (_: express.Request, res: express.Response) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Inicializa o Vector Store do CS Agent antes de iniciar o servidor
// Isso garante que a base de conhecimento esteja pronta para as requisições.
initializeCsVectorStore().then(() => {
    console.log('Vector Store para o Agente CS inicializado.');
    // Inicia o servidor Express após a inicialização do RAG
    app.listen(PORT, () => {
        console.log(`Servidor Express rodando em http://localhost:${PORT}`);
        console.log(`Acesse http://localhost:${PORT} no seu navegador para interagir com os agentes.`);
    });
}).catch(err => {
    console.error('Erro fatal ao inicializar Vector Store do Agente CS:', err);
    process.exit(1); // Sai do processo se houver erro na inicialização do RAG
});