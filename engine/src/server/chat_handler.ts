import { Effect } from "effect";
import { Socket } from "socket.io";
import { planningAgent } from "../agents/chat";
import { 
  ChatMessage, 
  ToolExecutionEvent,
  emitChatResponse, 
  emitToolExecution,
  emitThinking,
  emitTyping,
  setChatMessageHandler
} from "./socket";
import { observeAgent, AgentEvent } from "../utils/observable_agent";
import { v4 as uuidv4 } from "uuid";

// Store conversation history per socket
const conversationHistory = new Map<string, ChatMessage[]>();

const buildChatPrompt = (userMessage: string, history: ChatMessage[]): string => {
  const historyContext = history.length > 0 
    ? `\nCONVERSATION HISTORY:\n${history.slice(-10).map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}\n`
    : '';
  
  return `TASK: Respond to user's message as a helpful AI assistant
ROLE: You are a proactive AI assistant with access to various tools including calendar, web search, file management, weather, and Spotify.
${historyContext}
USER MESSAGE: ${userMessage}

INSTRUCTIONS:
1. Analyze what the user needs
2. Use appropriate tools to gather information or take actions
3. Provide a helpful, concise response
4. If using tools, explain what you're doing
5. Be conversational but efficient

AVAILABLE CAPABILITIES:
- Web search and browsing
- Calendar management (Google Calendar)
- Weather information
- File operations
- Spotify music control
- User context awareness (fetch_user_summary, fetch_context_notes)
- Facts storage (create_fact, read_facts)

Respond naturally and helpfully to the user's message.`;
};

// Process agent events and emit to socket
const processAgentEvent = (socket: Socket, chatId: string, event: AgentEvent): Effect.Effect<void, Error> =>
  Effect.gen(function* () {
    const timestamp = Date.now();
    
    switch (event._tag) {
      case "AgentStep": {
        // Emit tool execution start
        const toolStartEvent: ToolExecutionEvent = {
          id: uuidv4(),
          chatId,
          tool: event.action.tool,
          input: event.action.toolInput as Record<string, unknown>,
          status: "running",
          timestamp
        };
        yield* emitToolExecution(socket, toolStartEvent);
        
        // Emit thinking about tool usage
        yield* emitThinking(socket, {
          chatId,
          thought: `Using tool: ${event.action.tool}`,
          timestamp
        });
        
        // If observation is available (not pending), emit completion
        if (event.observation !== "pending...") {
          const toolCompleteEvent: ToolExecutionEvent = {
            id: toolStartEvent.id,
            chatId,
            tool: event.action.tool,
            input: event.action.toolInput as Record<string, unknown>,
            status: "completed",
            output: typeof event.observation === 'string' 
              ? event.observation.slice(0, 500) 
              : JSON.stringify(event.observation).slice(0, 500),
            timestamp: Date.now()
          };
          yield* emitToolExecution(socket, toolCompleteEvent);
          
          yield* emitThinking(socket, {
            chatId,
            thought: `Tool ${event.action.tool} completed. Processing results...`,
            timestamp: Date.now()
          });
        }
        break;
      }
      
      case "AgentFinish": {
        yield* emitThinking(socket, {
          chatId,
          thought: "Formulating response...",
          timestamp
        });
        break;
      }
      
      case "AgentError": {
        const errorEvent: ToolExecutionEvent = {
          id: uuidv4(),
          chatId,
          tool: "error",
          input: {},
          status: "error",
          output: String(event.error),
          timestamp
        };
        yield* emitToolExecution(socket, errorEvent);
        break;
      }
    }
  });

const handleChatMessage = (socket: Socket, message: ChatMessage): void => {
  const program = Effect.gen(function* () {
    const chatId = message.id;
    
    // Get or initialize conversation history
    const history = conversationHistory.get(socket.id) || [];
    
    // Add user message to history
    history.push(message);
    conversationHistory.set(socket.id, history);
    
    // Emit typing indicator
    yield* emitTyping(socket, true);
    
    // Build the prompt with conversation context
    const prompt = buildChatPrompt(message.content, history);
    
    // Emit initial thinking event
    yield* emitThinking(socket, {
      chatId,
      thought: "Processing your message and determining the best approach...",
      timestamp: Date.now()
    });

    // Log the internal prompt for observability
    yield* Effect.log(`[Chat ${chatId}] Internal prompt:\n${prompt.slice(0, 300)}...`);

    try {
      // Use observeAgent for full observability
      const { steps, result } = yield* Effect.catchAll(
        observeAgent(planningAgent, prompt),
        (error) => Effect.fail(error)
      );
      
      // Process each step and emit events
      for (const step of steps) {
        yield* processAgentEvent(socket, chatId, step);
      }
      
      // Log completion
      yield* Effect.log(`[Chat ${chatId}] Agent completed with ${steps.length} steps`);
      
      // Stop typing indicator
      yield* emitTyping(socket, false);
      
      // Extract final response from result
      const finalResponse = result.output?.output || 
                           result.output?.toString() || 
                           "I processed your request but couldn't generate a text response.";
      
      // Create assistant response message
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: "assistant",
        content: typeof finalResponse === 'string' ? finalResponse : JSON.stringify(finalResponse),
        timestamp: Date.now()
      };
      
      // Add to history
      history.push(assistantMessage);
      conversationHistory.set(socket.id, history);
      
      // Emit the response
      yield* emitChatResponse(socket, assistantMessage);
      
      yield* Effect.log(`[Chat ${chatId}] Response sent: ${assistantMessage.content.slice(0, 100)}...`);
      
    } catch (error) {
      yield* emitTyping(socket, false);
      
      yield* Effect.logError(`[Chat ${chatId}] Error: ${error}`);
      
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        role: "assistant",
        content: `I encountered an error while processing your request: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: Date.now()
      };
      
      history.push(errorMessage);
      conversationHistory.set(socket.id, history);
      
      yield* emitChatResponse(socket, errorMessage);
    }
  });
  
  // Run the effect
  Effect.runPromise(program).catch(console.error);
};

// Clean up conversation history when socket disconnects
export const cleanupConversation = (socketId: string): void => {
  conversationHistory.delete(socketId);
  console.log(`Cleaned up conversation history for ${socketId}`);
};

// Initialize the chat handler
export const initChatHandler = (): Effect.Effect<void, never> =>
  Effect.sync(() => {
    setChatMessageHandler(handleChatMessage);
    console.log("Chat handler initialized with observeAgent");
  });

// Get conversation history for a socket (useful for debugging)
export const getConversationHistory = (socketId: string): ChatMessage[] => {
  return conversationHistory.get(socketId) || [];
};

// Clear all conversation histories (useful for testing)
export const clearAllConversations = (): void => {
  conversationHistory.clear();
  console.log("Cleared all conversation histories");
};
