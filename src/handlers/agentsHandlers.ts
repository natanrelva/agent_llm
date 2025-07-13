// src/handlers/agentsHandlers.ts
import { getLlmResponse } from '../modules/utils/ollamaClient';
import { AgentTool } from '../modules/tools/tools'; // Reusa a interface AgentTool
import { AVAILABLE_SO_TOOLS } from '../modules/tools/tools'; // Ferramentas do SO Agent
import { AVAILABLE_CS_TOOLS } from '../modules/cs-tools/csTools'; // Ferramentas do CS Agent

// --- Prompt do Sistema para o Agente de Sistema Operacional (SO) ---
const SO_SYSTEM_PROMPT = `
Você é um assistente inteligente e prestativo, especializado em ajudar com tarefas básicas do sistema operacional e operações matemáticas. Você tem acesso a diversas ferramentas e deve utilizá-las quando apropriado.

**Seu Processo de Raciocínio (Fluxo de Consciência - CoT):**
1.  **Analise a Intenção:** Compreenda completamente a solicitação do usuário.
2.  **Determine a Necessidade de Ferramenta:** Pense se alguma das ferramentas disponíveis pode ajudar a cumprir a solicitação.
3.  **Justifique sua Escolha:** Explique por que a ferramenta selecionada é a mais apropriada para a tarefa, ou por que nenhuma ferramenta é necessária e você pode responder diretamente.
4.  **Defina os Parâmetros:** Se você decidir usar uma ferramenta, identifique todos os parâmetros necessários para ela (ex: nome do arquivo, URL, números para operações).
5.  **Formule a Ação (ReAct) ou Resposta Final:**
    * **Se for usar uma ferramenta:** Responda EXATAMENTE com um JSON no formato: \`{"tool_name": "nome_da_ferramenta", "args": {"param1": "valor1", "param2": "valor2"}}\`. Não adicione mais nada antes ou depois do JSON. Certifique-se de que o JSON é válido.
    * **Se não for usar uma ferramenta e tiver a resposta final:** Responda diretamente com o prefixo 'Final Answer: ' seguido da sua resposta.
    * **Se precisar de mais informações ou de mais passos de raciocínio antes de decidir:** Responda com um 'Thought:' descrevendo seu pensamento e qual o próximo passo.

**Ferramentas Disponíveis (e suas descrições/parâmetros):**
${AVAILABLE_SO_TOOLS.map(tool => {
    const params = tool.parameters.map(p => `${p.name} (${p.type}, ${p.required ? 'obrigatório' : 'opcional'}): ${p.description}`).join(', ');
    return `- Nome: \`${tool.name}\`\n  Descrição: ${tool.description}\n  Parâmetros: ${params || 'Nenhum'}`;
}).join('\n\n')}

**Regras Específicas:**
* Se a pergunta não se encaixa em nenhuma ferramenta, responda usando seu próprio conhecimento.
`;

// --- Prompt do Sistema para o Agente de Atendimento ao Cliente (CS) ---
const CS_SYSTEM_PROMPT = `
Você é um atendente virtual da Empresa Fictícia, prestativo e paciente. Seu objetivo é ajudar os clientes a resolverem suas dúvidas e problemas. Você tem acesso a diversas ferramentas para isso, incluindo uma base de dados de FAQ e a capacidade de criar chamados de suporte.

**Seu Processo de Raciocínio (Fluxo de Consciência - CoT):**
1.  **Analise a Intenção do Cliente:** Compreenda completamente a pergunta ou problema do cliente.
2.  **Determine a Necessidade de Ferramenta:** Pense se alguma das ferramentas disponíveis pode ajudar a resolver a solicitação.
    * Priorize 'search_faq' para perguntas sobre políticas, produtos ou problemas comuns.
    * Use 'check_order_status' para perguntas sobre pedidos.
    * Use 'create_support_ticket' se a dúvida não puder ser resolvida com a FAQ ou exigir intervenção humana.
    * Use 'add_qa_to_knowledge_base' APENAS se você não souber a resposta a uma pergunta do cliente e o cliente fornecer a informação correta, para "aprender" e refinar o seu conhecimento para futuras interações.
3.  **Justifique sua Escolha:** Explique por que a ferramenta selecionada é a mais apropriada, ou por que nenhuma ferramenta é necessária.
4.  **Defina os Parâmetros:** Se for usar uma ferramenta, identifique todos os parâmetros necessários (ex: ID do pedido, descrição do problema).
5.  **Formule a Ação (ReAct) ou Resposta Final:**
    * **Se for usar uma ferramenta:** Responda EXATAMENTE com um JSON no formato: \`{"tool_name": "nome_da_ferramenta", "args": {"param1": "valor1", "param2": "valor2"}}\`. Não adicione mais nada antes ou depois do JSON.
    * **Se não for usar uma ferramenta e tiver a resposta final:** Responda diretamente com o prefixo 'Final Answer: ' seguido da sua resposta.
    * **Se precisar de mais informações ou de mais passos de raciocínio:** Responda com um 'Thought:' descrevendo seu pensamento e qual o próximo passo.

**Ferramentas Disponíveis (e suas descrições/parâmetros):**
${AVAILABLE_CS_TOOLS.map(tool => {
    const params = tool.parameters.map(p => `${p.name} (${p.type}, ${p.required ? 'obrigatório' : 'opcional'}): ${p.description}`).join(', ');
    return `- Nome: \`${tool.name}\`\n  Descrição: ${tool.description}\n  Parâmetros: ${params || 'Nenhum'}`;
}).join('\n\n')}

**Regras Específicas:**
* Se a pergunta não se encaixa em nenhuma ferramenta ou FAQ, informe o cliente que você não tem essa informação e sugira criar um chamado.
* Se o cliente fornecer uma resposta a uma pergunta que você não sabia, use a ferramenta 'add_qa_to_knowledge_base' para "aprender".
`;

// --- Função Genérica para Rodar um Agente (ReAct/CoT Loop) ---
async function runAgentLoop(
    userInput: string,
    systemPrompt: string,
    availableTools: AgentTool[],
    agentName: string
): Promise<string> {
    const MAX_ITERATIONS = 7;
    let currentInput = userInput;
    let agentScratchpad = '';
    let finalAnswer = '';
    let lastUnansweredQuestion: string | null = null; // Específico para o CS Agent para o refinamento

    console.log(`\n--- ${agentName} - Entrada: "${userInput}" ---`);

    for (let i = 0; i < MAX_ITERATIONS; i++) {
        console.log(`\n--- ${agentName} - Iteração ${i + 1} de ${MAX_ITERATIONS} ---`);

        const promptMessages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `${currentInput}\n\n${agentScratchpad}` },
        ];

        console.log(`\n--- ${agentName} - Chamando LLM... ---`);
        const llmResponse = await getLlmResponse(promptMessages);
        console.log(`\n--- ${agentName} - Resposta Bruta do LLM: ---\n${llmResponse}\n--- Fim da Resposta Bruta ---`);

        if (llmResponse.startsWith('Final Answer:')) {
            finalAnswer = llmResponse.substring('Final Answer:'.length).trim();
            lastUnansweredQuestion = null;
            break;
        }

        let toolCall: { tool_name: string; args: Record<string, any> } | null = null;
        try {
            const jsonMatch = llmResponse.match(/\{"tool_name":\s*".*?".*?\}/s);
            if (jsonMatch) {
                toolCall = JSON.parse(jsonMatch[0]);
            }
        } catch (e) {
            console.warn('AVISO: LLM não retornou JSON de ferramenta válido.');
        }

        if (toolCall && toolCall.tool_name && toolCall.args) {
            const tool = availableTools.find(t => t.name === toolCall!.tool_name);

            if (tool) {
                console.log(`\n--- ${agentName} - EXECUTANDO FERRAMENTA: "${tool.name}" com args: ${JSON.stringify(toolCall.args)} ---`);
                const observation = await tool.execute(toolCall.args);
                console.log(`\n--- ${agentName} - OBSERVAÇÃO (resultado da ferramenta): "${observation}" ---`);

                // Lógica de Refinamento (específica do CS Agent)
                if (agentName === "Agente de Atendimento ao Cliente") {
                    if (tool.name === 'search_faq' && observation.includes("Nenhuma informação relevante")) {
                        lastUnansweredQuestion = toolCall.args.query;
                        agentScratchpad += `Thought: Eu busquei na FAQ por "${lastUnansweredQuestion}" e não encontrei. Preciso perguntar ao cliente se ele sabe a resposta para que eu possa aprender.\n`;
                        currentInput = `Não encontrei a resposta para "${lastUnansweredQuestion}" na minha base de dados. Você poderia me fornecer a resposta correta para que eu possa aprender para o futuro?`;
                        continue;
                    } else if (tool.name === 'add_qa_to_knowledge_base') {
                        lastUnansweredQuestion = null;
                        agentScratchpad += `Thought: A nova informação foi adicionada à base de conhecimento. Agora posso confirmar ao cliente.\n`;
                        currentInput = `Agradeço por me fornecer a informação. Ela foi adicionada à minha base de conhecimento.`;
                        continue;
                    }
                }
                
                agentScratchpad += `Thought: Eu chamei a ferramenta "${tool.name}" com os argumentos ${JSON.stringify(toolCall.args)}.\n`;
                agentScratchpad += `Observation: ${observation}\n`;
                currentInput = `Continue seu raciocínio com base na seguinte observação da ferramenta:\n${observation}`;

            } else {
                const errorMsg = `Thought: O LLM tentou usar uma ferramenta desconhecida: "${toolCall.tool_name}". Não posso executar isso.`;
                console.error(errorMsg);
                agentScratchpad += errorMsg + '\n';
                finalAnswer = `Desculpe, não consigo executar a ação que você pediu. A ferramenta '${toolCall.tool_name}' não é reconhecida.`;
                break;
            }
        } else {
            if (agentName === "Agente de Atendimento ao Cliente" && lastUnansweredQuestion && !llmResponse.includes('Final Answer:')) {
                const potentialAnswer = llmResponse.trim();
                if (!potentialAnswer.includes("Desculpe") && !potentialAnswer.includes("não sei") && potentialAnswer.length > 20) {
                    console.log(`\n--- ${agentName} - TENTANDO APRENDER: Cliente forneceu resposta para "${lastUnansweredQuestion}" ---`);
                    toolCall = {
                        tool_name: 'add_qa_to_knowledge_base',
                        args: { question: lastUnansweredQuestion, answer: potentialAnswer }
                    };
                    const tool = availableTools.find(t => t.name === toolCall!.tool_name);
                    if (tool) {
                        const observation = await tool.execute(toolCall.args);
                        agentScratchpad += `Thought: O cliente forneceu a resposta para a pergunta "${lastUnansweredQuestion}". Eu usei a ferramenta 'add_qa_to_knowledge_base' para aprender.\n`;
                        agentScratchpad += `Observation: ${observation}\n`;
                        currentInput = `Continue seu raciocínio com base na seguinte observação:\n${observation}`;
                        lastUnansweredQuestion = null;
                        continue;
                    }
                }
            }

            if (llmResponse.startsWith('Thought:')) {
                agentScratchpad += llmResponse + '\n';
                currentInput = userInput;
            } else {
                console.warn("LLM não seguiu o formato esperado. Tratando como resposta direta.");
                finalAnswer = llmResponse.trim();
                break;
            }
        }
    }

    if (!finalAnswer && MAX_ITERATIONS > 0) {
        finalAnswer = "Desculpe, não consegui completar sua solicitação dentro do limite de iterações. Por favor, tente reformular.";
    }

    return finalAnswer;
}

// --- Funções de Handler para cada Agente ---
export async function handleSoAgentRequest(userInput: string): Promise<string> {
    return runAgentLoop(userInput, SO_SYSTEM_PROMPT, AVAILABLE_SO_TOOLS, "Agente de Sistema Operacional");
}

export async function handleCsAgentRequest(userInput: string): Promise<string> {
    return runAgentLoop(userInput, CS_SYSTEM_PROMPT, AVAILABLE_CS_TOOLS, "Agente de Atendimento ao Cliente");
}