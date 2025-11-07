// 'use client';

// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { useAuthStore } from '@/frontend/store/authStore';
// import { useThemeStore } from '@/frontend/store/themeStore';
// import { toast } from 'sonner';
// import {
//   Bell,
//   Lock,
//   Globe,
//   Moon,
//   Sun,
//   Monitor,
//   Shield,
//   Trash2,
//   Eye,
//   EyeOff,
//   Key,
//   Save,
//   AlertTriangle,
// } from 'lucide-react';
// import { Button } from '@/src/components/ui/button';
// import { Input } from '@/src/components/ui/input';
// import { Badge } from '@/src/components/ui/badge';
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from '@/src/components/ui/tooltip';
// import axios from 'axios';

// export default function SettingsPage() {
//   const router = useRouter();
//   const { isAuthenticated, token, user } = useAuthStore();
//   const { theme, setTheme } = useThemeStore();
//   const [loading, setLoading] = useState(false);

//   // Notification settings
//   const [notifications, setNotifications] = useState({
//     email: true,
//     push: false,
//     chatMessages: true,
//     materialUpdates: true,
//     courseReminders: true,
//   });

//   // Security settings
//   const [showPasswords, setShowPasswords] = useState(false);
//   const [passwordData, setPasswordData] = useState({
//     currentPassword: '',
//     newPassword: '',
//     confirmPassword: '',
//   });

//   useEffect(() => {
//     if (!isAuthenticated || !token) {
//       toast.error('Please login to access settings');
//       router.replace('/login');
//       return;
//     }
//   }, [isAuthenticated, token, router]);

//   const handleSaveNotifications = async () => {
//     setLoading(true);
//     try {
//       // API call to save notification preferences
//       await axios.patch(
//         '/api/user/settings/notifications',
//         notifications,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       toast.success('Notification settings saved successfully');
//     } catch (error) {
//       console.error('Failed to save settings:', error);
//       toast.error('Failed to save notification settings');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChangePassword = async () => {
//     if (!passwordData.currentPassword || !passwordData.newPassword) {
//       toast.error('Please fill in all password fields');
//       return;
//     }

//     if (passwordData.newPassword !== passwordData.confirmPassword) {
//       toast.error('New passwords do not match');
//       return;
//     }

//     if (passwordData.newPassword.length < 6) {
//       toast.error('Password must be at least 6 characters long');
//       return;
//     }

//     setLoading(true);
//     try {
//       await axios.post(
//         '/api/user/change-password',
//         {
//           currentPassword: passwordData.currentPassword,
//           newPassword: passwordData.newPassword,
//         },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       toast.success('Password changed successfully');
//       setPasswordData({
//         currentPassword: '',
//         newPassword: '',
//         confirmPassword: '',
//       });
//     } catch (error: any) {
//       console.error('Failed to change password:', error);
//       toast.error(error.response?.data?.error || 'Failed to change password');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDeleteAccount = async () => {
//     const confirmed = window.confirm(
//       'Are you sure you want to delete your account? This action cannot be undone.'
//     );

//     if (!confirmed) return;

//     const doubleConfirm = window.confirm(
//       'This will permanently delete all your data including chats, materials, and courses. Are you absolutely sure?'
//     );

//     if (!doubleConfirm) return;

//     setLoading(true);
//     try {
//       await axios.delete('/api/user/account', {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       toast.success('Account deleted successfully');
//       router.push('/');
//     } catch (error) {
//       console.error('Failed to delete account:', error);
//       toast.error('Failed to delete account');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!isAuthenticated || !token || !user) {
//     return null;
//   }

//   return (
//     <TooltipProvider>
//       <div className="min-h-screen dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 bg-gradient-to-br from-gray-50 via-white to-gray-50">
//         <div className="max-w-4xl mx-auto p-6 md:p-8">
//           {/* Header */}
//           <div className="mb-8">
//             <button
//               onClick={() => router.back()}
//               className="dark:text-gray-400 text-gray-600 dark:hover:text-white hover:text-gray-900 transition-colors mb-4 flex items-center gap-2"
//             >
//               <svg
//                 className="w-5 h-5"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M15 19l-7-7 7-7"
//                 />
//               </svg>
//               Back to Dashboard
//             </button>
//             <h1 className="text-3xl font-bold dark:bg-gradient-to-r dark:from-white dark:to-gray-300 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
//               Settings
//             </h1>
//             <p className="dark:text-gray-400 text-gray-600 mt-2">
//               Manage your account preferences and security
//             </p>
//           </div>

//           <div className="space-y-6">
//             {/* Appearance Settings */}
//             <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
//               <div className="flex items-center gap-3 mb-6">
//                 <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
//                   <Monitor className="w-5 h-5 text-purple-400" />
//                 </div>
//                 <div>
//                   <h2 className="text-xl font-bold text-white">Appearance</h2>
//                   <p className="text-sm text-gray-400">Customize how Study Buddy looks</p>
//                 </div>
//               </div>

//               <div className="space-y-4">
//                 <div>
//                   <label className="text-sm font-medium text-gray-300 mb-3 block">
//                     Theme
//                   </label>
//                   <div className="grid grid-cols-3 gap-3">
//                     {[
//                       { value: 'light', icon: Sun, label: 'Light' },
//                       { value: 'dark', icon: Moon, label: 'Dark' },
//                       { value: 'system', icon: Monitor, label: 'System' },
//                     ].map((option) => (
//                       <button
//                         key={option.value}
//                         onClick={() => setTheme(option.value as any)}
//                         className={`p-4 rounded-xl border transition-all ${
//                           theme === option.value
//                             ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
//                             : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
//                         }`}
//                       >
//                         <option.icon className="w-5 h-5 mx-auto mb-2" />
//                         <div className="text-sm font-medium">{option.label}</div>
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Notification Settings */}
//             <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
//               <div className="flex items-center justify-between mb-6">
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
//                     <Bell className="w-5 h-5 text-blue-400" />
//                   </div>
//                   <div>
//                     <h2 className="text-xl font-bold text-white">Notifications</h2>
//                     <p className="text-sm text-gray-400">
//                       Control how you receive updates
//                     </p>
//                   </div>
//                 </div>
//                 <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
//                   Active
//                 </Badge>
//               </div>

//               <div className="space-y-4">
//                 {[
//                   {
//                     key: 'email',
//                     label: 'Email Notifications',
//                     description: 'Receive updates via email',
//                   },
//                   {
//                     key: 'push',
//                     label: 'Push Notifications',
//                     description: 'Browser push notifications',
//                   },
//                   {
//                     key: 'chatMessages',
//                     label: 'Chat Messages',
//                     description: 'Notify when receiving chat messages',
//                   },
//                   {
//                     key: 'materialUpdates',
//                     label: 'Material Updates',
//                     description: 'Notify about material changes',
//                   },
//                   {
//                     key: 'courseReminders',
//                     label: 'Course Reminders',
//                     description: 'Reminders for upcoming courses',
//                   },
//                 ].map((setting) => (
//                   <div
//                     key={setting.key}
//                     className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors"
//                   >
//                     <div>
//                       <div className="text-white font-medium">{setting.label}</div>
//                       <div className="text-sm text-gray-400">
//                         {setting.description}
//                       </div>
//                     </div>
//                     <button
//                       onClick={() =>
//                         setNotifications({
//                           ...notifications,
//                           [setting.key]: !notifications[setting.key as keyof typeof notifications],
//                         })
//                       }
//                       className={`relative w-12 h-6 rounded-full transition-colors ${
//                         notifications[setting.key as keyof typeof notifications]
//                           ? 'bg-blue-600'
//                           : 'bg-gray-600'
//                       }`}
//                     >
//                       <div
//                         className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
//                           notifications[setting.key as keyof typeof notifications]
//                             ? 'translate-x-6'
//                             : 'translate-x-0'
//                         }`}
//                       />
//                     </button>
//                   </div>
//                 ))}
//               </div>

//               <div className="mt-6">
//                 <Button
//                   onClick={handleSaveNotifications}
//                   disabled={loading}
//                   className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
//                 >
//                   <Save className="w-4 h-4 mr-2" />
//                   {loading ? 'Saving...' : 'Save Notification Settings'}
//                 </Button>
//               </div>
//             </div>

//             {/* Security Settings */}
//             <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
//               <div className="flex items-center gap-3 mb-6">
//                 <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
//                   <Shield className="w-5 h-5 text-red-400" />
//                 </div>
//                 <div>
//                   <h2 className="text-xl font-bold text-white">Security</h2>
//                   <p className="text-sm text-gray-400">Manage your password and security</p>
//                 </div>
//               </div>

//               <div className="space-y-4">
//                 <div>
//                   <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
//                     <Lock className="w-4 h-4" />
//                     Current Password
//                   </label>
//                   <div className="relative">
//                     <Input
//                       type={showPasswords ? 'text' : 'password'}
//                       value={passwordData.currentPassword}
//                       onChange={(e) =>
//                         setPasswordData({
//                           ...passwordData,
//                           currentPassword: e.target.value,
//                         })
//                       }
//                       className="bg-white/5 border-white/10 text-white focus:border-blue-500/50 pr-10"
//                       placeholder="Enter current password"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowPasswords(!showPasswords)}
//                       className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
//                     >
//                       {showPasswords ? (
//                         <EyeOff className="w-4 h-4" />
//                       ) : (
//                         <Eye className="w-4 h-4" />
//                       )}
//                     </button>
//                   </div>
//                 </div>

//                 <div>
//                   <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
//                     <Key className="w-4 h-4" />
//                     New Password
//                   </label>
//                   <Input
//                     type={showPasswords ? 'text' : 'password'}
//                     value={passwordData.newPassword}
//                     onChange={(e) =>
//                       setPasswordData({
//                         ...passwordData,
//                         newPassword: e.target.value,
//                       })
//                     }
//                     className="bg-white/5 border-white/10 text-white focus:border-blue-500/50"
//                     placeholder="Enter new password"
//                   />
//                 </div>

//                 <div>
//                   <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
//                     <Key className="w-4 h-4" />
//                     Confirm New Password
//                   </label>
//                   <Input
//                     type={showPasswords ? 'text' : 'password'}
//                     value={passwordData.confirmPassword}
//                     onChange={(e) =>
//                       setPasswordData({
//                         ...passwordData,
//                         confirmPassword: e.target.value,
//                       })
//                     }
//                     className="bg-white/5 border-white/10 text-white focus:border-blue-500/50"
//                     placeholder="Confirm new password"
//                   />
//                 </div>

//                 <Button
//                   onClick={handleChangePassword}
//                   disabled={loading}
//                   className="w-full bg-green-600 hover:bg-green-500"
//                 >
//                   <Lock className="w-4 h-4 mr-2" />
//                   {loading ? 'Changing...' : 'Change Password'}
//                 </Button>
//               </div>
//             </div>

//             {/* Danger Zone */}
//             <div className="bg-red-500/10 backdrop-blur-xl rounded-2xl border border-red-500/30 p-6">
//               <div className="flex items-center gap-3 mb-6">
//                 <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
//                   <AlertTriangle className="w-5 h-5 text-red-400" />
//                 </div>
//                 <div>
//                   <h2 className="text-xl font-bold text-red-400">Danger Zone</h2>
//                   <p className="text-sm text-red-300/70">
//                     Irreversible and destructive actions
//                   </p>
//                 </div>
//               </div>

//               <div className="bg-red-500/5 rounded-xl p-4 border border-red-500/20">
//                 <div className="flex items-start justify-between gap-4">
//                   <div>
//                     <h3 className="text-white font-semibold mb-1">
//                       Delete Account
//                     </h3>
//                     <p className="text-sm text-gray-400">
//                       Permanently delete your account and all associated data. This
//                       action cannot be undone.
//                     </p>
//                   </div>
//                   <Tooltip>
//                     <TooltipTrigger asChild>
//                       <Button
//                         onClick={handleDeleteAccount}
//                         disabled={loading}
//                         variant="destructive"
//                         className="bg-red-600 hover:bg-red-500 flex-shrink-0"
//                       >
//                         <Trash2 className="w-4 h-4 mr-2" />
//                         Delete
//                       </Button>
//                     </TooltipTrigger>
//                     <TooltipContent side="left">
//                       This action is permanent and cannot be undone
//                     </TooltipContent>
//                   </Tooltip>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </TooltipProvider>
//   );
// }
