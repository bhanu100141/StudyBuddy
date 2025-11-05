import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const generateChatResponse = async (
  messages: ChatMessage[],
  context?: string
): Promise<string> => {
  try {
    console.log('Generating chat response with Gemini...');
    console.log('Messages count:', messages.length);
    console.log('Has context:', !!context);

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Build the system prompt
    const systemPrompt = context
      ? `You are a helpful study buddy assistant. Use the following context from uploaded materials to answer questions:\n\n${context}`
      : 'You are a helpful study buddy assistant. Help students with their questions and provide clear explanations.';

    // Filter out system messages and get conversation history
    const conversationMessages = messages.filter(msg => msg.role !== 'system');

    // For Gemini, we need to build the full prompt
    // If this is the first message, we include the system prompt
    if (conversationMessages.length === 1) {
      // First message - include system prompt
      const userMessage = conversationMessages[0].content;
      const fullPrompt = `${systemPrompt}\n\n${userMessage}`;

      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      return response.text() || 'Sorry, I could not generate a response.';
    } else {
      // Multi-turn conversation - use chat mode
      // Convert messages to Gemini format (exclude the last message, we'll send it separately)
      const history = conversationMessages.slice(0, -1).map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      // Get the last user message
      const lastMessage = conversationMessages[conversationMessages.length - 1];

      const chat = model.startChat({
        history: history,
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
        },
      });

      // Send the latest message
      const result = await chat.sendMessage(lastMessage.content);
      const response = await result.response;

      return response.text() || 'Sorry, I could not generate a response.';
    }
  } catch (error: any) {
    console.error('Gemini API error:', error);
    console.error('Error details:', error.message);
    throw new Error(`Failed to generate response: ${error.message}`);
  }
};
