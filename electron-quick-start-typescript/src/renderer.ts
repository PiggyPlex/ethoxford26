// DOM Elements
const suggestionsContainer = document.getElementById("suggestions-container")!;
const statusDot = document.getElementById("status-dot")!;
const statusText = document.getElementById("status-text")!;

// Chat DOM Elements
const chatMessages = document.getElementById("chat-messages")!;
const chatInput = document.getElementById("chat-input") as HTMLTextAreaElement;
const chatSendBtn = document.getElementById("chat-send-btn") as HTMLButtonElement;
const tabButtons = document.querySelectorAll(".tab");
const tabContents = document.querySelectorAll(".tab-content");

// State
const suggestions: SuggestionEvent[] = [];
const messages: ChatMessage[] = [];
const toolEvents: Map<string, ToolExecutionEvent> = new Map();
let currentThinking: ThinkingEvent | null = null;
let isTyping = false;
let currentChatId: string | null = null;

// Utility functions
function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString();
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Tab switching
tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const tabName = button.getAttribute("data-tab");
    
    tabButtons.forEach((btn) => btn.classList.remove("active"));
    tabContents.forEach((content) => content.classList.remove("active"));
    
    button.classList.add("active");
    document.getElementById(`${tabName}-tab`)?.classList.add("active");
  });
});

// Suggestion functions
function createSuggestionCard(suggestion: SuggestionEvent): HTMLElement {
  const card = document.createElement("div");
  card.className = `suggestion-card ${suggestion.type}`;
  card.dataset.timestamp = suggestion.timestamp.toString();

  const contentHtml = suggestion.type === "link" 
    ? `<a href="#" class="suggestion-link" data-url="${suggestion.content}">${suggestion.content}</a>`
    : escapeHtml(suggestion.content);

  const sourcesHtml = suggestion.sources?.length 
    ? `<div class="suggestion-sources">Sources: ${suggestion.sources.join(", ")}</div>` 
    : "";

  card.innerHTML = `
    <div class="suggestion-header">
      <span class="suggestion-title">${escapeHtml(suggestion.title || "Suggestion")}</span>
      <span class="suggestion-type">${suggestion.type}</span>
    </div>
    <div class="suggestion-content">${contentHtml}</div>
    <div class="suggestion-why">${escapeHtml(suggestion.why)}</div>
    ${sourcesHtml}
    <div class="suggestion-footer">
      <span class="suggestion-time">${formatTime(suggestion.timestamp)}</span>
      <button class="dismiss-btn">Dismiss</button>
    </div>
  `;

  const link = card.querySelector(".suggestion-link");
  if (link) {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const url = (e.target as HTMLElement).dataset.url;
      if (url) window.electronAPI.openExternal(url);
    });
  }

  card.querySelector(".dismiss-btn")?.addEventListener("click", () => {
    window.electronAPI.dismissSuggestion(suggestion.timestamp);
    removeSuggestion(suggestion.timestamp);
  });

  return card;
}

function addSuggestion(suggestion: SuggestionEvent): void {
  suggestions.unshift(suggestion);
  renderSuggestions();
}

function removeSuggestion(timestamp: number): void {
  const index = suggestions.findIndex((s) => s.timestamp === timestamp);
  if (index !== -1) {
    suggestions.splice(index, 1);
    renderSuggestions();
  }
}

function renderSuggestions(): void {
  if (suggestions.length === 0) {
    suggestionsContainer.innerHTML = `<div class="empty-state">No suggestions yet. Waiting for updates...</div>`;
    return;
  }

  suggestionsContainer.innerHTML = "";
  suggestions.forEach((suggestion) => {
    suggestionsContainer.appendChild(createSuggestionCard(suggestion));
  });
}

// Chat functions
function createMessageElement(message: ChatMessage): HTMLElement {
  const div = document.createElement("div");
  div.className = `message ${message.role}`;
  div.dataset.id = message.id;
  
  div.innerHTML = `
    <div class="message-content">${escapeHtml(message.content)}</div>
    <div class="message-time">${formatTime(message.timestamp)}</div>
  `;
  
  return div;
}

function createThinkingElement(event: ThinkingEvent): HTMLElement {
  const div = document.createElement("div");
  div.className = "thinking-container";
  div.id = "current-thinking";
  
  div.innerHTML = `
    <div class="thinking-header">
      <div class="thinking-spinner"></div>
      <span>Thinking...</span>
    </div>
    <div class="thinking-text">${escapeHtml(event.thought)}</div>
  `;
  
  return div;
}

function createToolElement(event: ToolExecutionEvent): HTMLElement {
  const div = document.createElement("div");
  div.className = "tool-container";
  div.dataset.toolId = event.id;
  
  const inputStr = JSON.stringify(event.input, null, 2);
  const outputHtml = event.output 
    ? `<div class="tool-output">${escapeHtml(event.output)}</div>` 
    : "";
  
  div.innerHTML = `
    <div class="tool-header">
      <div class="tool-name">
        <span class="tool-icon">🔧</span>
        <span>${escapeHtml(event.tool)}</span>
      </div>
      <span class="tool-status ${event.status}">${event.status}</span>
    </div>
    <div class="tool-input">${escapeHtml(inputStr)}</div>
    ${outputHtml}
  `;
  
  return div;
}

function createTypingIndicator(): HTMLElement {
  const div = document.createElement("div");
  div.className = "typing-indicator";
  div.id = "typing-indicator";
  
  div.innerHTML = `
    <div class="typing-dots">
      <span></span>
      <span></span>
      <span></span>
    </div>
    <span>Assistant is typing...</span>
  `;
  
  return div;
}

function renderChatMessages(): void {
  chatMessages.innerHTML = "";
  
  if (messages.length === 0 && !isTyping && !currentThinking) {
    chatMessages.innerHTML = `
      <div class="chat-empty">
        <div class="chat-empty-icon">💬</div>
        <div class="chat-empty-title">Start a conversation</div>
        <div class="chat-empty-subtitle">Ask me anything! I can help with web searches, calendar, weather, and more.</div>
      </div>
    `;
    return;
  }
  
  messages.forEach((msg) => {
    chatMessages.appendChild(createMessageElement(msg));
  });
  
  // Add any tool events for current chat
  toolEvents.forEach((event) => {
    if (event.chatId === currentChatId) {
      chatMessages.appendChild(createToolElement(event));
    }
  });
  
  // Add thinking indicator if active
  if (currentThinking) {
    chatMessages.appendChild(createThinkingElement(currentThinking));
  }
  
  // Add typing indicator
  if (isTyping) {
    chatMessages.appendChild(createTypingIndicator());
  }
  
  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function updateThinking(event: ThinkingEvent): void {
  currentThinking = event;
  currentChatId = event.chatId;
  
  const existingThinking = document.getElementById("current-thinking");
  if (existingThinking) {
    existingThinking.querySelector(".thinking-text")!.textContent = event.thought;
  } else {
    renderChatMessages();
  }
}

function updateToolEvent(event: ToolExecutionEvent): void {
  toolEvents.set(event.id, event);
  currentChatId = event.chatId;
  
  const existingTool = document.querySelector(`[data-tool-id="${event.id}"]`);
  if (existingTool) {
    // Update existing tool element
    const statusEl = existingTool.querySelector(".tool-status");
    if (statusEl) {
      statusEl.className = `tool-status ${event.status}`;
      statusEl.textContent = event.status;
    }
    
    if (event.output && event.status !== "running") {
      let outputEl = existingTool.querySelector(".tool-output");
      if (!outputEl) {
        outputEl = document.createElement("div");
        outputEl.className = "tool-output";
        existingTool.appendChild(outputEl);
      }
      outputEl.textContent = event.output;
    }
  } else {
    renderChatMessages();
  }
}

function updateTypingIndicator(typing: boolean): void {
  isTyping = typing;
  
  const existingIndicator = document.getElementById("typing-indicator");
  if (typing && !existingIndicator) {
    chatMessages.appendChild(createTypingIndicator());
    chatMessages.scrollTop = chatMessages.scrollHeight;
  } else if (!typing && existingIndicator) {
    existingIndicator.remove();
  }
}

function sendMessage(): void {
  const content = chatInput.value.trim();
  if (!content) return;
  
  const message: ChatMessage = {
    id: generateId(),
    role: "user",
    content,
    timestamp: Date.now()
  };
  
  // Clear thinking and tool events for new message
  currentThinking = null;
  toolEvents.clear();
  currentChatId = message.id;
  
  // Add to messages and render
  messages.push(message);
  renderChatMessages();
  
  // Send to server
  window.electronAPI.sendChatMessage(message);
  
  // Clear input
  chatInput.value = "";
  chatInput.style.height = "auto";
  chatSendBtn.disabled = true;
}

// Event listeners for chat
chatInput.addEventListener("input", () => {
  chatSendBtn.disabled = !chatInput.value.trim();
  
  // Auto-resize textarea
  chatInput.style.height = "auto";
  chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + "px";
});

chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    if (chatInput.value.trim()) {
      sendMessage();
    }
  }
});

chatSendBtn.addEventListener("click", () => {
  sendMessage();
});

// Connection status handlers
function updateConnectionStatus(connected: boolean): void {
  if (connected) {
    statusDot.classList.add("connected");
    statusText.textContent = "Connected";
  } else {
    statusDot.classList.remove("connected");
    statusText.textContent = "Disconnected";
  }
}

// Initialize
async function init(): Promise<void> {
  // Get initial connection status
  const connected = await window.electronAPI.getConnectionStatus();
  updateConnectionStatus(connected);
  
  // Set up event listeners
  window.electronAPI.onConnectionStatus(updateConnectionStatus);
  
  window.electronAPI.onSuggestion((suggestion: SuggestionEvent) => {
    addSuggestion(suggestion);
  });
  
  window.electronAPI.onChatResponse((message: ChatMessage) => {
    // Clear thinking when response arrives
    currentThinking = null;
    isTyping = false;
    
    messages.push(message);
    renderChatMessages();
  });
  
  window.electronAPI.onChatThinking((event: ThinkingEvent) => {
    updateThinking(event);
  });
  
  window.electronAPI.onChatTool((event: ToolExecutionEvent) => {
    updateToolEvent(event);
  });
  
  window.electronAPI.onChatTyping((event: TypingEvent) => {
    updateTypingIndicator(event.isTyping);
  });
  
  // Initial render
  renderSuggestions();
  renderChatMessages();
}

init();