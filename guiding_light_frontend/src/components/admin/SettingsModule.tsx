/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, User, Eye, EyeOff, Save, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface SettingsProps {
  user: { id: number; username: string; role?: string } | null;
  onUpdateUser: (user: { id: number; username: string; role?: string }) => void;
}

export default function SettingsModule({ user, onUpdateUser }: SettingsProps) {
  const [username, setUsername] = useState(user?.username || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword && newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (!currentPassword) {
      setError("Your current password is required to save changes.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/guiding_light_backend/update_profile.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          current_password: currentPassword,
          new_username: username,
          new_password: newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        // Update the global state so the header instantly reflects the new username
        if (user && data.new_username !== user.username) {
          onUpdateUser({ ...user, username: data.new_username });
        }
      } else {
        setError(data.error || 'Failed to update profile.');
      }
    } catch (err) {
      setError('Server connection failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-10">
        <h2 className="text-3xl font-serif italic text-stone-800 mb-2">Account Settings</h2>
        <p className="text-stone-500">Update your personal credentials and manage your account security.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[32px] border border-stone-100 shadow-sm overflow-hidden p-8 md:p-12"
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Account Info Section */}
          <div>
            <h3 className="text-lg font-bold text-stone-800 flex items-center mb-6 pb-4 border-b border-stone-100">
              <User className="w-5 h-5 mr-3 text-[#4b5e52]" />
              Profile Information
            </h3>
            
            <div className="mb-6">
              <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Account Role</label>
              <div className="inline-flex items-center px-4 py-2 bg-stone-50 rounded-xl border border-stone-100">
                <span className="text-sm font-bold text-stone-500 capitalize">{user?.role || 'User'}</span>
              </div>
              <p className="text-[10px] text-stone-400 mt-2">Your role determines your system access levels. Contact a system administrator to change this.</p>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-stone-50 border-none rounded-2xl focus:ring-2 focus:ring-[#d4c5b3]"
              />
            </div>
          </div>

          {/* Security Section */}
          <div>
            <h3 className="text-lg font-bold text-stone-800 flex items-center mb-6 pb-4 border-b border-stone-100 mt-10">
              <Lock className="w-5 h-5 mr-3 text-[#4b5e52]" />
              Security Settings
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-2">Current Password (Required)</label>
                <div className="relative">
                  <input
                    type={showCurrent ? "text" : "password"}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-amber-50 border border-amber-100 rounded-2xl focus:ring-2 focus:ring-amber-200 pr-12"
                    placeholder="Enter current password to authorize changes"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">New Password (Optional)</label>
                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-stone-50 border-none rounded-2xl focus:ring-2 focus:ring-[#d4c5b3] pr-12"
                      placeholder="Leave blank to keep current"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Confirm New Password</label>
                  <input
                    type={showNew ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-stone-50 border-none rounded-2xl focus:ring-2 focus:ring-[#d4c5b3]"
                    placeholder="Retype new password"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Status Messages */}
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs flex items-center font-medium">
              <AlertTriangle className="w-4 h-4 mr-2 shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}

          {success && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl text-xs flex items-center font-medium">
              <CheckCircle2 className="w-4 h-4 mr-2 shrink-0" />
              <p>Profile updated successfully!</p>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full md:w-auto px-10 py-4 bg-[#3a4740] text-[#d4c5b3] rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-[#2c3630] transition-colors flex items-center justify-center disabled:opacity-70 mt-8 shadow-xl shadow-[#3a4740]/20"
          >
            {isLoading ? 'Saving...' : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </button>

        </form>
      </motion.div>
    </div>
  );
}