// src/__tests__/tools.test.ts
import { AVAILABLE_SO_TOOLS } from '../../../src/modules/tools/tools';
import open from 'open'; // Importe open para mockar

// Mockar a biblioteca 'open'
jest.mock('open');
const mockOpen = open as jest.Mock;

describe('SO Agent Tools', () => {
    beforeEach(() => {
        // Limpa os mocks antes de cada teste
        mockOpen.mockClear();
        // Reset console.log for silent output during tests if desired
        // jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    // afterAll(() => {
    //     // Restore console.log after all tests
    //     jest.restoreAllMocks();
    // });

    const getTool = (name: string) => AVAILABLE_SO_TOOLS.find(tool => tool.name === name);

    it('create_file deve simular a criação de um arquivo', async () => {
        const tool = getTool('create_file');
        expect(tool).toBeDefined();

        const result = await tool!.execute({ fileName: 'test.txt', content: 'Hello, Jest!' });
        expect(result).toBe("Simulação: Arquivo 'test.txt' criado com sucesso.");
        // Não esperamos que o console.log seja mockado por padrão, então apenas verificamos o retorno.
    });

    it('open_website deve abrir um site válido', async () => {
        const tool = getTool('open_website');
        expect(tool).toBeDefined();

        mockOpen.mockResolvedValue({}); // Simula sucesso na abertura

        const url = 'https://example.com';
        const result = await tool!.execute({ url: url });
        expect(result).toBe(`Site '${url}' aberto com sucesso.`);
        expect(mockOpen).toHaveBeenCalledTimes(1);
        expect(mockOpen).toHaveBeenCalledWith(url);
    });

    it('open_website deve retornar erro para URL inválida', async () => {
        const tool = getTool('open_website');
        expect(tool).toBeDefined();

        const url = 'invalid-url';
        const result = await tool!.execute({ url: url });
        expect(result).toBe("Erro: URL inválida.");
        expect(mockOpen).not.toHaveBeenCalled(); // Não deve tentar abrir
    });

    it('get_current_time deve retornar a hora atual formatada', async () => {
        const tool = getTool('get_current_time');
        expect(tool).toBeDefined();

        // Mockar Date para ter um resultado consistente
        const mockDate = new Date('2025-07-13T15:30:00.000Z');
        jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

        const result = await tool!.execute({});
        expect(result).toMatch(/A data e hora atual é: \d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}/);
        expect(result).toContain('13/07/2025 12:30:00'); // Note o ajuste de fuso horário para BR.
        jest.restoreAllMocks(); // Restaura o Date mockado
    });

    describe('perform_math_operation', () => {
        const tool = getTool('perform_math_operation');
        expect(tool).toBeDefined();

        it('deve realizar uma soma corretamente', async () => {
            const result = await tool!.execute({ operation: 'soma', num1: 5, num2: 3 });
            expect(result).toBe("Simulação: O resultado da operação soma entre 5 e 3 é 8.");
        });

        it('deve realizar uma subtração corretamente', async () => {
            const result = await tool!.execute({ operation: 'subtracao', num1: 10, num2: 4 });
            expect(result).toBe("Simulação: O resultado da operação subtracao entre 10 e 4 é 6.");
        });

        it('deve realizar uma multiplicação corretamente', async () => {
            const result = await tool!.execute({ operation: 'multiplicacao', num1: 6, num2: 7 });
            expect(result).toBe("Simulação: O resultado da operação multiplicacao entre 6 e 7 é 42.");
        });

        it('deve realizar uma divisão corretamente', async () => {
            const result = await tool!.execute({ operation: 'divisao', num1: 10, num2: 2 });
            expect(result).toBe("Simulação: O resultado da operação divisao entre 10 e 2 é 5.");
        });

        it('deve retornar erro para divisão por zero', async () => {
            const result = await tool!.execute({ operation: 'divisao', num1: 10, num2: 0 });
            expect(result).toBe("Erro: Divisão por zero.");
        });

        it('deve retornar erro para operação não reconhecida', async () => {
            const result = await tool!.execute({ operation: 'potencia', num1: 2, num2: 3 });
            expect(result).toBe("Operação 'potencia' não reconhecida.");
        });
    });
});