import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/backend/lib/auth';
import { ChatsController } from '@/backend/controllers/chats/chatsController';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requireAuth(request);
    const contentType = request.headers.get('content-type') || '';

    // Check if this is a file upload (multipart/form-data)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const content = formData.get('content') as string;
      const file = formData.get('file') as File | null;

      if (!content) {
        return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
      }

      if (!file) {
        return NextResponse.json({ error: 'File is required' }, { status: 400 });
      }

      const result = await ChatsController.sendMessageWithFile(
        user.userId,
        params.id,
        content,
        file
      );
      return NextResponse.json(result);
    } else {
      // Regular text message
      const body = await request.json();
      const result = await ChatsController.sendMessage(
        user.userId,
        params.id,
        body.content
      );
      return NextResponse.json(result);
    }
  } catch (error: any) {
    console.error('Chat message error:', error);
    console.error('Error stack:', error.stack);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Chat not found') {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
