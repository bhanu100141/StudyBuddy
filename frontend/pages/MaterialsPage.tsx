'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/frontend/store/authStore';
import axios from 'axios';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

interface Material {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  createdAt: string;
}

export default function MaterialsPage() {
  const router = useRouter();
  const { isAuthenticated, token, user } = useAuthStore();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      toast.error('Please login to access your materials');
      router.replace('/login');
      return;
    }
    loadMaterials();
  }, [isAuthenticated, token, router]);

  const loadMaterials = async () => {
    try {
      const response = await axios.get('/api/materials/list', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMaterials(response.data.materials);
    } catch (error) {
      console.error('Failed to load materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('/api/materials/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      await loadMaterials();
      toast.success('File uploaded successfully!');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.error || 'Failed to upload file');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/materials/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMaterials(materials.filter((m) => m.id !== id));
      toast.success('Material deleted successfully');
    } catch (error) {
      console.error('Failed to delete material:', error);
      toast.error('Failed to delete material');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  if (!isAuthenticated || !token || !user) {
    return null;
  }

  return (
    <div className="min-h-screen dark:bg-slate-950 bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold dark:text-white text-gray-900">My Materials</h1>
            <p className="dark:text-gray-400 text-gray-600 mt-2">
              Upload and manage your study materials
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 dark:bg-slate-700 bg-gray-600 text-white rounded-lg dark:hover:bg-slate-600 hover:bg-gray-700 transition"
          >
            ← Back to Chat
          </button>
        </div>

        <div className="mb-8">
          <label className="block">
            <input
              type="file"
              accept=".pdf,.txt,.docx"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className={`cursor-pointer inline-flex items-center px-6 py-3 dark:bg-primary-600 bg-blue-600 text-white rounded-lg font-semibold dark:hover:bg-primary-700 hover:bg-blue-700 transition ${
                uploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {uploading ? 'Uploading...' : '+ Upload Material'}
            </label>
          </label>
          <p className="text-sm dark:text-gray-400 text-gray-500 mt-2">
            Supported formats: PDF, TXT, DOCX (Max 10MB)
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="dark:text-gray-400 text-gray-500">Loading materials...</div>
          </div>
        ) : materials.length === 0 ? (
          <div className="text-center py-12 dark:bg-slate-900 bg-white rounded-lg border-2 border-dashed dark:border-slate-700 border-gray-300">
            <div className="text-4xl mb-4">📁</div>
            <p className="dark:text-gray-400 text-gray-500">No materials uploaded yet</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map((material) => (
              <div
                key={material.id}
                className="dark:bg-slate-900 bg-white p-6 rounded-lg shadow dark:shadow-slate-800 hover:shadow-lg dark:hover:shadow-slate-700 transition border dark:border-slate-800 border-transparent"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">
                    {material.fileType === 'application/pdf'
                      ? '📄'
                      : material.fileType === 'text/plain'
                      ? '📝'
                      : '📋'}
                  </div>
                  <button
                    onClick={() => handleDelete(material.id)}
                    className="dark:text-red-400 text-red-600 dark:hover:text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <h3 className="font-semibold dark:text-white text-gray-900 mb-2 truncate">
                  {material.fileName}
                </h3>
                <p className="text-sm dark:text-gray-400 text-gray-500 mb-4">
                  {formatFileSize(material.fileSize)} •{' '}
                  {new Date(material.createdAt).toLocaleDateString()}
                </p>
                <a
                  href={material.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dark:text-primary-400 text-blue-600 dark:hover:text-primary-500 hover:text-blue-700 text-sm font-medium"
                >
                  View File →
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
