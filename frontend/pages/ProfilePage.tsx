'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/frontend/store/authStore';
import { toast } from 'sonner';
import { User, Mail, Calendar, Shield, Edit2, Save, X, Camera } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Avatar, AvatarFallback } from '@/src/components/ui/avatar';
import { Badge } from '@/src/components/ui/badge';
import axios from 'axios';

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, token, user, setUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  useEffect(() => {
    if (!isAuthenticated || !token) {
      toast.error('Please login to access your profile');
      router.replace('/login');
      return;
    }

    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
      });
    }
  }, [isAuthenticated, token, user, router]);

  const getUserInitials = (name: string | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.patch(
        '/api/user/profile',
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update user in store
      if (response.data.user) {
        setUser(response.data.user);
      }

      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
    });
    setIsEditing(false);
  };

  if (!isAuthenticated || !token || !user) {
    return null;
  }

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : 'Recently';

  return (
    <div className="min-h-screen dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-4xl mx-auto p-6 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="dark:text-gray-400 text-gray-600 dark:hover:text-white hover:text-gray-900 transition-colors mb-4 flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold dark:bg-gradient-to-r dark:from-white dark:to-gray-300 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Profile Settings
          </h1>
          <p className="dark:text-gray-400 text-gray-600 mt-2">Manage your account information</p>
        </div>

        {/* Profile Card */}
        <div className="dark:bg-slate-900/50 bg-white/70 backdrop-blur-xl rounded-2xl border dark:border-white/10 border-gray-200 overflow-hidden">
          {/* Cover Photo */}
          <div className="h-32 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20" />
          </div>

          {/* Profile Content */}
          <div className="px-6 pb-6">
            {/* Avatar */}
            <div className="relative -mt-16 mb-6">
              <div className="relative inline-block">
                <Avatar className="h-32 w-32 rounded-2xl border-4 border-slate-900">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl text-white text-3xl font-bold">
                    {getUserInitials(user?.name)}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-500 p-2.5 rounded-lg shadow-lg transition-colors">
                  <Camera className="w-4 h-4 text-white" />
                </button>
                <div className="absolute bottom-4 left-4 w-5 h-5 bg-green-500 rounded-full border-4 border-slate-900" />
              </div>
            </div>

            {/* User Info */}
            <div className="space-y-6">
              {/* Name and Role */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold dark:text-white text-gray-900">{user.name}</h2>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
                      {user.role}
                    </Badge>
                    <div className="flex items-center gap-1.5 text-sm dark:text-gray-400 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Member since {memberSince}</span>
                    </div>
                  </div>
                </div>

                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-600 hover:bg-blue-500"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSave}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-500"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? 'Saving...' : 'Save'}
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      className="border-white/20 text-gray-300 hover:bg-white/5"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              {/* Profile Details */}
              <div className="grid md:grid-cols-2 gap-6 pt-6 border-t dark:border-white/10 border-gray-200">
                {/* Name Field */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium dark:text-gray-400 text-gray-600 mb-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="dark:bg-white/5 bg-gray-100 dark:border-white/10 border-gray-300 dark:text-white text-gray-900 dark:focus:border-blue-500/50 focus:border-blue-500"
                      placeholder="Enter your name"
                    />
                  ) : (
                    <p className="dark:text-white text-gray-900 text-lg">{user.name}</p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium dark:text-gray-400 text-gray-600 mb-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      type="email"
                      className="dark:bg-white/5 bg-gray-100 dark:border-white/10 border-gray-300 dark:text-white text-gray-900 dark:focus:border-blue-500/50 focus:border-blue-500"
                      placeholder="Enter your email"
                      disabled
                    />
                  ) : (
                    <p className="dark:text-white text-gray-900 text-lg">{user.email}</p>
                  )}
                  {isEditing && (
                    <p className="text-xs dark:text-gray-500 text-gray-600 mt-1">
                      Email cannot be changed
                    </p>
                  )}
                </div>

                {/* Role Field */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium dark:text-gray-400 text-gray-600 mb-2">
                    <Shield className="w-4 h-4" />
                    Account Type
                  </label>
                  <p className="dark:text-white text-gray-900 text-lg capitalize">{user.role}</p>
                </div>

                {/* User ID */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium dark:text-gray-400 text-gray-600 mb-2">
                    <User className="w-4 h-4" />
                    User ID
                  </label>
                  <p className="dark:text-white text-gray-900 text-lg font-mono text-sm">
                    {user.id?.slice(0, 8)}...
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t dark:border-white/10 border-gray-200">
                <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                  <div className="text-2xl font-bold text-blue-400">0</div>
                  <div className="text-xs text-gray-400 mt-1">Total Chats</div>
                </div>
                <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
                  <div className="text-2xl font-bold text-purple-400">0</div>
                  <div className="text-xs text-gray-400 mt-1">Materials</div>
                </div>
                <div className="bg-pink-500/10 rounded-xl p-4 border border-pink-500/20">
                  <div className="text-2xl font-bold text-pink-400">0</div>
                  <div className="text-xs text-gray-400 mt-1">Courses</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <p className="text-sm text-blue-300">
            <span className="font-semibold">Note:</span> Some account settings can
            only be changed by contacting support.
          </p>
        </div>
      </div>
    </div>
  );
}
