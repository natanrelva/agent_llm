const open = (url: string) => import('open').then(module => module.default(url));

export interface AgentTool {
    name: string;
    description: string;
    parameters: { name: string; type: string; description: string; required: boolean; }[];
    execute: (args: Record<string, any>) => Promise<string>;
}

const create_file: AgentTool = {
    name: 'create_file',
    description: 'Cria um novo arquivo de texto com o nome e conteúdo especificados. Esta é uma ação SIMULADA por segurança.',
    parameters: [
        { name: 'fileName', type: 'string', description: 'Nome completo do arquivo.', required: true },
        { name: 'content', type: 'string', description: 'Conteúdo do arquivo.', required: true },
    ],
    execute: async (args) => {
        console.log(`\n--- SIMULAÇÃO: Criando o arquivo '${args.fileName}' com conteúdo: '${args.content}' ---`);
        return `Simulação: Arquivo '${args.fileName}' criado com sucesso.`;
    },
};

const open_website: AgentTool = {
  name: 'open_website',
  description: 'Abre um site específico no navegador padrão do sistema. Esta é uma AÇÃO REAL.',
  parameters: [
      { name: 'url', type: 'string', description: 'A URL completa do site.', required: true },
  ],
  execute: async (args) => {
      console.log(`\n--- AÇÃO REAL: Abrindo o site: '${args.url}' ---`);
      try {
          if (!args.url.startsWith('http://') && !args.url.startsWith('https://')) return `Erro: URL inválida.`;
          await open(args.url); // Use a função 'open' definida acima
          return `Site '${args.url}' aberto com sucesso.`;
      } catch (error: any) {
          return `Erro ao abrir o site '${args.url}': ${error.message}`;
      }
  },
};
const get_current_time: AgentTool = {
    name: 'get_current_time',
    description: 'Obtém a data e hora atual do sistema.',
    parameters: [],
    execute: async () => {
        const currentTime = new Date().toLocaleString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
        console.log(`\n--- AÇÃO REAL: Obtendo hora e data atual ---`);
        return `A data e hora atual é: ${currentTime}`;
    },
};

const perform_math_operation: AgentTool = {
    name: 'perform_math_operation',
    description: 'Realiza uma operação matemática básica (soma, subtracao, multiplicacao, divisao) entre dois números.',
    parameters: [
        { name: 'operation', type: 'string', description: 'O tipo de operação.', required: true },
        { name: 'num1', type: 'number', description: 'O primeiro número.', required: true },
        { name: 'num2', type: 'number', description: 'O segundo número.', required: true },
    ],
    execute: async (args) => {
        console.log(`\n--- SIMULAÇÃO: Realizando operação matemática: ${args.operation} ${args.num1} e ${args.num2} ---`);
        let result: number;
        switch (args.operation.toLowerCase()) {
            case 'soma': result = args.num1 + args.num2; break;
            case 'subtracao': result = args.num1 - args.num2; break;
            case 'multiplicacao': result = args.num1 * args.num2; break;
            case 'divisao': if (args.num2 === 0) return "Erro: Divisão por zero."; result = args.num1 / args.num2; break;
            default: return `Operação '${args.operation}' não reconhecida.`;
        }
        return `Simulação: O resultado da operação ${args.operation} entre ${args.num1} e ${args.num2} é ${result}.`;
    },
};

export const AVAILABLE_SO_TOOLS: AgentTool[] = [
    create_file,
    open_website,
    get_current_time,
    perform_math_operation,
];