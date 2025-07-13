// src/modules/routers/agentsRouters.ts
import { Router, Request, Response } from 'express';
import { handleSoAgentRequest, handleCsAgentRequest } from '../handlers/agentsHandlers';

const router = Router();

// Rota para o Agente de Sistema Operacional
// Recebe uma mensagem do cliente e envia para o agente SO.
router.post('/so-agent/chat', async (req: Request, res: Response) => {
    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ error: 'Mensagem é obrigatória.' });
    }
    try {
        const agentResponse = await handleSoAgentRequest(message);
        return res.json({ reply: agentResponse });
    } catch (error: any) {
        console.error('Erro no Agente SO:', error);
        return res.status(500).json({ error: 'Erro interno do servidor ao processar a requisição do Agente SO.' });
    }
});

// Rota para o Agente de Atendimento ao Cliente
// Recebe uma mensagem do cliente e envia para o agente CS.
router.post('/cs-agent/chat', async (req, res) => {
    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ error: 'Mensagem é obrigatória.' });
    }
    try {
        const agentResponse = await handleCsAgentRequest(message);
        return res.json({ reply: agentResponse });
    } catch (error: any) {
        console.error('Erro no Agente CS:', error);
        return res.status(500).json({ error: 'Erro interno do servidor ao processar a requisição do Agente CS.' });
    }
});

export default router;