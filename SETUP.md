# Configuração e Execução do Projeto Agentes LLM Locais

Este guia detalha os passos necessários para configurar e executar o projeto "Agentes LLM Proativos e Orientados a Ações" na sua máquina local.

-----

### **1. Pré-requisitos**

Antes de iniciar, certifique-se de ter os seguintes softwares instalados no seu sistema:

  * **Node.js (versão 20.x ou superior):** [Baixar Node.js](https://nodejs.org/en/download/)
      * Para verificar a versão: `node -v`
  * **npm (gerenciador de pacotes do Node.js):** Vem junto com o Node.js.
      * Para verificar a versão: `npm -v`
  * **Git:** Para clonar o repositório.
      * [Baixar Git](https://git-scm.com/downloads)
  * **Ollama:** O servidor local de modelos de linguagem e embeddings.
      * [Baixar Ollama](https://ollama.ai/download)
      * **Após instalar o Ollama, certifique-se de que ele esteja rodando.** Você pode iniciar o servidor Ollama executando `ollama serve` em um terminal (mantenha este terminal aberto enquanto usa o projeto).
      * **Baixe os modelos necessários no Ollama:**
          * Abra um terminal e execute:
            ```bash
            ollama pull llama3         # Para o LLM principal
            ollama pull nomic-embed-text # Para o modelo de embeddings (RAG)
            ```

-----

### **2. Configuração do Projeto**

Siga estes passos para configurar o ambiente do projeto:

1.  **Clone o Repositório:**
    Abra seu terminal ou prompt de comando e clone o repositório do projeto:

    ```bash
    git clone [LINK_DO_SEU_REPOSITORIO_AQUI]
    cd agentes-nodejs-ollama-local # Ou o nome da pasta do seu projeto
    ```

    *(Substitua `[LINK_DO_SEU_REPOSITORIO_AQUI]` pelo link real do seu repositório Git.)*

2.  **Instale as Dependências:**
    Após navegar para a pasta do projeto, instale todas as dependências Node.js:

    ```bash
    npm install
    ```

3.  **Configuração das Variáveis de Ambiente:**
    Crie um arquivo `.env` na raiz do projeto (na mesma pasta do `package.json`). Você pode usar o `.env_exemple` como base.

      * **Copie o conteúdo de `.env_exemple` para um novo arquivo chamado `.env`:**
        ```bash
        cp .env_exemple .env
        ```
      * **Verifique e ajuste o `.env` (se necessário):**
        ```dotenv
        OLLAMA_HOST=http://localhost:11434
        LLM_MODEL=llama3
        EMBEDDING_MODEL=nomic-embed-text
        PORT=3000
        ```
        Geralmente, as configurações padrão acima funcionam. Certifique-se de que `OLLAMA_HOST` aponta para onde seu servidor Ollama está rodando. `LLM_MODEL` e `EMBEDDING_MODEL` devem corresponder aos modelos que você baixou no passo 1.

-----

### **3. Compilação e Execução**

Com as dependências instaladas e as variáveis de ambiente configuradas, você pode compilar e executar o projeto:

1.  **Compile o Código TypeScript e Copie os Assets:**
    Este comando transcompila os arquivos TypeScript para JavaScript e copia os arquivos estáticos (HTML, JS do frontend, e a base de conhecimento do RAG) para a pasta de distribuição (`dist`).

    ```bash
    npm run build
    ```

    Você deve ver mensagens de compilação e cópia de arquivos.

2.  **Inicie o Servidor Express:**
    Após a compilação bem-sucedida, inicie o aplicativo Node.js:

    ```bash
    npm start
    ```

    Você verá uma mensagem no terminal indicando que o servidor está rodando, algo como:
    `Servidor Express rodando em http://localhost:3000`
    `Acesse http://localhost:3000 no seu navegador para interagir com os agentes.`

-----

### **4. Acessando o Aplicativo**

1.  **Certifique-se de que o servidor Ollama está ativo** no terminal separado (`ollama serve`).
2.  **Abra seu navegador web** (Chrome, Firefox, Edge, etc.).
3.  **Navegue para o endereço:** `http://localhost:3000`

Você será direcionado para uma página inicial onde poderá escolher entre interagir com o "Agente de Sistema Operacional" ou o "Agente de Atendimento ao Cliente".

-----

### **5. Testando os Agentes**

Interaja com os agentes através das interfaces de chat.

  * **Agente de Sistema Operacional (SO):**

      * "Qual a hora atual?"
      * "Crie um arquivo chamado `relatorio_diario.txt` com o conteúdo 'Vendas de hoje: R$ 1500,00'."
      * "Abra o site `https://github.com`"
      * "Some 25 e 10."

  * **Agente de Atendimento ao Cliente (CS):**

      * "Como redefinir minha senha?"
      * "Qual o horário de atendimento do suporte?"
      * "Qual o status do meu pedido ID-XYZ789?"
      * "Meu produto está com defeito, o que devo fazer?"
          * *(Observe a capacidade do agente de solicitar mais informações se não tiver a resposta e, se você fornecer, ele pode "aprender" para futuras interações.)*

-----

### **6. Solução de Problemas Comuns**

  * **`Error [ERR_REQUIRE_ESM]` ou `ERR_MODULE_NOT_FOUND`:**
      * Isso geralmente ocorre se o `package.json` não tem `"type": "module"` ou se o `tsconfig.json` não está configurado para módulos ES. **Siga as instruções de correção de módulo fornecidas na última comunicação ou garanta que a Option 1 com `import('open').then(...)` foi aplicada corretamente.**
  * **"Error: Falha ao obter resposta do LLM..." / "Erro ao comunicar com o backend":**
      * Verifique se o **Ollama está rodando** (`ollama serve` em um terminal separado).
      * Verifique se os **modelos (`llama3`, `nomic-embed-text`) foram baixados** com `ollama pull`.
      * Verifique se o `OLLAMA_HOST` no seu arquivo `.env` está correto (`http://localhost:11434` é o padrão).
      * Verifique se o servidor Node.js está ativo (`npm start`).
  * **`Address already in use`:**
      * A porta (padrão 3000) já está sendo usada por outro processo. Altere a `PORT` no seu arquivo `.env` para outra (ex: `3001`) e reinicie o servidor.
  * **Problemas com `npm run build`:**
      * Verifique se você tem todas as dependências de desenvolvimento instaladas (`npm install`).
      * Verifique se o seu `tsconfig.json` está configurado corretamente.


### Install ollama in local host
**ref config and install**: 
  - https://www.npmjs.com/package/ollama
  - https://github.com/ollama/ollama