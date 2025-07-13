// src/modules/cs-tools/csTools.ts
import { searchCsKnowledgeBase, addQaToKnowledgeBase } from '../cs-rag/csVectorStore';
import { AgentTool } from '../tools/tools'; // Reusa a interface AgentTool

const search_faq: AgentTool = {
    name: 'search_faq',
    description: 'Pesquisa informações em nossa base de dados de Perguntas Frequentes (FAQ) e políticas da empresa. Use esta ferramenta para responder a dúvidas comuns dos clientes sobre produtos, serviços, políticas, etc.',
    parameters: [
        { name: 'query', type: 'string', description: 'A pergunta do cliente ou o termo de busca para a FAQ.', required: true },
    ],
    execute: async (args) => {
        console.log(`\n--- Agente CS - EXECUTANDO: Buscando FAQ por: '${args.query}' ---`);
        const results = await searchCsKnowledgeBase(args.query, 3);
        if (results.length === 0 || results[0].includes("Nenhuma informação relevante")) {
            return "Nenhuma informação relevante encontrada na FAQ para sua pergunta.";
        }
        return `Informação relevante da FAQ:\n${results.join('\n\n')}`;
    },
};

const create_support_ticket: AgentTool = {
    name: 'create_support_ticket',
    description: 'Cria um novo chamado de suporte técnico para o cliente. Use esta ferramenta quando a dúvida do cliente não puder ser resolvida com a FAQ ou exigir ação de um atendente humano.',
    parameters: [
        { name: 'customerName', type: 'string', description: 'Nome completo do cliente.', required: true },
        { name: 'issueDescription', type: 'string', description: 'Descrição detalhada do problema ou solicitação do cliente.', required: true },
        { name: 'contactInfo', type: 'string', description: 'Informações de contato do cliente (email ou telefone).', required: true },
    ],
    execute: async (args) => {
        console.log(`\n--- Agente CS - SIMULAÇÃO: Criando chamado de suporte ---`);
        console.log(`Cliente: ${args.customerName}, Problema: ${args.issueDescription}, Contato: ${args.contactInfo}`);
        return `Simulação: Um chamado de suporte foi aberto para ${args.customerName} com o problema "${args.issueDescription}". Um atendente entrará em contato em breve.`;
    },
};

const check_order_status: AgentTool = {
    name: 'check_order_status',
    description: 'Verifica o status de um pedido do cliente. Use esta ferramenta quando o cliente perguntar sobre o andamento de uma compra.',
    parameters: [
        { name: 'orderId', type: 'string', description: 'O ID do pedido a ser verificado.', required: true },
    ],
    execute: async (args) => {
        console.log(`\n--- Agente CS - SIMULAÇÃO: Verificando status do pedido '${args.orderId}' ---`);
        const statuses = ['Processando', 'Enviado', 'Entregue', 'Cancelado'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        return `Simulação: O status do pedido ${args.orderId} é: ${randomStatus}.`;
    },
};

const add_qa_to_knowledge_base: AgentTool = {
    name: 'add_qa_to_knowledge_base',
    description: 'Adiciona uma nova pergunta e sua resposta à base de conhecimento interna do agente. Use esta ferramenta APENAS quando o agente não souber a resposta a uma pergunta e o usuário fornecer a informação correta, para "refinar" o conhecimento do agente para futuras interações.',
    parameters: [
        { name: 'question', type: 'string', description: 'A pergunta que o agente não sabia responder.', required: true },
        { name: 'answer', type: 'string', description: 'A resposta correta fornecida pelo usuário ou por uma fonte externa.', required: true },
    ],
    execute: async (args) => {
        console.log(`\n--- Agente CS - EXECUTANDO: Adicionando Q&A à base de conhecimento ---`);
        await addQaToKnowledgeBase(args.question, args.answer);
        return `Confirmado: A pergunta "${args.question}" e sua resposta foram adicionadas à base de conhecimento para futuras consultas.`;
    },
};

export const AVAILABLE_CS_TOOLS: AgentTool[] = [
    search_faq,
    create_support_ticket,
    check_order_status,
    add_qa_to_knowledge_base,
];