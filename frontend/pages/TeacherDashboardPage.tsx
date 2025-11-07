'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/frontend/store/authStore';
import axios from 'axios';
import { toast } from 'sonner';

interface Student {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  lastActive: string;
  totalMessages: number;
  _count: {
    chats: number;
    materials: number;
  };
}

interface Stats {
  totalStudents: number;
  totalChats: number;
  totalMaterials: number;
  totalMessages: number;
  recentStudents: number;
}

interface Chat {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    messages: number;
  };
}

interface Material {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
}

interface StudentDetails {
  student: {
    id: string;
    email: string;
    name: string;
    role: string;
    createdAt: string;
    updatedAt: string;
  };
  chats: Chat[];
  materials: Material[];
  totalMessages: number;
  statistics: {
    totalChats: number;
    totalMaterials: number;
    totalMessages: number;
  };
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  type: 'TASK' | 'EXAM' | 'QUIZ' | 'PROJECT';
  status: 'PENDING' | 'SUBMITTED' | 'GRADED' | 'OVERDUE';
  dueDate: string;
  totalMarks?: number;
  marksObtained?: number;
  submissionText?: string;
  submissionUrl?: string;
  feedback?: string;
  createdAt: string;
  student: {
    id: string;
    name: string;
    email: string;
  };
}

interface Doubt {
  id: string;
  subject: string;
  question: string;
  answer?: string;
  status: 'OPEN' | 'ANSWERED' | 'CLOSED';
  createdAt: string;
  student: {
    id: string;
    name: string;
    email: string;
  };
  teacher?: {
    id: string;
    name: string;
    email: string;
  };
  meetingRequest?: MeetingRequest;
}

interface MeetingRequest {
  id: string;
  type: 'DOUBT_CLARIFICATION' | 'EXAM' | 'DISCUSSION';
  status: 'REQUESTED' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  subject: string;
  description: string;
  scheduledAt?: string;
  meetLink?: string;
  duration?: number;
  createdAt: string;
  student: {
    id: string;
    name: string;
    email: string;
  };
  teacher?: {
    id: string;
    name: string;
    email: string;
  };
  doubt?: Doubt;
}

export default function TeacherDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user, token, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'students' | 'assignments' | 'doubts' | 'meetings'>('students');
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentDetails, setStudentDetails] = useState<StudentDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activityFilter, setActivityFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Assignments
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);

  // Doubts
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [selectedDoubt, setSelectedDoubt] = useState<Doubt | null>(null);
  const [showAnswerDoubtModal, setShowAnswerDoubtModal] = useState(false);

  // Meetings
  const [meetings, setMeetings] = useState<MeetingRequest[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingRequest | null>(null);
  const [showScheduleMeetingModal, setShowScheduleMeetingModal] = useState(false);

  // Grading
  const [selectedAssignmentForGrade, setSelectedAssignmentForGrade] = useState<Assignment | null>(null);
  const [showGradeModal, setShowGradeModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      toast.error('Please login to access the teacher dashboard');
      router.replace('/login');
      return;
    }

    if (user?.role !== 'TEACHER') {
      toast.error('Access denied. This area is for teachers only');
      router.replace('/dashboard');
      return;
    }

    loadData();
  }, [isAuthenticated, token, user, router]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, token]);

  // Load student details when selected
  useEffect(() => {
    if (selectedStudent) {
      loadStudentDetails(selectedStudent.id);
    } else {
      setStudentDetails(null);
    }
  }, [selectedStudent]);

  const loadData = async () => {
    try {
      const [studentsRes, statsRes] = await Promise.all([
        axios.get('/api/teacher/students', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('/api/teacher/stats', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setStudents(studentsRes.data.students);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudentDetails = async (studentId: string) => {
    setLoadingDetails(true);
    try {
      const response = await axios.get(`/api/teacher/students/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudentDetails(response.data);
    } catch (error) {
      console.error('Failed to load student details:', error);
      toast.error('Failed to load student details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const loadAssignments = async () => {
    try {
      const response = await axios.get('/api/teacher/assignments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAssignments(response.data.assignments);
    } catch (error) {
      console.error('Failed to load assignments:', error);
    }
  };

  const loadDoubts = async () => {
    try {
      const response = await axios.get('/api/teacher/doubts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDoubts(response.data.doubts);
    } catch (error) {
      console.error('Failed to load doubts:', error);
    }
  };

  const loadMeetings = async () => {
    try {
      const response = await axios.get('/api/teacher/meetings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMeetings(response.data.meetings);
    } catch (error) {
      console.error('Failed to load meetings:', error);
    }
  };

  // Load data based on active tab
  useEffect(() => {
    if (!token) return;

    if (activeTab === 'assignments') {
      loadAssignments();
    } else if (activeTab === 'doubts') {
      loadDoubts();
    } else if (activeTab === 'meetings') {
      loadMeetings();
    }
  }, [activeTab, token]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Filter and sort students
  const getFilteredAndSortedStudents = () => {
    let filtered = [...students];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (student) =>
          student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply activity filter
    if (activityFilter !== 'all') {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      filtered = filtered.filter((student) => {
        const lastActive = new Date(student.lastActive);
        const isActive = lastActive > threeDaysAgo;
        return activityFilter === 'active' ? isActive : !isActive;
      });
    }

    // Apply sorting
    if (sortConfig) {
      filtered.sort((a, b) => {
        let aValue: any = a[sortConfig.key as keyof Student];
        let bValue: any = b[sortConfig.key as keyof Student];

        // Handle nested _count properties
        if (sortConfig.key === 'chats') {
          aValue = a._count.chats;
          bValue = b._count.chats;
        } else if (sortConfig.key === 'materials') {
          aValue = a._count.materials;
          bValue = b._count.materials;
        }

        // Convert dates to timestamps for comparison
        if (aValue instanceof Date) aValue = aValue.getTime();
        if (bValue instanceof Date) bValue = bValue.getTime();
        if (typeof aValue === 'string' && sortConfig.key.includes('At')) {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  };

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const exportToCSV = () => {
    const filtered = getFilteredAndSortedStudents();
    const headers = ['Name', 'Email', 'Chats', 'Materials', 'Messages', 'Last Active', 'Joined'];
    const csvContent = [
      headers.join(','),
      ...filtered.map((student) =>
        [
          `"${student.name}"`,
          student.email,
          student._count.chats,
          student._count.materials,
          student.totalMessages,
          formatDate(student.lastActive),
          formatDate(student.createdAt),
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Student data exported successfully');
  };

  const filteredStudents = getFilteredAndSortedStudents();

  if (!isAuthenticated || !token || !user || user.role !== 'TEACHER') {
    return null;
  }

  return (
    <div className="min-h-screen dark:bg-slate-950 bg-gray-50">
      {/* Header */}
      <header className="dark:bg-slate-900 bg-white shadow-sm border-b dark:border-slate-800 border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold dark:text-white text-gray-900">Teacher Dashboard</h1>
              <p className="text-sm dark:text-gray-400 text-gray-600 mt-1">Welcome back, {user?.name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 dark:bg-red-600 bg-red-600 text-white rounded-lg dark:hover:bg-red-700 hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="dark:bg-slate-900 bg-white border-b dark:border-slate-800 border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('students')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'students'
                  ? 'border-blue-500 dark:text-blue-400 text-blue-600'
                  : 'border-transparent dark:text-gray-400 text-gray-500 dark:hover:text-gray-300 hover:text-gray-700 dark:hover:border-gray-300 hover:border-gray-300'
              }`}
            >
              Students
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'assignments'
                  ? 'border-blue-500 dark:text-blue-400 text-blue-600'
                  : 'border-transparent dark:text-gray-400 text-gray-500 dark:hover:text-gray-300 hover:text-gray-700 dark:hover:border-gray-300 hover:border-gray-300'
              }`}
            >
              Assignments
            </button>
            <button
              onClick={() => setActiveTab('doubts')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'doubts'
                  ? 'border-blue-500 dark:text-blue-400 text-blue-600'
                  : 'border-transparent dark:text-gray-400 text-gray-500 dark:hover:text-gray-300 hover:text-gray-700 dark:hover:border-gray-300 hover:border-gray-300'
              }`}
            >
              Doubts
            </button>
            <button
              onClick={() => setActiveTab('meetings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'meetings'
                  ? 'border-blue-500 dark:text-blue-400 text-blue-600'
                  : 'border-transparent dark:text-gray-400 text-gray-500 dark:hover:text-gray-300 hover:text-gray-700 dark:hover:border-gray-300 hover:border-gray-300'
              }`}
            >
              Meetings
            </button>
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Students Tab */}
        {activeTab === 'students' && (
          <>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="dark:text-gray-400 text-gray-500">Loading...</div>
              </div>
            ) : (
              <>
                {/* Controls Bar */}
                <div className="mb-6 flex flex-col md:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search students by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 dark:bg-slate-900 bg-white border dark:border-slate-700 border-gray-300 rounded-lg dark:text-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <svg
                    className="absolute left-3 top-2.5 h-5 w-5 dark:text-gray-400 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>

              {/* Activity Filter */}
              <select
                value={activityFilter}
                onChange={(e) => setActivityFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="px-4 py-2 dark:bg-slate-900 bg-white border dark:border-slate-700 border-gray-300 rounded-lg dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Students</option>
                <option value="active">Active (3 days)</option>
                <option value="inactive">Inactive (3+ days)</option>
              </select>

              {/* Export Button */}
              <button
                onClick={exportToCSV}
                disabled={filteredStudents.length === 0}
                className="px-4 py-2 dark:bg-green-600 bg-green-600 text-white rounded-lg dark:hover:bg-green-700 hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Export CSV
              </button>

              {/* Refresh Button */}
              <button
                onClick={loadData}
                disabled={loading}
                className="px-4 py-2 dark:bg-blue-600 bg-blue-600 text-white rounded-lg dark:hover:bg-blue-700 hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                <svg className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </button>

              {/* Auto-Refresh Toggle */}
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                  autoRefresh
                    ? 'dark:bg-purple-600 bg-purple-600 text-white dark:hover:bg-purple-700 hover:bg-purple-700'
                    : 'dark:bg-slate-900 bg-white border dark:border-slate-700 border-gray-300 dark:text-white text-gray-900 dark:hover:bg-slate-800 hover:bg-gray-50'
                }`}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Auto {autoRefresh ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Statistics Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="dark:bg-slate-900 bg-white rounded-lg shadow dark:shadow-slate-800 p-6 border dark:border-slate-800 border-transparent">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div className="ml-5">
                      <p className="text-sm font-medium dark:text-gray-400 text-gray-500">Total Students</p>
                      <p className="text-2xl font-semibold dark:text-white text-gray-900">{stats.totalStudents}</p>
                    </div>
                  </div>
                </div>

                <div className="dark:bg-slate-900 bg-white rounded-lg shadow dark:shadow-slate-800 p-6 border dark:border-slate-800 border-transparent">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                    <div className="ml-5">
                      <p className="text-sm font-medium dark:text-gray-400 text-gray-500">Total Chats</p>
                      <p className="text-2xl font-semibold dark:text-white text-gray-900">{stats.totalChats}</p>
                    </div>
                  </div>
                </div>

                <div className="dark:bg-slate-900 bg-white rounded-lg shadow dark:shadow-slate-800 p-6 border dark:border-slate-800 border-transparent">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                    </div>
                    <div className="ml-5">
                      <p className="text-sm font-medium dark:text-gray-400 text-gray-500">Total Messages</p>
                      <p className="text-2xl font-semibold dark:text-white text-gray-900">{stats.totalMessages}</p>
                    </div>
                  </div>
                </div>

                <div className="dark:bg-slate-900 bg-white rounded-lg shadow dark:shadow-slate-800 p-6 border dark:border-slate-800 border-transparent">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="ml-5">
                      <p className="text-sm font-medium dark:text-gray-400 text-gray-500">Total Materials</p>
                      <p className="text-2xl font-semibold dark:text-white text-gray-900">{stats.totalMaterials}</p>
                    </div>
                  </div>
                </div>

                {/* <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                    </div>
                    <div className="ml-5">
                      <p className="text-sm font-medium text-gray-500">New (7 days)</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.recentStudents}</p>
                    </div>
                  </div>
                </div> */}
              </div>
            )}

            {/* Students Table */}
            <div className="dark:bg-slate-900 bg-white rounded-lg shadow dark:shadow-slate-800 overflow-hidden border dark:border-slate-800 border-transparent">
              <div className="px-6 py-4 border-b dark:border-slate-800 border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold dark:text-white text-gray-900">
                  All Students {filteredStudents.length !== students.length && `(${filteredStudents.length} of ${students.length})`}
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y dark:divide-slate-800 divide-gray-200">
                  <thead className="dark:bg-slate-950 bg-gray-50">
                    <tr>
                      <th
                        onClick={() => handleSort('name')}
                        className="px-6 py-3 text-left text-xs font-medium dark:text-gray-400 text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-900"
                      >
                        <div className="flex items-center gap-1">
                          Student
                          {sortConfig?.key === 'name' && (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              {sortConfig.direction === 'asc' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              )}
                            </svg>
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('email')}
                        className="px-6 py-3 text-left text-xs font-medium dark:text-gray-400 text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-900"
                      >
                        <div className="flex items-center gap-1">
                          Email
                          {sortConfig?.key === 'email' && (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              {sortConfig.direction === 'asc' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              )}
                            </svg>
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('chats')}
                        className="px-6 py-3 text-left text-xs font-medium dark:text-gray-400 text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-900"
                      >
                        <div className="flex items-center gap-1">
                          Chats
                          {sortConfig?.key === 'chats' && (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              {sortConfig.direction === 'asc' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              )}
                            </svg>
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('materials')}
                        className="px-6 py-3 text-left text-xs font-medium dark:text-gray-400 text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-900"
                      >
                        <div className="flex items-center gap-1">
                          Materials
                          {sortConfig?.key === 'materials' && (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              {sortConfig.direction === 'asc' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              )}
                            </svg>
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('totalMessages')}
                        className="px-6 py-3 text-left text-xs font-medium dark:text-gray-400 text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-900"
                      >
                        <div className="flex items-center gap-1">
                          Messages
                          {sortConfig?.key === 'totalMessages' && (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              {sortConfig.direction === 'asc' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              )}
                            </svg>
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('lastActive')}
                        className="px-6 py-3 text-left text-xs font-medium dark:text-gray-400 text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-900"
                      >
                        <div className="flex items-center gap-1">
                          Last Active
                          {sortConfig?.key === 'lastActive' && (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              {sortConfig.direction === 'asc' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              )}
                            </svg>
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('createdAt')}
                        className="px-6 py-3 text-left text-xs font-medium dark:text-gray-400 text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-900"
                      >
                        <div className="flex items-center gap-1">
                          Joined
                          {sortConfig?.key === 'createdAt' && (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              {sortConfig.direction === 'asc' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              )}
                            </svg>
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium dark:text-gray-400 text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="dark:bg-slate-900 bg-white divide-y dark:divide-slate-800 divide-gray-200">
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="dark:hover:bg-slate-800 hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-lg">
                                {student.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium dark:text-white text-gray-900">{student.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm dark:text-gray-300 text-gray-900">{student.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full dark:bg-blue-500/20 bg-blue-100 dark:text-blue-400 text-blue-800">
                            {student._count.chats}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full dark:bg-green-500/20 bg-green-100 dark:text-green-400 text-green-800">
                            {student._count.materials}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full dark:bg-purple-500/20 bg-purple-100 dark:text-purple-400 text-purple-800">
                            {student.totalMessages}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm dark:text-gray-400 text-gray-500">
                          {getTimeAgo(student.lastActive)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm dark:text-gray-400 text-gray-500">
                          {formatDate(student.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => setSelectedStudent(student)}
                            className="dark:text-blue-400 text-blue-600 dark:hover:text-blue-300 hover:text-blue-700 font-medium"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredStudents.length === 0 && (
                  <div className="text-center py-12">
                    <p className="dark:text-gray-400 text-gray-500">
                      {searchQuery || activityFilter !== 'all' ? 'No students match the filters' : 'No students registered yet'}
                    </p>
                  </div>
                )}
              </div>
            </div>
              </>
            )}
          </>
        )}

        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold dark:text-white text-gray-900">Assignments</h2>
              <button
                onClick={() => setShowAssignmentModal(true)}
                className="px-4 py-2 dark:bg-blue-600 bg-blue-600 text-white rounded-lg dark:hover:bg-blue-700 hover:bg-blue-700 transition flex items-center gap-2"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Assignment
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="dark:bg-slate-900 bg-white rounded-lg shadow dark:shadow-slate-800 p-6 border dark:border-slate-800 border-transparent"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold dark:text-white text-gray-900">{assignment.title}</h3>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            assignment.type === 'EXAM'
                              ? 'dark:bg-red-500/20 bg-red-100 dark:text-red-400 text-red-800'
                              : assignment.type === 'QUIZ'
                              ? 'dark:bg-purple-500/20 bg-purple-100 dark:text-purple-400 text-purple-800'
                              : assignment.type === 'PROJECT'
                              ? 'dark:bg-blue-500/20 bg-blue-100 dark:text-blue-400 text-blue-800'
                              : 'dark:bg-green-500/20 bg-green-100 dark:text-green-400 text-green-800'
                          }`}
                        >
                          {assignment.type}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            assignment.status === 'GRADED'
                              ? 'dark:bg-green-500/20 bg-green-100 dark:text-green-400 text-green-800'
                              : assignment.status === 'SUBMITTED'
                              ? 'dark:bg-blue-500/20 bg-blue-100 dark:text-blue-400 text-blue-800'
                              : assignment.status === 'OVERDUE'
                              ? 'dark:bg-red-500/20 bg-red-100 dark:text-red-400 text-red-800'
                              : 'dark:bg-yellow-500/20 bg-yellow-100 dark:text-yellow-400 text-yellow-800'
                          }`}
                        >
                          {assignment.status}
                        </span>
                      </div>
                      <p className="dark:text-gray-400 text-gray-600 mb-3">{assignment.description}</p>
                      <div className="flex items-center gap-4 text-sm dark:text-gray-400 text-gray-500">
                        <span>Student: {assignment.student.name}</span>
                        <span>•</span>
                        <span>Due: {formatDate(assignment.dueDate)}</span>
                        {assignment.totalMarks && (
                          <>
                            <span>•</span>
                            <span>
                              Marks: {assignment.marksObtained || 0}/{assignment.totalMarks}
                            </span>
                          </>
                        )}
                      </div>
                      {assignment.submissionText && (
                        <div className="mt-3 dark:bg-slate-800 bg-gray-50 rounded-lg p-4">
                          <p className="text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">Submission:</p>
                          <p className="text-sm dark:text-gray-400 text-gray-600">{assignment.submissionText}</p>
                        </div>
                      )}
                      {assignment.submissionUrl && (
                        <div className="mt-3">
                          <a
                            href={assignment.submissionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm dark:text-blue-400 text-blue-600 dark:hover:text-blue-300 hover:text-blue-700"
                          >
                            View Submission Link →
                          </a>
                        </div>
                      )}
                      {assignment.feedback && (
                        <div className="mt-3 dark:bg-blue-500/10 bg-blue-50 rounded-lg p-4">
                          <p className="text-sm font-medium dark:text-blue-400 text-blue-700 mb-1">Feedback:</p>
                          <p className="text-sm dark:text-gray-300 text-gray-700">{assignment.feedback}</p>
                        </div>
                      )}
                    </div>
                    {assignment.status === 'SUBMITTED' && (
                      <button
                        onClick={() => {
                          setSelectedAssignmentForGrade(assignment);
                          setShowGradeModal(true);
                        }}
                        className="ml-4 px-4 py-2 dark:bg-green-600 bg-green-600 text-white rounded-lg dark:hover:bg-green-700 hover:bg-green-700 transition"
                      >
                        Grade
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {assignments.length === 0 && (
                <div className="text-center py-12 dark:bg-slate-900 bg-white rounded-lg">
                  <p className="dark:text-gray-400 text-gray-500">No assignments created yet</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Doubts Tab */}
        {activeTab === 'doubts' && (
          <>
            <h2 className="text-2xl font-bold dark:text-white text-gray-900 mb-6">Student Doubts</h2>

            <div className="grid grid-cols-1 gap-4">
              {doubts.map((doubt) => (
                <div
                  key={doubt.id}
                  className="dark:bg-slate-900 bg-white rounded-lg shadow dark:shadow-slate-800 p-6 border dark:border-slate-800 border-transparent"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold dark:text-white text-gray-900">{doubt.subject}</h3>
                      <p className="text-sm dark:text-gray-400 text-gray-600">Asked by: {doubt.student.name}</p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        doubt.status === 'ANSWERED'
                          ? 'dark:bg-green-500/20 bg-green-100 dark:text-green-400 text-green-800'
                          : doubt.status === 'CLOSED'
                          ? 'dark:bg-gray-500/20 bg-gray-100 dark:text-gray-400 text-gray-800'
                          : 'dark:bg-yellow-500/20 bg-yellow-100 dark:text-yellow-400 text-yellow-800'
                      }`}
                    >
                      {doubt.status}
                    </span>
                  </div>
                  <div className="dark:bg-slate-800 bg-gray-50 rounded-lg p-4 mb-3">
                    <p className="text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">Question:</p>
                    <p className="dark:text-gray-400 text-gray-600">{doubt.question}</p>
                  </div>
                  {doubt.answer && (
                    <div className="dark:bg-blue-500/10 bg-blue-50 rounded-lg p-4 mb-3">
                      <p className="text-sm font-medium dark:text-blue-400 text-blue-700 mb-1">Answer:</p>
                      <p className="dark:text-gray-300 text-gray-700">{doubt.answer}</p>
                    </div>
                  )}
                  {doubt.meetingRequest && (
                    <div className="flex items-center gap-2 text-sm dark:text-purple-400 text-purple-600">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Meeting requested
                    </div>
                  )}
                  {doubt.status === 'OPEN' && (
                    <button
                      onClick={() => {
                        setSelectedDoubt(doubt);
                        setShowAnswerDoubtModal(true);
                      }}
                      className="mt-3 px-4 py-2 dark:bg-blue-600 bg-blue-600 text-white rounded-lg dark:hover:bg-blue-700 hover:bg-blue-700 transition"
                    >
                      Answer Doubt
                    </button>
                  )}
                </div>
              ))}
              {doubts.length === 0 && (
                <div className="text-center py-12 dark:bg-slate-900 bg-white rounded-lg">
                  <p className="dark:text-gray-400 text-gray-500">No doubts submitted yet</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Meetings Tab */}
        {activeTab === 'meetings' && (
          <>
            <h2 className="text-2xl font-bold dark:text-white text-gray-900 mb-6">Meeting Requests</h2>

            <div className="grid grid-cols-1 gap-4">
              {meetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="dark:bg-slate-900 bg-white rounded-lg shadow dark:shadow-slate-800 p-6 border dark:border-slate-800 border-transparent"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold dark:text-white text-gray-900">{meeting.subject}</h3>
                      <p className="text-sm dark:text-gray-400 text-gray-600">Student: {meeting.student.name}</p>
                    </div>
                    <div className="flex gap-2">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          meeting.type === 'EXAM'
                            ? 'dark:bg-red-500/20 bg-red-100 dark:text-red-400 text-red-800'
                            : meeting.type === 'DOUBT_CLARIFICATION'
                            ? 'dark:bg-blue-500/20 bg-blue-100 dark:text-blue-400 text-blue-800'
                            : 'dark:bg-purple-500/20 bg-purple-100 dark:text-purple-400 text-purple-800'
                        }`}
                      >
                        {meeting.type.replace('_', ' ')}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          meeting.status === 'SCHEDULED'
                            ? 'dark:bg-green-500/20 bg-green-100 dark:text-green-400 text-green-800'
                            : meeting.status === 'COMPLETED'
                            ? 'dark:bg-gray-500/20 bg-gray-100 dark:text-gray-400 text-gray-800'
                            : meeting.status === 'CANCELLED'
                            ? 'dark:bg-red-500/20 bg-red-100 dark:text-red-400 text-red-800'
                            : 'dark:bg-yellow-500/20 bg-yellow-100 dark:text-yellow-400 text-yellow-800'
                        }`}
                      >
                        {meeting.status}
                      </span>
                    </div>
                  </div>
                  <p className="dark:text-gray-400 text-gray-600 mb-3">{meeting.description}</p>
                  {meeting.scheduledAt && (
                    <div className="flex items-center gap-4 text-sm dark:text-gray-400 text-gray-500 mb-3">
                      <span>Scheduled: {new Date(meeting.scheduledAt).toLocaleString()}</span>
                      {meeting.duration && <span>Duration: {meeting.duration} minutes</span>}
                    </div>
                  )}
                  {meeting.meetLink && (
                    <a
                      href={meeting.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm dark:text-blue-400 text-blue-600 dark:hover:text-blue-300 hover:text-blue-700"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Join Google Meet
                    </a>
                  )}
                  <div className="mt-3 flex gap-2">
                    {meeting.status === 'REQUESTED' && (
                      <button
                        onClick={() => {
                          setSelectedMeeting(meeting);
                          setShowScheduleMeetingModal(true);
                        }}
                        className="px-4 py-2 dark:bg-green-600 bg-green-600 text-white rounded-lg dark:hover:bg-green-700 hover:bg-green-700 transition"
                      >
                        Schedule Meeting
                      </button>
                    )}
                    {meeting.status === 'SCHEDULED' && (
                      <button
                        onClick={async () => {
                          try {
                            await axios.post(
                              `/api/teacher/meetings/${meeting.id}/complete`,
                              {},
                              { headers: { Authorization: `Bearer ${token}` } }
                            );
                            toast.success('Meeting marked as completed');
                            loadMeetings();
                          } catch (error) {
                            toast.error('Failed to complete meeting');
                          }
                        }}
                        className="px-4 py-2 dark:bg-blue-600 bg-blue-600 text-white rounded-lg dark:hover:bg-blue-700 hover:bg-blue-700 transition"
                      >
                        Mark as Completed
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {meetings.length === 0 && (
                <div className="text-center py-12 dark:bg-slate-900 bg-white rounded-lg">
                  <p className="dark:text-gray-400 text-gray-500">No meeting requests yet</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="dark:bg-slate-900 bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b dark:border-slate-800 border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-xl">
                    {selectedStudent.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold dark:text-white text-gray-900">{selectedStudent.name}</h2>
                  <p className="text-sm dark:text-gray-400 text-gray-600">{selectedStudent.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="dark:text-gray-400 text-gray-500 dark:hover:text-white hover:text-gray-700"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto">
              {loadingDetails ? (
                <div className="flex items-center justify-center py-12">
                  <div className="dark:text-gray-400 text-gray-500">Loading details...</div>
                </div>
              ) : studentDetails ? (
                <div className="space-y-6">
                  {/* Statistics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="dark:bg-slate-800 bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 bg-blue-500 rounded-md p-2">
                          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs dark:text-gray-400 text-gray-500">Chats</p>
                          <p className="text-xl font-bold dark:text-white text-gray-900">{studentDetails.statistics.totalChats}</p>
                        </div>
                      </div>
                    </div>
                    <div className="dark:bg-slate-800 bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 bg-green-500 rounded-md p-2">
                          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs dark:text-gray-400 text-gray-500">Materials</p>
                          <p className="text-xl font-bold dark:text-white text-gray-900">{studentDetails.statistics.totalMaterials}</p>
                        </div>
                      </div>
                    </div>
                    <div className="dark:bg-slate-800 bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 bg-purple-500 rounded-md p-2">
                          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs dark:text-gray-400 text-gray-500">Messages</p>
                          <p className="text-xl font-bold dark:text-white text-gray-900">{studentDetails.statistics.totalMessages}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Chats */}
                  <div>
                    <h3 className="text-lg font-semibold dark:text-white text-gray-900 mb-3">Recent Chats</h3>
                    {studentDetails.chats.length > 0 ? (
                      <div className="space-y-2">
                        {studentDetails.chats.slice(0, 5).map((chat) => (
                          <div
                            key={chat.id}
                            className="dark:bg-slate-800 bg-gray-50 rounded-lg p-4 flex justify-between items-center"
                          >
                            <div>
                              <p className="font-medium dark:text-white text-gray-900">{chat.title}</p>
                              <p className="text-sm dark:text-gray-400 text-gray-600">
                                {chat._count.messages} messages • Last updated {formatDate(chat.updatedAt)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="dark:text-gray-400 text-gray-500">No chats yet</p>
                    )}
                  </div>

                  {/* Materials */}
                  <div>
                    <h3 className="text-lg font-semibold dark:text-white text-gray-900 mb-3">Uploaded Materials</h3>
                    {studentDetails.materials.length > 0 ? (
                      <div className="space-y-2">
                        {studentDetails.materials.slice(0, 5).map((material) => (
                          <div
                            key={material.id}
                            className="dark:bg-slate-800 bg-gray-50 rounded-lg p-4 flex justify-between items-center"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0 bg-blue-500 rounded-md p-2">
                                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <div>
                                <p className="font-medium dark:text-white text-gray-900">{material.fileName}</p>
                                <p className="text-sm dark:text-gray-400 text-gray-600">
                                  {material.fileType} • {(material.fileSize / 1024).toFixed(2)} KB • {formatDate(material.createdAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="dark:text-gray-400 text-gray-500">No materials uploaded yet</p>
                    )}
                  </div>

                  {/* Student Info */}
                  <div className="dark:bg-slate-800 bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold dark:text-white text-gray-900 mb-3">Student Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm dark:text-gray-400 text-gray-500">Joined</p>
                        <p className="font-medium dark:text-white text-gray-900">{formatDate(studentDetails.student.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-sm dark:text-gray-400 text-gray-500">Last Updated</p>
                        <p className="font-medium dark:text-white text-gray-900">{formatDate(studentDetails.student.updatedAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="dark:text-gray-400 text-gray-500">Failed to load student details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Assignment Modal */}
      {showAssignmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="dark:bg-slate-900 bg-white rounded-lg max-w-2xl w-full">
            <div className="px-6 py-4 border-b dark:border-slate-800 border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold dark:text-white text-gray-900">Create Assignment</h2>
              <button
                onClick={() => setShowAssignmentModal(false)}
                className="dark:text-gray-400 text-gray-500 dark:hover:text-white hover:text-gray-700"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                try {
                  await axios.post(
                    '/api/teacher/assignments',
                    {
                      studentId: formData.get('studentId'),
                      title: formData.get('title'),
                      description: formData.get('description'),
                      type: formData.get('type'),
                      dueDate: formData.get('dueDate'),
                      totalMarks: formData.get('totalMarks') ? parseInt(formData.get('totalMarks') as string) : undefined,
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                  toast.success('Assignment created successfully');
                  setShowAssignmentModal(false);
                  loadAssignments();
                } catch (error) {
                  toast.error('Failed to create assignment');
                }
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                  Select Student
                </label>
                <select
                  name="studentId"
                  required
                  className="w-full px-3 py-2 dark:bg-slate-800 bg-white border dark:border-slate-700 border-gray-300 rounded-lg dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a student...</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} ({student.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  className="w-full px-3 py-2 dark:bg-slate-800 bg-white border dark:border-slate-700 border-gray-300 rounded-lg dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Assignment title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  className="w-full px-3 py-2 dark:bg-slate-800 bg-white border dark:border-slate-700 border-gray-300 rounded-lg dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Assignment description and instructions"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    name="type"
                    required
                    className="w-full px-3 py-2 dark:bg-slate-800 bg-white border dark:border-slate-700 border-gray-300 rounded-lg dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="TASK">Task</option>
                    <option value="EXAM">Exam</option>
                    <option value="QUIZ">Quiz</option>
                    <option value="PROJECT">Project</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="datetime-local"
                    name="dueDate"
                    required
                    className="w-full px-3 py-2 dark:bg-slate-800 bg-white border dark:border-slate-700 border-gray-300 rounded-lg dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                  Total Marks (Optional)
                </label>
                <input
                  type="number"
                  name="totalMarks"
                  min="0"
                  className="w-full px-3 py-2 dark:bg-slate-800 bg-white border dark:border-slate-700 border-gray-300 rounded-lg dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="100"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 dark:bg-blue-600 bg-blue-600 text-white rounded-lg dark:hover:bg-blue-700 hover:bg-blue-700 transition"
                >
                  Create Assignment
                </button>
                <button
                  type="button"
                  onClick={() => setShowAssignmentModal(false)}
                  className="px-4 py-2 dark:bg-slate-700 bg-gray-200 dark:text-white text-gray-700 rounded-lg dark:hover:bg-slate-600 hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Answer Doubt Modal */}
      {showAnswerDoubtModal && selectedDoubt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="dark:bg-slate-900 bg-white rounded-lg max-w-2xl w-full">
            <div className="px-6 py-4 border-b dark:border-slate-800 border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold dark:text-white text-gray-900">Answer Doubt</h2>
              <button
                onClick={() => {
                  setShowAnswerDoubtModal(false);
                  setSelectedDoubt(null);
                }}
                className="dark:text-gray-400 text-gray-500 dark:hover:text-white hover:text-gray-700"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                try {
                  await axios.post(
                    `/api/teacher/doubts/${selectedDoubt.id}/answer`,
                    {
                      answer: formData.get('answer'),
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                  toast.success('Doubt answered successfully');
                  setShowAnswerDoubtModal(false);
                  setSelectedDoubt(null);
                  loadDoubts();
                } catch (error) {
                  toast.error('Failed to answer doubt');
                }
              }}
              className="p-6 space-y-4"
            >
              <div className="dark:bg-slate-800 bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold dark:text-white text-gray-900 mb-2">{selectedDoubt.subject}</h3>
                <p className="text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">Student Question:</p>
                <p className="text-sm dark:text-gray-400 text-gray-600">{selectedDoubt.question}</p>
                <p className="text-xs dark:text-gray-500 text-gray-500 mt-2">Asked by: {selectedDoubt.student.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                  Your Answer
                </label>
                <textarea
                  name="answer"
                  required
                  rows={6}
                  className="w-full px-3 py-2 dark:bg-slate-800 bg-white border dark:border-slate-700 border-gray-300 rounded-lg dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Write your answer here..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 dark:bg-blue-600 bg-blue-600 text-white rounded-lg dark:hover:bg-blue-700 hover:bg-blue-700 transition"
                >
                  Submit Answer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAnswerDoubtModal(false);
                    setSelectedDoubt(null);
                  }}
                  className="px-4 py-2 dark:bg-slate-700 bg-gray-200 dark:text-white text-gray-700 rounded-lg dark:hover:bg-slate-600 hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Meeting Modal */}
      {showScheduleMeetingModal && selectedMeeting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="dark:bg-slate-900 bg-white rounded-lg max-w-2xl w-full">
            <div className="px-6 py-4 border-b dark:border-slate-800 border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold dark:text-white text-gray-900">Schedule Meeting</h2>
              <button
                onClick={() => {
                  setShowScheduleMeetingModal(false);
                  setSelectedMeeting(null);
                }}
                className="dark:text-gray-400 text-gray-500 dark:hover:text-white hover:text-gray-700"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                try {
                  await axios.post(
                    `/api/teacher/meetings/${selectedMeeting.id}/schedule`,
                    {
                      scheduledAt: formData.get('scheduledAt'),
                      duration: formData.get('duration') ? parseInt(formData.get('duration') as string) : 30,
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                  toast.success('Meeting scheduled successfully');
                  setShowScheduleMeetingModal(false);
                  setSelectedMeeting(null);
                  loadMeetings();
                } catch (error) {
                  toast.error('Failed to schedule meeting');
                }
              }}
              className="p-6 space-y-4"
            >
              <div className="dark:bg-slate-800 bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold dark:text-white text-gray-900 mb-2">{selectedMeeting.subject}</h3>
                <p className="text-sm dark:text-gray-400 text-gray-600">{selectedMeeting.description}</p>
                <p className="text-xs dark:text-gray-500 text-gray-500 mt-2">
                  Student: {selectedMeeting.student.name} ({selectedMeeting.student.email})
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                  Meeting Date & Time
                </label>
                <input
                  type="datetime-local"
                  name="scheduledAt"
                  required
                  className="w-full px-3 py-2 dark:bg-slate-800 bg-white border dark:border-slate-700 border-gray-300 rounded-lg dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  name="duration"
                  min="15"
                  max="180"
                  defaultValue="30"
                  className="w-full px-3 py-2 dark:bg-slate-800 bg-white border dark:border-slate-700 border-gray-300 rounded-lg dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 dark:bg-green-600 bg-green-600 text-white rounded-lg dark:hover:bg-green-700 hover:bg-green-700 transition"
                >
                  Schedule Meeting
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowScheduleMeetingModal(false);
                    setSelectedMeeting(null);
                  }}
                  className="px-4 py-2 dark:bg-slate-700 bg-gray-200 dark:text-white text-gray-700 rounded-lg dark:hover:bg-slate-600 hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grade Assignment Modal */}
      {showGradeModal && selectedAssignmentForGrade && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="dark:bg-slate-900 bg-white rounded-lg max-w-2xl w-full">
            <div className="px-6 py-4 border-b dark:border-slate-800 border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold dark:text-white text-gray-900">Grade Assignment</h2>
              <button
                onClick={() => {
                  setShowGradeModal(false);
                  setSelectedAssignmentForGrade(null);
                }}
                className="dark:text-gray-400 text-gray-500 dark:hover:text-white hover:text-gray-700"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                try {
                  await axios.post(
                    `/api/teacher/assignments/${selectedAssignmentForGrade.id}/grade`,
                    {
                      marksObtained: parseInt(formData.get('marksObtained') as string),
                      feedback: formData.get('feedback'),
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                  toast.success('Assignment graded successfully');
                  setShowGradeModal(false);
                  setSelectedAssignmentForGrade(null);
                  loadAssignments();
                } catch (error) {
                  toast.error('Failed to grade assignment');
                }
              }}
              className="p-6 space-y-4"
            >
              <div className="dark:bg-slate-800 bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold dark:text-white text-gray-900 mb-2">{selectedAssignmentForGrade.title}</h3>
                <p className="text-sm dark:text-gray-400 text-gray-600">Student: {selectedAssignmentForGrade.student.name}</p>
                {selectedAssignmentForGrade.totalMarks && (
                  <p className="text-sm dark:text-gray-400 text-gray-600">Total Marks: {selectedAssignmentForGrade.totalMarks}</p>
                )}
              </div>

              {selectedAssignmentForGrade.submissionText && (
                <div className="dark:bg-slate-800 bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">Student Submission:</p>
                  <p className="text-sm dark:text-gray-400 text-gray-600">{selectedAssignmentForGrade.submissionText}</p>
                </div>
              )}

              {selectedAssignmentForGrade.submissionUrl && (
                <div>
                  <a
                    href={selectedAssignmentForGrade.submissionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm dark:text-blue-400 text-blue-600 dark:hover:text-blue-300 hover:text-blue-700"
                  >
                    View Submission Link →
                  </a>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                  Marks Obtained {selectedAssignmentForGrade.totalMarks && `(out of ${selectedAssignmentForGrade.totalMarks})`}
                </label>
                <input
                  type="number"
                  name="marksObtained"
                  required
                  min="0"
                  max={selectedAssignmentForGrade.totalMarks || undefined}
                  className="w-full px-3 py-2 dark:bg-slate-800 bg-white border dark:border-slate-700 border-gray-300 rounded-lg dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter marks"
                />
              </div>

              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                  Feedback (Optional)
                </label>
                <textarea
                  name="feedback"
                  rows={4}
                  className="w-full px-3 py-2 dark:bg-slate-800 bg-white border dark:border-slate-700 border-gray-300 rounded-lg dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Provide feedback to the student..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 dark:bg-green-600 bg-green-600 text-white rounded-lg dark:hover:bg-green-700 hover:bg-green-700 transition"
                >
                  Submit Grade
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowGradeModal(false);
                    setSelectedAssignmentForGrade(null);
                  }}
                  className="px-4 py-2 dark:bg-slate-700 bg-gray-200 dark:text-white text-gray-700 rounded-lg dark:hover:bg-slate-600 hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
