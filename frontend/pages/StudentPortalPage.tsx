'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/frontend/store/authStore';
import axios from 'axios';
import { toast } from 'sonner';

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
  teacher: {
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
  teacher?: {
    id: string;
    name: string;
    email: string;
  };
  preferredTeacher?: {
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
  teacher?: {
    id: string;
    name: string;
    email: string;
  };
  preferredTeacher?: {
    id: string;
    name: string;
    email: string;
  };
}

interface Teacher {
  id: string;
  name: string;
  email: string;
}

export default function StudentPortalPage() {
  const router = useRouter();
  const { isAuthenticated, user, token, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'assignments' | 'doubts' | 'meetings'>('assignments');

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [meetings, setMeetings] = useState<MeetingRequest[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  const [showDoubtModal, setShowDoubtModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      toast.error('Please login to access the student portal');
      router.replace('/login');
      return;
    }

    if (user?.role !== 'STUDENT') {
      toast.error('Access denied. This area is for students only');
      router.replace('/dashboard');
      return;
    }

    loadAssignments();
    loadTeachers();
  }, [isAuthenticated, token, user, router]);

  useEffect(() => {
    if (!token) return;

    if (activeTab === 'doubts') {
      loadDoubts();
    } else if (activeTab === 'meetings') {
      loadMeetings();
    }
  }, [activeTab, token]);

  const loadAssignments = async () => {
    try {
      const response = await axios.get('/api/student/assignments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAssignments(response.data.assignments);
    } catch (error) {
      console.error('Failed to load assignments:', error);
    }
  };

  const loadDoubts = async () => {
    try {
      const response = await axios.get('/api/student/doubts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDoubts(response.data.doubts);
    } catch (error) {
      console.error('Failed to load doubts:', error);
    }
  };

  const loadMeetings = async () => {
    try {
      const response = await axios.get('/api/student/meetings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMeetings(response.data.meetings);
    } catch (error) {
      console.error('Failed to load meetings:', error);
    }
  };

  const loadTeachers = async () => {
    try {
      const response = await axios.get('/api/teachers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeachers(response.data.teachers);
    } catch (error) {
      console.error('Failed to load teachers:', error);
    }
  };

  const handleMarkDoubtAsCompleted = async (doubtId: string) => {
    try {
      await axios.post(
        `/api/student/doubts/${doubtId}/close`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Doubt marked as completed');
      loadDoubts();
    } catch (error) {
      toast.error('Failed to mark doubt as completed');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!isAuthenticated || !token || !user || user.role !== 'STUDENT') {
    return null;
  }

  return (
    <div className="min-h-screen dark:bg-slate-950 bg-gray-50">
      {/* Header */}
      <header className="dark:bg-slate-900 bg-white shadow-sm border-b dark:border-slate-800 border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold dark:text-white text-gray-900">Student Portal</h1>
              <p className="text-sm dark:text-gray-400 text-gray-600 mt-1">Welcome back, {user?.name}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 dark:bg-slate-700 bg-gray-200 dark:text-white text-gray-700 rounded-lg dark:hover:bg-slate-600 hover:bg-gray-300 transition"
              >
                Back to Chat
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 dark:bg-red-600 bg-red-600 text-white rounded-lg dark:hover:bg-red-700 hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="dark:bg-slate-900 bg-white border-b dark:border-slate-800 border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('assignments')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'assignments'
                  ? 'border-blue-500 dark:text-blue-400 text-blue-600'
                  : 'border-transparent dark:text-gray-400 text-gray-500 dark:hover:text-gray-300 hover:text-gray-700'
              }`}
            >
              My Assignments
            </button>
            <button
              onClick={() => setActiveTab('doubts')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'doubts'
                  ? 'border-blue-500 dark:text-blue-400 text-blue-600'
                  : 'border-transparent dark:text-gray-400 text-gray-500 dark:hover:text-gray-300 hover:text-gray-700'
              }`}
            >
              My Doubts
            </button>
            <button
              onClick={() => setActiveTab('meetings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'meetings'
                  ? 'border-blue-500 dark:text-blue-400 text-blue-600'
                  : 'border-transparent dark:text-gray-400 text-gray-500 dark:hover:text-gray-300 hover:text-gray-700'
              }`}
            >
              My Meetings
            </button>
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold dark:text-white text-gray-900">My Assignments</h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="dark:bg-slate-900 bg-white rounded-lg shadow dark:shadow-slate-800 p-6 border dark:border-slate-800 border-transparent"
                >
                  <div className="flex justify-between items-start mb-3">
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
                        <span>Teacher: {assignment.teacher.name}</span>
                        <span>•</span>
                        <span>Due: {formatDate(assignment.dueDate)}</span>
                        {assignment.totalMarks && (
                          <>
                            <span>•</span>
                            <span>
                              Marks: {assignment.marksObtained || '-'}/{assignment.totalMarks}
                            </span>
                          </>
                        )}
                      </div>
                      {assignment.feedback && (
                        <div className="mt-3 dark:bg-blue-500/10 bg-blue-50 rounded-lg p-3">
                          <p className="text-sm font-medium dark:text-blue-400 text-blue-700 mb-1">Teacher Feedback:</p>
                          <p className="text-sm dark:text-gray-300 text-gray-700">{assignment.feedback}</p>
                        </div>
                      )}
                    </div>
                    {assignment.status === 'PENDING' && (
                      <button
                        onClick={() => {
                          setSelectedAssignment(assignment);
                          setShowSubmitModal(true);
                        }}
                        className="ml-4 px-4 py-2 dark:bg-blue-600 bg-blue-600 text-white rounded-lg dark:hover:bg-blue-700 hover:bg-blue-700 transition"
                      >
                        Submit
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {assignments.length === 0 && (
                <div className="text-center py-12 dark:bg-slate-900 bg-white rounded-lg">
                  <p className="dark:text-gray-400 text-gray-500">No assignments yet</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Doubts Tab */}
        {activeTab === 'doubts' && (
          <>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold dark:text-white text-gray-900">My Doubts</h2>
              <button
                onClick={() => setShowDoubtModal(true)}
                className="px-4 py-2 dark:bg-blue-600 bg-blue-600 text-white rounded-lg dark:hover:bg-blue-700 hover:bg-blue-700 transition flex items-center gap-2"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Ask Doubt
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {doubts.map((doubt) => (
                <div
                  key={doubt.id}
                  className="dark:bg-slate-900 bg-white rounded-lg shadow dark:shadow-slate-800 p-6 border dark:border-slate-800 border-transparent"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold dark:text-white text-gray-900">{doubt.subject}</h3>
                      {doubt.teacher && (
                        <p className="text-sm dark:text-gray-400 text-gray-600">Answered by: {doubt.teacher.name}</p>
                      )}
                      {doubt.preferredTeacher && !doubt.teacher && (
                        <p className="text-sm dark:text-gray-400 text-gray-600">Preferred teacher: {doubt.preferredTeacher.name}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
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
                      {doubt.status === 'ANSWERED' && (
                        <button
                          onClick={() => handleMarkDoubtAsCompleted(doubt.id)}
                          className="px-3 py-1 text-xs font-medium dark:bg-green-600 bg-green-600 text-white rounded-lg dark:hover:bg-green-700 hover:bg-green-700 transition"
                        >
                          Mark Completed
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="dark:bg-slate-800 bg-gray-50 rounded-lg p-4 mb-3">
                    <p className="text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">Your Question:</p>
                    <p className="dark:text-gray-400 text-gray-600">{doubt.question}</p>
                  </div>
                  {doubt.answer && (
                    <div className="dark:bg-blue-500/10 bg-blue-50 rounded-lg p-4">
                      <p className="text-sm font-medium dark:text-blue-400 text-blue-700 mb-1">Teacher's Answer:</p>
                      <p className="dark:text-gray-300 text-gray-700">{doubt.answer}</p>
                    </div>
                  )}
                </div>
              ))}
              {doubts.length === 0 && (
                <div className="text-center py-12 dark:bg-slate-900 bg-white rounded-lg">
                  <p className="dark:text-gray-400 text-gray-500">No doubts asked yet</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Meetings Tab */}
        {activeTab === 'meetings' && (
          <>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold dark:text-white text-gray-900">My Meeting Requests</h2>
              <button
                onClick={() => setShowMeetingModal(true)}
                className="px-4 py-2 dark:bg-blue-600 bg-blue-600 text-white rounded-lg dark:hover:bg-blue-700 hover:bg-blue-700 transition flex items-center gap-2"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Request Meeting
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {meetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="dark:bg-slate-900 bg-white rounded-lg shadow dark:shadow-slate-800 p-6 border dark:border-slate-800 border-transparent"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold dark:text-white text-gray-900">{meeting.subject}</h3>
                      {meeting.teacher && (
                        <p className="text-sm dark:text-gray-400 text-gray-600">Teacher: {meeting.teacher.name}</p>
                      )}
                      {meeting.preferredTeacher && !meeting.teacher && (
                        <p className="text-sm dark:text-gray-400 text-gray-600">Preferred teacher: {meeting.preferredTeacher.name}</p>
                      )}
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
                      className="inline-flex items-center gap-2 px-4 py-2 dark:bg-green-600 bg-green-600 text-white rounded-lg dark:hover:bg-green-700 hover:bg-green-700 transition"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Join Google Meet
                    </a>
                  )}
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

      {/* Submit Assignment Modal */}
      {showSubmitModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="dark:bg-slate-900 bg-white rounded-lg max-w-2xl w-full">
            <div className="px-6 py-4 border-b dark:border-slate-800 border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold dark:text-white text-gray-900">Submit Assignment</h2>
              <button
                onClick={() => {
                  setShowSubmitModal(false);
                  setSelectedAssignment(null);
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
                    `/api/student/assignments/${selectedAssignment.id}/submit`,
                    {
                      submissionText: formData.get('submissionText'),
                      submissionUrl: formData.get('submissionUrl'),
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                  toast.success('Assignment submitted successfully');
                  setShowSubmitModal(false);
                  setSelectedAssignment(null);
                  loadAssignments();
                } catch (error) {
                  toast.error('Failed to submit assignment');
                }
              }}
              className="p-6 space-y-4"
            >
              <div className="dark:bg-slate-800 bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold dark:text-white text-gray-900 mb-2">{selectedAssignment.title}</h3>
                <p className="text-sm dark:text-gray-400 text-gray-600">{selectedAssignment.description}</p>
              </div>

              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                  Submission Text
                </label>
                <textarea
                  name="submissionText"
                  rows={6}
                  className="w-full px-3 py-2 dark:bg-slate-800 bg-white border dark:border-slate-700 border-gray-300 rounded-lg dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Write your submission here..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                  Submission URL (Optional)
                </label>
                <input
                  type="url"
                  name="submissionUrl"
                  className="w-full px-3 py-2 dark:bg-slate-800 bg-white border dark:border-slate-700 border-gray-300 rounded-lg dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/submission"
                />
                <p className="text-xs dark:text-gray-400 text-gray-500 mt-1">
                  Link to Google Drive, GitHub, or any online resource
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 dark:bg-blue-600 bg-blue-600 text-white rounded-lg dark:hover:bg-blue-700 hover:bg-blue-700 transition"
                >
                  Submit Assignment
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSubmitModal(false);
                    setSelectedAssignment(null);
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

      {/* Ask Doubt Modal */}
      {showDoubtModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="dark:bg-slate-900 bg-white rounded-lg max-w-2xl w-full">
            <div className="px-6 py-4 border-b dark:border-slate-800 border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold dark:text-white text-gray-900">Ask a Doubt</h2>
              <button
                onClick={() => setShowDoubtModal(false)}
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
                    '/api/student/doubts',
                    {
                      subject: formData.get('subject'),
                      question: formData.get('question'),
                      preferredTeacherId: formData.get('preferredTeacherId') || undefined,
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                  toast.success('Doubt submitted successfully');
                  setShowDoubtModal(false);
                  loadDoubts();
                } catch (error) {
                  toast.error('Failed to submit doubt');
                }
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                  Preferred Teacher (Optional)
                </label>
                <select
                  name="preferredTeacherId"
                  className="w-full px-3 py-2 dark:bg-slate-800 bg-white border dark:border-slate-700 border-gray-300 rounded-lg dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Any teacher</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  required
                  className="w-full px-3 py-2 dark:bg-slate-800 bg-white border dark:border-slate-700 border-gray-300 rounded-lg dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="E.g., JavaScript Promises"
                />
              </div>

              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                  Your Question
                </label>
                <textarea
                  name="question"
                  required
                  rows={6}
                  className="w-full px-3 py-2 dark:bg-slate-800 bg-white border dark:border-slate-700 border-gray-300 rounded-lg dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your doubt in detail..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 dark:bg-blue-600 bg-blue-600 text-white rounded-lg dark:hover:bg-blue-700 hover:bg-blue-700 transition"
                >
                  Submit Doubt
                </button>
                <button
                  type="button"
                  onClick={() => setShowDoubtModal(false)}
                  className="px-4 py-2 dark:bg-slate-700 bg-gray-200 dark:text-white text-gray-700 rounded-lg dark:hover:bg-slate-600 hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request Meeting Modal */}
      {showMeetingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="dark:bg-slate-900 bg-white rounded-lg max-w-2xl w-full">
            <div className="px-6 py-4 border-b dark:border-slate-800 border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold dark:text-white text-gray-900">Request Meeting</h2>
              <button
                onClick={() => setShowMeetingModal(false)}
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
                    '/api/student/meetings',
                    {
                      type: formData.get('type'),
                      subject: formData.get('subject'),
                      description: formData.get('description'),
                      preferredTeacherId: formData.get('preferredTeacherId') || undefined,
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                  toast.success('Meeting requested successfully');
                  setShowMeetingModal(false);
                  loadMeetings();
                } catch (error) {
                  toast.error('Failed to request meeting');
                }
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                  Preferred Teacher (Optional)
                </label>
                <select
                  name="preferredTeacherId"
                  className="w-full px-3 py-2 dark:bg-slate-800 bg-white border dark:border-slate-700 border-gray-300 rounded-lg dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Any teacher</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                  Meeting Type
                </label>
                <select
                  name="type"
                  required
                  className="w-full px-3 py-2 dark:bg-slate-800 bg-white border dark:border-slate-700 border-gray-300 rounded-lg dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="DOUBT_CLARIFICATION">Doubt Clarification</option>
                  <option value="EXAM">Exam</option>
                  <option value="DISCUSSION">General Discussion</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  required
                  className="w-full px-3 py-2 dark:bg-slate-800 bg-white border dark:border-slate-700 border-gray-300 rounded-lg dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Meeting topic"
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
                  placeholder="Describe what you want to discuss..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 dark:bg-blue-600 bg-blue-600 text-white rounded-lg dark:hover:bg-blue-700 hover:bg-blue-700 transition"
                >
                  Request Meeting
                </button>
                <button
                  type="button"
                  onClick={() => setShowMeetingModal(false)}
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
