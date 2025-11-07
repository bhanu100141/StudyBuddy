'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/frontend/store/authStore';
import axios from 'axios';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, BookOpen, X } from 'lucide-react';

interface Course {
  id: string;
  name: string;
  code?: string;
  instructor?: string;
  color: string;
  credits?: number;
  semester?: string;
  description?: string;
  _count?: {
    schedules: number;
  };
}

const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
];

export default function CoursesPage() {
  const router = useRouter();
  const { token, user, isAuthenticated } = useAuthStore();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    instructor: '',
    color: COLORS[0],
    credits: '',
    semester: '',
    description: '',
  });

  useEffect(() => {
    if (!isAuthenticated || !token) {
      toast.error('Please login to access courses');
      router.push('/login');
      return;
    }
    loadCourses();
  }, [isAuthenticated, token, router]);

  const loadCourses = async () => {
    try {
      const response = await axios.get('/api/courses/list', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(response.data.courses);
    } catch (error) {
      console.error('Failed to load courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Course name is required');
      return;
    }

    try {
      const data = {
        name: formData.name.trim(),
        code: formData.code.trim() || undefined,
        instructor: formData.instructor.trim() || undefined,
        color: formData.color,
        credits: formData.credits ? parseInt(formData.credits) : undefined,
        semester: formData.semester.trim() || undefined,
        description: formData.description.trim() || undefined,
      };

      if (editingCourse) {
        await axios.patch(`/api/courses/${editingCourse.id}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Course updated successfully');
      } else {
        await axios.post('/api/courses/create', data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Course created successfully');
      }

      setShowModal(false);
      setEditingCourse(null);
      resetForm();
      loadCourses();
    } catch (error: any) {
      console.error('Course operation error:', error);
      toast.error(error.response?.data?.error || 'Failed to save course');
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      code: course.code || '',
      instructor: course.instructor || '',
      color: course.color,
      credits: course.credits?.toString() || '',
      semester: course.semester || '',
      description: course.description || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course? This will also remove associated schedules.')) {
      return;
    }

    try {
      await axios.delete(`/api/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Course deleted successfully');
      loadCourses();
    } catch (error) {
      console.error('Delete course error:', error);
      toast.error('Failed to delete course');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      instructor: '',
      color: COLORS[0],
      credits: '',
      semester: '',
      description: '',
    });
    setEditingCourse(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCourse(null);
    resetForm();
  };

  if (!isAuthenticated || !token || !user) {
    return null;
  }

  return (
    <div className="min-h-screen dark:bg-slate-950 bg-gray-50">
      {/* Header */}
      <div className="dark:bg-slate-900 bg-white shadow border-b dark:border-slate-800 border-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold dark:text-white text-gray-900">My Courses</h1>
              <p className="mt-2 text-sm dark:text-gray-400 text-gray-600">Manage your courses and subjects</p>
            </div>
            <button
              onClick={() => { router.back(); }}
              className="dark:text-gray-400 text-gray-600 dark:hover:text-white hover:text-gray-900 font-medium"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Course Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowModal(true)}
            className="dark:bg-primary-600 bg-blue-600 dark:hover:bg-primary-700 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition"
          >
            <Plus className="w-5 h-5" />
            Add New Course
          </button>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="text-center py-12 dark:text-gray-400 text-gray-600">Loading courses...</div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12 dark:bg-slate-900 bg-white rounded-lg shadow dark:shadow-slate-800 border dark:border-slate-800 border-transparent">
            <BookOpen className="w-16 h-16 mx-auto dark:text-gray-600 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold dark:text-white text-gray-900 mb-2">No courses yet</h3>
            <p className="dark:text-gray-400 text-gray-600 mb-4">Get started by adding your first course</p>
            <button
              onClick={() => setShowModal(true)}
              className="dark:bg-primary-600 bg-blue-600 dark:hover:bg-primary-700 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              Add Course
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="dark:bg-slate-900 bg-white rounded-lg shadow-md dark:shadow-slate-800 overflow-hidden hover:shadow-lg dark:hover:shadow-slate-700 transition border dark:border-slate-800 border-transparent"
              >
                <div
                  className="h-3"
                  style={{ backgroundColor: course.color }}
                />
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold dark:text-white text-gray-900">{course.name}</h3>
                      {course.code && (
                        <p className="text-sm dark:text-gray-400 text-gray-600 mt-1">{course.code}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(course)}
                        className="dark:text-primary-400 text-blue-600 dark:hover:text-primary-500 hover:text-blue-700 p-1"
                        title="Edit course"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(course.id)}
                        className="dark:text-red-400 text-red-600 dark:hover:text-red-500 hover:text-red-700 p-1"
                        title="Delete course"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {course.instructor && (
                    <p className="text-sm dark:text-gray-300 text-gray-700 mb-2">
                      <span className="font-semibold">Instructor:</span> {course.instructor}
                    </p>
                  )}

                  <div className="flex gap-3 text-sm dark:text-gray-400 text-gray-600 mb-3">
                    {course.credits && (
                      <span className="dark:bg-slate-800 bg-gray-100 px-2 py-1 rounded">{course.credits} credits</span>
                    )}
                    {course.semester && (
                      <span className="dark:bg-slate-800 bg-gray-100 px-2 py-1 rounded">{course.semester}</span>
                    )}
                  </div>

                  {course.description && (
                    <p className="text-sm dark:text-gray-400 text-gray-600 line-clamp-2 mb-3">{course.description}</p>
                  )}

                  <div className="text-sm dark:text-gray-500 text-gray-500">
                    {course._count?.schedules || 0} scheduled items
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 dark:bg-black/70 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="dark:bg-slate-900 bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border dark:border-slate-800 border-transparent">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold dark:text-white text-gray-900">
                  {editingCourse ? 'Edit Course' : 'Add New Course'}
                </h2>
                <button
                  onClick={closeModal}
                  className="dark:text-gray-400 text-gray-400 dark:hover:text-gray-200 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                    Course Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border dark:border-slate-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 dark:focus:ring-primary-500 focus:ring-blue-500 dark:bg-slate-800 bg-white dark:text-white text-gray-900"
                    placeholder="e.g., Introduction to Computer Science"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                      Course Code
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className="w-full px-3 py-2 border dark:border-slate-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 dark:focus:ring-primary-500 focus:ring-blue-500 dark:bg-slate-800 bg-white dark:text-white text-gray-900"
                      placeholder="e.g., CS101"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                      Instructor
                    </label>
                    <input
                      type="text"
                      value={formData.instructor}
                      onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                      className="w-full px-3 py-2 border dark:border-slate-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 dark:focus:ring-primary-500 focus:ring-blue-500 dark:bg-slate-800 bg-white dark:text-white text-gray-900"
                      placeholder="e.g., Dr. Smith"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                      Credits
                    </label>
                    <input
                      type="number"
                      value={formData.credits}
                      onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                      className="w-full px-3 py-2 border dark:border-slate-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 dark:focus:ring-primary-500 focus:ring-blue-500 dark:bg-slate-800 bg-white dark:text-white text-gray-900"
                      placeholder="e.g., 3"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                      Semester
                    </label>
                    <input
                      type="text"
                      value={formData.semester}
                      onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                      className="w-full px-3 py-2 border dark:border-slate-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 dark:focus:ring-primary-500 focus:ring-blue-500 dark:bg-slate-800 bg-white dark:text-white text-gray-900"
                      placeholder="e.g., Fall 2025"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                    Color
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-10 h-10 rounded-lg border-2 transition ${
                          formData.color === color
                            ? 'dark:border-white border-gray-900 scale-110'
                            : 'border-transparent dark:hover:border-slate-600 hover:border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border dark:border-slate-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 dark:focus:ring-primary-500 focus:ring-blue-500 dark:bg-slate-800 bg-white dark:text-white text-gray-900"
                    rows={3}
                    placeholder="Optional course description..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 dark:bg-primary-600 bg-blue-600 dark:hover:bg-primary-700 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition"
                  >
                    {editingCourse ? 'Update Course' : 'Add Course'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 dark:bg-slate-700 bg-gray-200 dark:hover:bg-slate-600 hover:bg-gray-300 dark:text-white text-gray-800 py-2 rounded-lg font-semibold transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
