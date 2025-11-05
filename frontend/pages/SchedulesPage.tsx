'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/frontend/store/authStore';
import axios from 'axios';
import { toast } from 'sonner';
import {  Plus, Edit2, Trash2, Calendar, CheckCircle, Circle, X, Clock, MapPin, AlertCircle } from 'lucide-react';

interface Course {
  id: string;
  name: string;
  color: string;
}

interface Schedule {
  id: string;
  title: string;
  description?: string;
  type: 'CLASS' | 'ASSIGNMENT' | 'EXAM' | 'TASK' | 'OTHER';
  date: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  isCompleted: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  course?: Course;
}

const TYPE_COLORS = {
  CLASS: 'bg-blue-100 text-blue-800',
  ASSIGNMENT: 'bg-yellow-100 text-yellow-800',
  EXAM: 'bg-red-100 text-red-800',
  TASK: 'bg-green-100 text-green-800',
  OTHER: 'bg-gray-100 text-gray-800',
};

const PRIORITY_COLORS = {
  LOW: 'text-green-600',
  MEDIUM: 'text-yellow-600',
  HIGH: 'text-red-600',
};

export default function SchedulesPage() {
  const router = useRouter();
  const { token, user, isAuthenticated } = useAuthStore();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'OTHER' as const,
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    courseId: '',
    priority: 'MEDIUM' as const,
  });

  useEffect(() => {
    if (!isAuthenticated || !token) {
      toast.error('Please login to access schedules');
      router.push('/login');
      return;
    }
    loadData();
  }, [isAuthenticated, token, router]);

  const loadData = async () => {
    try {
      const [schedulesRes, coursesRes] = await Promise.all([
        axios.get('/api/schedules/list', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('/api/courses/list', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setSchedules(schedulesRes.data.schedules);
      setCourses(coursesRes.data.courses);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!formData.date) {
      toast.error('Date is required');
      return;
    }

    try {
      const data = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        type: formData.type,
        date: formData.date,
        startTime: formData.startTime || undefined,
        endTime: formData.endTime || undefined,
        location: formData.location.trim() || undefined,
        courseId: formData.courseId || undefined,
        priority: formData.priority,
      };

      if (editingSchedule) {
        await axios.patch(`/api/schedules/${editingSchedule.id}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Schedule updated successfully');
      } else {
        await axios.post('/api/schedules/create', data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Schedule created successfully');
      }

      setShowModal(false);
      setEditingSchedule(null);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Schedule operation error:', error);
      toast.error(error.response?.data?.error || 'Failed to save schedule');
    }
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      title: schedule.title,
      description: schedule.description || '',
      type: schedule.type,
      date: schedule.date.split('T')[0],
      startTime: schedule.startTime || '',
      endTime: schedule.endTime || '',
      location: schedule.location || '',
      courseId: schedule.course?.id || '',
      priority: schedule.priority,
    });
    setShowModal(true);
  };

  const handleDelete = async (scheduleId: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) {
      return;
    }

    try {
      await axios.delete(`/api/schedules/${scheduleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Schedule deleted successfully');
      loadData();
    } catch (error) {
      console.error('Delete schedule error:', error);
      toast.error('Failed to delete schedule');
    }
  };

  const handleToggleComplete = async (scheduleId: string) => {
    try {
      await axios.patch(`/api/schedules/${scheduleId}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      loadData();
    } catch (error) {
      console.error('Toggle complete error:', error);
      toast.error('Failed to update schedule');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'OTHER',
      date: '',
      startTime: '',
      endTime: '',
      location: '',
      courseId: '',
      priority: 'MEDIUM',
    });
    setEditingSchedule(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSchedule(null);
    resetForm();
  };

  const filteredSchedules = schedules.filter(
    (s) => filterType === 'ALL' || s.type === filterType
  );

  const upcomingSchedules = filteredSchedules
    .filter((s) => !s.isCompleted && new Date(s.date) >= new Date(new Date().setHours(0, 0, 0, 0)))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const completedSchedules = filteredSchedules
    .filter((s) => s.isCompleted)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (!isAuthenticated || !token || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Schedule</h1>
              <p className="mt-2 text-sm text-gray-600">Manage your classes, assignments, exams, and tasks</p>
            </div>
            <button
              onClick={() => { router.back(); }}
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Actions */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
          >
            <Plus className="w-5 h-5" />
            Add New Schedule
          </button>

          {/* Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Types</option>
            <option value="CLASS">Classes</option>
            <option value="ASSIGNMENT">Assignments</option>
            <option value="EXAM">Exams</option>
            <option value="TASK">Tasks</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-600">Loading schedules...</div>
        ) : (
          <div className="space-y-8">
            {/* Upcoming */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Upcoming</h2>
              {upcomingSchedules.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No upcoming schedules</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingSchedules.map((schedule) => (
                    <ScheduleCard
                      key={schedule.id}
                      schedule={schedule}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggleComplete={handleToggleComplete}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Completed */}
            {completedSchedules.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Completed</h2>
                <div className="space-y-3">
                  {completedSchedules.map((schedule) => (
                    <ScheduleCard
                      key={schedule.id}
                      schedule={schedule}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggleComplete={handleToggleComplete}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingSchedule ? 'Edit Schedule' : 'Add New Schedule'}
                </h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Math 101 Class"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="CLASS">Class</option>
                      <option value="ASSIGNMENT">Assignment</option>
                      <option value="EXAM">Exam</option>
                      <option value="TASK">Task</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course (Optional)</label>
                  <select
                    value={formData.courseId}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">None</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-3 sm:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="col-span-3 sm:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="col-span-3 sm:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Room 101"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Optional description..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition"
                  >
                    {editingSchedule ? 'Update Schedule' : 'Add Schedule'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg font-semibold transition"
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

function ScheduleCard({
  schedule,
  onEdit,
  onDelete,
  onToggleComplete,
}: {
  schedule: Schedule;
  onEdit: (s: Schedule) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
}) {
  const date = new Date(schedule.date);
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className={`bg-white rounded-lg shadow p-4 hover:shadow-md transition ${schedule.isCompleted ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggleComplete(schedule.id)}
          className="mt-1 text-gray-400 hover:text-blue-600 transition"
        >
          {schedule.isCompleted ? (
            <CheckCircle className="w-6 h-6 text-green-600" />
          ) : (
            <Circle className="w-6 h-6" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h3 className={`font-bold text-lg ${schedule.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
              {schedule.title}
            </h3>
            <span className={`text-xs px-2 py-1 rounded-full ${TYPE_COLORS[schedule.type]}`}>
              {schedule.type}
            </span>
            <AlertCircle className={`w-4 h-4 ${PRIORITY_COLORS[schedule.priority]}`} />
          </div>

          {schedule.course && (
            <div className="flex items-center gap-2 mb-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: schedule.course.color }}
              />
              <span className="text-sm text-gray-600">{schedule.course.name}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formattedDate}
            </span>
            {schedule.startTime && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {schedule.startTime}
                {schedule.endTime && ` - ${schedule.endTime}`}
              </span>
            )}
            {schedule.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {schedule.location}
              </span>
            )}
          </div>

          {schedule.description && (
            <p className="text-sm text-gray-600">{schedule.description}</p>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(schedule)}
            className="text-blue-600 hover:text-blue-700 p-1"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(schedule.id)}
            className="text-red-600 hover:text-red-700 p-1"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
