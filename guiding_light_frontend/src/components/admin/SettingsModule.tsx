/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Lock, Loader2, CheckCircle } from 'lucide-react';
import { User as UserType } from '../../types';

interface SettingsModuleProps {
  user: UserType | null;
  onUpdateUser: (user: UserType) => void;
}

export default function SettingsModule({ user, onUpdateUser }: SettingsModuleProps) {
  // Username Form State
  const [newUsername, setNewUsername] = useState('');
  const [currentPasswordForUser, setCurrentPasswordForUser] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<{ type: 'error' | 'success', msg: string } | null>(null);
  const [isSubmittingUsername, setIsSubmittingUsername] = useState(false);

  // Password Form State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'error' | 'success', msg: string } | null>(null);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    // NEW: Strict Username Validation
    if (newUsername.trim().length < 3) {
      setUsernameStatus({ type: 'error', msg: 'Username must be at least 3 characters long.' });
      return;
    }
    
    setUsernameStatus(null);
    setIsSubmittingUsername(true);

    try {
      const response = await fetch('http://localhost/GuidingLight_Project/guiding_light_backend/update_profile.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_username',
          user_id: user.id,
          new_username: newUsername.trim(),
          current_password: currentPasswordForUser
        })
      });
      const data = await response.json();

      if (data.error) throw new Error(data.error);

      if (data.success) {
        setUsernameStatus({ type: 'success', msg: 'Username updated successfully!' });
        onUpdateUser({ ...user, username: data.new_username }); 
        setNewUsername('');
        setCurrentPasswordForUser('');
      }
    } catch (err) {
      setUsernameStatus({ type: 'error', msg: err instanceof Error ? err.message : 'Failed to update username' });
    } finally {
      setIsSubmittingUsername(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // NEW: Strict Password Validations
    if (newPassword.length < 8) {
      setPasswordStatus({ type: 'error', msg: 'New password must be at least 8 characters long.' });
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setPasswordStatus({ type: 'error', msg: 'New password must contain at least one uppercase letter.' });
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      setPasswordStatus({ type: 'error', msg: 'New password must contain at least one special character.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', msg: 'New passwords do not match.' });
      return;
    }

    setPasswordStatus(null);
    setIsSubmittingPassword(true);

    try {
      const response = await fetch('http://localhost/GuidingLight_Project/guiding_light_backend/update_profile.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_password',
          user_id: user.id,
          old_password: oldPassword,
          new_password: newPassword
        })
      });
      const data = await response.json();

      if (data.error) throw new Error(data.error);

      if (data.success) {
        setPasswordStatus({ type: 'success', msg: 'Password updated successfully!' });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setPasswordStatus({ type: 'error', msg: err instanceof Error ? err.message : 'Failed to update password' });
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div className="mb-8">
        <h2 className="text-2xl font-serif italic text-stone-700">Account Settings</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Update Username Card */}
        <div className="bg-white rounded-[32px] p-8 border border-stone-100 shadow-sm">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-[#f7f5f2] rounded-full flex items-center justify-center mr-4">
              <User className="w-5 h-5 text-[#4b5e52]" />
            </div>
            <h3 className="text-lg font-bold text-stone-800">Change Username</h3>
          </div>

          {usernameStatus && (
            <div className={`mb-6 p-4 rounded-2xl text-xs font-bold uppercase tracking-widest text-center border ${usernameStatus.type === 'error' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100 flex items-center justify-center'}`}>
              {usernameStatus.type === 'success' && <CheckCircle className="w-4 h-4 mr-2" />}
              {usernameStatus.msg}
            </div>
          )}

          <form onSubmit={handleUpdateUsername} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">New Username</label>
              <input 
                type="text" required value={newUsername} onChange={(e) => setNewUsername(e.target.value)}
                className="w-full px-5 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4b5e52]/20 text-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Current Password (To Verify)</label>
              <input 
                type="password" required value={currentPasswordForUser} onChange={(e) => setCurrentPasswordForUser(e.target.value)}
                className="w-full px-5 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4b5e52]/20 text-sm"
              />
            </div>
            <button type="submit" disabled={isSubmittingUsername} className="w-full bg-[#4b5e52] text-white py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-[#3a4740] transition-colors disabled:opacity-70 flex justify-center items-center mt-2">
              {isSubmittingUsername ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Update Username
            </button>
          </form>
        </div>

        {/* Update Password Card */}
        <div className="bg-white rounded-[32px] p-8 border border-stone-100 shadow-sm">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-[#f7f5f2] rounded-full flex items-center justify-center mr-4">
              <Lock className="w-5 h-5 text-[#4b5e52]" />
            </div>
            <h3 className="text-lg font-bold text-stone-800">Change Password</h3>
          </div>

          {passwordStatus && (
            <div className={`mb-6 p-4 rounded-2xl text-xs font-bold uppercase tracking-widest text-center border ${passwordStatus.type === 'error' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100 flex items-center justify-center'}`}>
              {passwordStatus.type === 'success' && <CheckCircle className="w-4 h-4 mr-2" />}
              {passwordStatus.msg}
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Old Password</label>
              <input 
                type="password" required value={oldPassword} onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-5 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4b5e52]/20 text-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">New Password</label>
              <input 
                type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-5 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4b5e52]/20 text-sm"
              />
              <p className="text-[9px] text-stone-400 mt-2 uppercase tracking-wider">Must contain 8+ characters, 1 uppercase, 1 special character.</p>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Re-type New Password</label>
              <input 
                type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-5 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4b5e52]/20 text-sm"
              />
            </div>
            <button type="submit" disabled={isSubmittingPassword} className="w-full bg-[#4b5e52] text-white py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-[#3a4740] transition-colors disabled:opacity-70 flex justify-center items-center mt-2">
              {isSubmittingPassword ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}