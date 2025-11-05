import { prisma } from '@/backend/lib/prisma';
import { generateChatResponse } from '@/backend/lib/gemini';
import { supabaseAdmin } from '@/backend/lib/supabase';
import { extractTextFromPDF } from '@/backend/lib/pdfParser';

export class ChatsController {
  static async createChat(userId: string, title?: string) {
    const chat = await prisma.chat.create({
      data: {
        userId,
        title: title || 'Untitled Chat',
      },
    });

    return { chat };
  }

  static generateChatTitle(message: string): string {
    // Remove extra whitespace and newlines
    const cleanMessage = message.trim().replace(/\s+/g, ' ');

    // Take first 50 characters or up to first sentence
    const firstSentence = cleanMessage.split(/[.!?]/)[0];
    const truncated = firstSentence.length > 50
      ? firstSentence.substring(0, 47) + '...'
      : firstSentence;

    return truncated || 'Untitled Chat';
  }

  static async listChats(userId: string) {
    const chats = await prisma.chat.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { messages: true },
        },
      },
    });

    return { chats };
  }

  static async getChat(userId: string, chatId: string) {
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!chat) {
      throw new Error('Chat not found');
    }

    if (chat.userId !== userId) {
      throw new Error('Forbidden');
    }

    return { chat };
  }

  static async updateChat(userId: string, chatId: string, title: string) {
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      throw new Error('Chat title is required');
    }

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      throw new Error('Chat not found');
    }

    if (chat.userId !== userId) {
      throw new Error('Forbidden');
    }

    const updatedChat = await prisma.chat.update({
      where: { id: chatId },
      data: {
        title: title.trim(),
        updatedAt: new Date(),
      },
    });

    return { chat: updatedChat };
  }

  static async deleteChat(userId: string, chatId: string) {
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      throw new Error('Chat not found');
    }

    if (chat.userId !== userId) {
      throw new Error('Forbidden');
    }

    await prisma.chat.delete({
      where: { id: chatId },
    });

    return { message: 'Chat deleted successfully' };
  }

  static async sendMessage(userId: string, chatId: string, content: string) {
    try {
      console.log('sendMessage called:', { userId, chatId, contentLength: content?.length });

      if (!content || typeof content !== 'string') {
        throw new Error('Message content is required');
      }

      const chat = await prisma.chat.findUnique({
        where: { id: chatId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!chat) {
        throw new Error('Chat not found');
      }

      if (chat.userId !== userId) {
        throw new Error('Forbidden');
      }

      console.log('Creating user message...');
      const userMessage = await prisma.message.create({
        data: {
          chatId,
          role: 'user',
          content,
        },
      });
      console.log('User message created:', userMessage.id);

      // Get user's materials for context
      console.log('Fetching materials for context...');
      const materials = await prisma.material.findMany({
        where: { userId },
        select: { content: true },
      });

      const contextText = materials
        .filter((m) => m.content)
        .map((m) => m.content)
        .join('\n\n');

      console.log('Materials found:', materials.length);

      const previousMessages = chat.messages.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));

      console.log('Generating AI response...');
      const aiResponse = await generateChatResponse(
        [...previousMessages, { role: 'user', content }],
        contextText
      );
      console.log('AI response generated:', aiResponse.substring(0, 50) + '...');

      console.log('Creating assistant message...');
      const assistantMessage = await prisma.message.create({
        data: {
          chatId,
          role: 'assistant',
          content: aiResponse,
        },
      });

      // Auto-generate chat title from first message if still using default title
      const shouldUpdateTitle = chat.title === 'Untitled Chat' ||
                                chat.title === 'New Chat' ||
                                chat.messages.length === 0;

      if (shouldUpdateTitle) {
        const generatedTitle = this.generateChatTitle(content);
        await prisma.chat.update({
          where: { id: chatId },
          data: {
            title: generatedTitle,
            updatedAt: new Date()
          },
        });
        console.log('Chat title auto-generated:', generatedTitle);
      } else {
        await prisma.chat.update({
          where: { id: chatId },
          data: { updatedAt: new Date() },
        });
      }

      console.log('Message sent successfully');
      return {
        userMessage,
        assistantMessage,
      };
    } catch (error) {
      console.error('Error in sendMessage:', error);
      throw error;
    }
  }

  static async sendMessageWithFile(
    userId: string,
    chatId: string,
    content: string,
    file: File
  ) {
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!chat) {
      throw new Error('Chat not found');
    }

    if (chat.userId !== userId) {
      throw new Error('Forbidden');
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only PDF, TXT, and DOCX files are allowed');
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('File size exceeds 10MB limit');
    }

    // Upload file to Supabase storage
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `chat-attachments/${userId}/${chatId}/${fileName}`;

    const { error: uploadError } = await supabaseAdmin().storage
      .from('study-materials')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      throw new Error(`Failed to upload file: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabaseAdmin().storage
      .from('study-materials')
      .getPublicUrl(filePath);

    // Extract text content from file
    let extractedText = '';
    if (file.type === 'application/pdf') {
      extractedText = await extractTextFromPDF(buffer);
    } else if (file.type === 'text/plain') {
      extractedText = buffer.toString('utf-8');
    }

    // Create user message with file attachment
    const userMessage = await prisma.message.create({
      data: {
        chatId,
        role: 'user',
        content,
        hasAttachment: true,
        fileName: file.name,
        fileUrl: publicUrl,
        fileType: file.type,
        fileSize: file.size,
        fileContent: extractedText || null,
      },
    });

    // Get user's materials for context
    const materials = await prisma.material.findMany({
      where: { userId },
      select: { content: true },
    });

    // Get file attachments from this chat for context
    const chatAttachments = await prisma.message.findMany({
      where: {
        chatId,
        hasAttachment: true,
        fileContent: { not: null },
      },
      select: { fileContent: true, fileName: true },
    });

    // Combine context from materials and chat attachments
    const materialContext = materials
      .filter((m) => m.content)
      .map((m) => m.content)
      .join('\n\n');

    const attachmentContext = chatAttachments
      .filter((a) => a.fileContent)
      .map((a) => `[From ${a.fileName}]\n${a.fileContent}`)
      .join('\n\n');

    const fullContext = [materialContext, attachmentContext]
      .filter(Boolean)
      .join('\n\n=== Additional Context ===\n\n');

    // Build conversation history
    const previousMessages = chat.messages.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    // Generate AI response
    const aiResponse = await generateChatResponse(
      [...previousMessages, { role: 'user', content }],
      fullContext
    );

    const assistantMessage = await prisma.message.create({
      data: {
        chatId,
        role: 'assistant',
        content: aiResponse,
      },
    });

    // Auto-generate chat title from first message if still using default title
    const shouldUpdateTitle = chat.title === 'Untitled Chat' ||
                              chat.title === 'New Chat' ||
                              chat.messages.length === 0;

    if (shouldUpdateTitle) {
      const generatedTitle = this.generateChatTitle(content);
      await prisma.chat.update({
        where: { id: chatId },
        data: {
          title: generatedTitle,
          updatedAt: new Date()
        },
      });
    } else {
      await prisma.chat.update({
        where: { id: chatId },
        data: { updatedAt: new Date() },
      });
    }

    return {
      userMessage,
      assistantMessage,
    };
  }
}
