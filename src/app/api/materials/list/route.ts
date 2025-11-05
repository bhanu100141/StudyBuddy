import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/backend/lib/auth';
import { MaterialsController } from '@/backend/controllers/materials/materialsController';

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    const result = await MaterialsController.listMaterials(user.userId);
    return NextResponse.json(result);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
