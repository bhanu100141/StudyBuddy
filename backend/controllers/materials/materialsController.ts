import { prisma } from '@/backend/lib/prisma';
import { supabaseAdmin } from '@/backend/lib/supabase';
import { extractTextFromPDF } from '@/backend/lib/pdfParser';

export class MaterialsController {
  static async uploadMaterial(
    userId: string,
    file: File
  ) {
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

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extractedText = '';
    if (file.type === 'application/pdf') {
      extractedText = await extractTextFromPDF(buffer);
    } else if (file.type === 'text/plain') {
      extractedText = buffer.toString('utf-8');
    }

    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `materials/${userId}/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('study-materials')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      console.error('Error details:', JSON.stringify(uploadError, null, 2));
      throw new Error(`Failed to upload file to storage: ${uploadError.message || uploadError}`);
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('study-materials')
      .getPublicUrl(filePath);

    let material;
    try {
      material = await prisma.material.create({
        data: {
          userId,
          fileName: file.name,
          fileUrl: publicUrl,
          fileType: file.type,
          fileSize: file.size,
          content: extractedText || null,
        },
      });
    } catch (dbError: any) {
      console.error('Database error:', dbError);
      throw new Error(`Failed to save material to database: ${dbError.message}`);
    }

    return {
      message: 'File uploaded successfully',
      material: {
        id: material.id,
        fileName: material.fileName,
        fileType: material.fileType,
        fileSize: material.fileSize,
        createdAt: material.createdAt,
      },
    };
  }

  static async listMaterials(userId: string) {
    const materials = await prisma.material.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fileName: true,
        fileType: true,
        fileSize: true,
        fileUrl: true,
        createdAt: true,
      },
    });

    return { materials };
  }

  static async deleteMaterial(userId: string, materialId: string) {
    const material = await prisma.material.findUnique({
      where: { id: materialId },
    });

    if (!material) {
      throw new Error('Material not found');
    }

    if (material.userId !== userId) {
      throw new Error('Forbidden');
    }

    await prisma.material.delete({
      where: { id: materialId },
    });

    return { message: 'Material deleted successfully' };
  }
}
