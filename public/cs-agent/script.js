// public/cs-agent/script.js
document.addEventListener('DOMContentLoaded', () => {
  const chatBox = document.getElementById('chat-box');
  const userInput = document.getElementById('user-input');
  const sendButton = document.getElementById('send-button');

  function addMessage(sender, message) {
      const msgDiv = document.createElement('div');
      msgDiv.classList.add('message', sender === 'user' ? 'user-message' : 'agent-message');
      msgDiv.textContent = message;
      chatBox.appendChild(msgDiv);
      chatBox.scrollTop = chatBox.scrollHeight;
  }

  async function sendMessage() {
      const message = userInput.value.trim();
      if (message === '') return;

      addMessage('user', message);
      userInput.value = '';

      const loadingDiv = document.createElement('div');
      loadingDiv.classList.add('loading-indicator');
      loadingDiv.textContent = 'Agente pensando...';
      chatBox.appendChild(loadingDiv);
      chatBox.scrollTop = chatBox.scrollHeight;

      try {
          const response = await fetch('/api/cs-agent/chat', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ message: message }),
          });

          const data = await response.json();
          chatBox.removeChild(loadingDiv);
          if (response.ok) {
              addMessage('agent', data.reply);
          } else {
              addMessage('agent', `Erro: ${data.error || 'Ocorreu um erro.'}`);
          }
      } catch (error) {
          chatBox.removeChild(loadingDiv);
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

  addMessage('agent', 'Olá! Sou o Agente de Atendimento ao Cliente da Empresa Fictícia. Como posso ajudar?');
  addMessage('agent', 'Tente: "Como redefinir minha senha?", "Qual o status do meu pedido ID-123?", "O que faço se meu produto estiver com defeito?"');
});