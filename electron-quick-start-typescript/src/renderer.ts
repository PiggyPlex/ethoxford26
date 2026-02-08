// const interactive = document.getElementsByClassName("interactive");

// // FOr all of them bind mouse events to enable interaction with the overlay
// Array.from(interactive).forEach((element) => {
//   element.addEventListener("mouseenter", () => {
//     window.overlay.setInteractive(true);
//   });
  
//   element.addEventListener("mouseleave", () => {
//     window.overlay.setInteractive(false);
//   });
// });

let isExpanded = false;

const showChat = () => {
  tabButtons.forEach((btn) => btn.classList.remove("active"));
  tabContents.forEach((content) => content.classList.remove("active"));
  
  document.querySelector('[data-tab="chat"]')?.classList.add("active");
  document.getElementById(`chat-tab`)?.classList.add("active");
}

const showSuggestions = () => {
  tabButtons.forEach((btn) => btn.classList.remove("active"));
  tabContents.forEach((content) => content.classList.remove("active"));
  
  document.querySelector('[data-tab="suggestions"]')?.classList.add("active");
  document.getElementById(`suggestions-tab`)?.classList.add("active");
}

document.body.onmouseenter = () => {
  if (isExpanded) return;
  window.overlay.expandWindow();
  document.body.classList.add('expanded');
  showChat();
  isExpanded = true;
}

document.body.onmouseleave = () => {
  document.body.classList.remove('expanded');
  showSuggestions();
  setTimeout(() => {
    window.overlay.resetWindow();
  }, 100);
  isExpanded = false;
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.body.classList.remove('expanded');
    showSuggestions();
    setTimeout(() => {
      window.overlay.resetWindow();
    }, 100);
    isExpanded = false;
  }
});

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
  const card = document.createElement("article");
  card.className = `suggestion suggestion--${suggestion.type}`;
  card.dataset.timestamp = suggestion.timestamp.toString();
  card.setAttribute("role", "article");

  const headingId = `suggestion-title-${suggestion.timestamp}`;
  const isLink = suggestion.type === "link" || suggestion.type === "spotify";

  const mediaHtml = isLink && suggestion.type === "spotify"
    ? `<figure class="suggestion__media" aria-hidden="true"><img src="${escapeHtml(suggestion.content)}" alt="" /></figure>`
    : "";

  if (isLink) {
    // Link card: prominent title, small org/subtitle, big Open link pill and dismiss control.
    card.innerHTML = `
      ${mediaHtml}
      <header class="suggestion__header">
        <div class="suggestion__meta">
          <h3 id="${headingId}" class="suggestion__title">${escapeHtml(suggestion.title || "Suggestion")}</h3>
          <div class="suggestion__subtitle">${escapeHtml(
            // prefer an explicit short subtitle/source; fall back to why or first source
            suggestion.sources && suggestion.sources.length ? suggestion.sources[0] : (suggestion.why || "")
          )}</div>
        </div>

        <div class="suggestion__actions">
          <!-- keep a compact external icon for quick access (optional) -->
          <button class="suggestion__external" type="button" aria-label="Open link in browser" data-url="${escapeHtml(suggestion.content)}">
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M14 3h7v7"/><path d="M21 3L10 14"/></svg>
          </button>
        </div>
      </header>

      <div class="suggestion__content" aria-labelledby="${headingId}">
        <p>${escapeHtml(suggestion.content)}</p>
      </div>

      <footer class="suggestion__footer">
        <div class="left-cta">
          <button class="suggestion__open-btn" type="button" data-url="${escapeHtml(suggestion.content)}">
            <span>Open link</span>
            <span class="open-icon" aria-hidden="true">↗</span>
          </button>
        </div>
        <div class="suggestion__controls">
          <time class="suggestion__time" datetime="${new Date(suggestion.timestamp).toISOString()}">${formatTime(suggestion.timestamp)}</time>
          <button class="suggestion__dismiss" type="button" aria-label="Dismiss suggestion">Dismiss</button>
        </div>
      </footer>
    `;
  } else {
    // ...existing non-link card markup...
    card.innerHTML = `
      ${mediaHtml}
      <header class="suggestion__header">
        <div class="suggestion__meta">
          <h3 id="${headingId}" class="suggestion__title">${escapeHtml(suggestion.title || "Suggestion")}</h3>
          <div class="suggestion__subtitle">${escapeHtml(suggestion.why || "")}</div>
        </div>
        <div class="suggestion__actions">
          ${suggestion.type === "spotify" ? `<button class="suggestion__external" type="button" aria-label="Open link in browser" data-url="${escapeHtml(suggestion.content)}">
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 3h7v7"/><path d="M21 3L10 14"/></svg>
          </button>` : ``}
        </div>
      </header>

      <div class="suggestion__content" aria-labelledby="${headingId}">
        ${suggestion.type === "link" ? `<p class="suggestion__link"><a href="#" data-url="${escapeHtml(suggestion.content)}">${escapeHtml(suggestion.content)}</a></p>` : `<p>${escapeHtml(suggestion.content)}</p>`}
      </div>

      ${suggestion.sources && suggestion.sources.length ? `<div class="suggestion__sources">Sources: ${suggestion.sources.map(s => escapeHtml(s)).join(", ")}</div>` : ""}

      <footer class="suggestion__footer">
        <time class="suggestion__time" datetime="${new Date(suggestion.timestamp).toISOString()}">${formatTime(suggestion.timestamp)}</time>
        <div class="suggestion__controls">
          <button class="suggestion__dismiss" type="button" aria-label="Dismiss suggestion">Dismiss</button>
        </div>
      </footer>
    `;
  }

  // Wire up actions (open external / open pill)
  const openBtns = card.querySelectorAll("[data-url]");
  openBtns.forEach((el) => {
    el.addEventListener("click", (e) => {
      const url = (e.currentTarget as HTMLElement).getAttribute("data-url");
      if (url) window.electronAPI.openExternal(url);
    });
  });

  card.querySelector(".suggestion__dismiss")?.addEventListener("click", () => {
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
    // suggestionsContainer.innerHTML = `<div class="empty-state">No suggestions yet. Waiting for updates...</div>`;
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