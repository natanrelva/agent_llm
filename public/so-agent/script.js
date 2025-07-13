// public/so-agent/script.js
document.addEventListener('DOMContentLoaded', () => {
  const chatBox = document.getElementById('chat-box');
  const userInput = document.getElementById('user-input');
  const sendButton = document.getElementById('send-button');

  // Função para adicionar mensagem ao chat
  function addMessage(sender, message) {
      const msgDiv = document.createElement('div');
      msgDiv.classList.add('message', sender === 'user' ? 'user-message' : 'agent-message');
      msgDiv.textContent = message;
      chatBox.appendChild(msgDiv);
      chatBox.scrollTop = chatBox.scrollHeight; // Rola para o final
  }

  // Função para enviar mensagem ao backend
  async function sendMessage() {
      const message = userInput.value.trim();
      if (message === '') return;

      addMessage('user', message);
      userInput.value = ''; // Limpa o input

      // Adiciona um indicador de carregamento
      const loadingDiv = document.createElement('div');
      loadingDiv.classList.add('loading-indicator');
      loadingDiv.textContent = 'Agente pensando...';
      chatBox.appendChild(loadingDiv);
      chatBox.scrollTop = chatBox.scrollHeight;

      try {
          const response = await fetch('/api/so-agent/chat', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ message: message }),
          });

          const data = await response.json();
          chatBox.removeChild(loadingDiv); // Remove o indicador de carregamento
          if (response.ok) {
              addMessage('agent', data.reply);
          } else {
              addMessage('agent', `Erro: ${data.error || 'Ocorreu um erro.'}`);
          }
      } catch (error) {
          chatBox.removeChild(loadingDiv); // Remove o indicador de carregamento
          console.error('Erro ao comunicar com o backend:', error);
          addMessage('agent', 'Erro: Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
      }
  }

  sendButton.addEventListener('click', sendMessage);
  userInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
          sendMessage();
      }
  });

  addMessage('agent', 'Olá! Eu sou o Agente de Sistema Operacional. Como posso ajudar?');
  addMessage('agent', 'Tente: "Qual a hora atual?", "Crie um arquivo teste.txt com Olá mundo", "Some 5 e 3".');
});