/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Shield, User, Trash2, Edit, X, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Account {
  user_id: number;
  username: string;
  role: 'admin' | 'media';
}

// 1. ADDED THE PROPS INTERFACE
interface UserAccountsProps {
  currentUser: { id: number; username: string; role?: string } | null;
}

// 2. PASSED currentUser INTO THE COMPONENT
export default function UserAccounts({ currentUser }: UserAccountsProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Form States
  const [userId, setUserId] = useState<number | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'media'>('media');
  
  // Security & Toggle States
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 3. ONLY FETCH WHEN currentUser IS AVAILABLE
  useEffect(() => {
    if (currentUser?.id) {
      fetchUsers();
    }
  }, [currentUser]);

  const fetchUsers = async () => {
    try {
      // 4. APPENDED admin_id TO THE FETCH URL
      const response = await fetch(`/guiding_light_backend/get_users.php?admin_id=${currentUser?.id}`);
      const data = await response.json();
      if (data.success) {
        setAccounts(data.users);
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setUserId(null);
    setUsername('');
    setPassword('');
    setAdminPassword('');
    setRole('media');
    setError(null);
    setShowPassword(false);
    setShowAdminPassword(false);
  };

  // --- CREATE USER ---
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/guiding_light_backend/create_user.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role })
      });
      const data = await response.json();
      if (data.success) {
        setIsCreateModalOpen(false);
        resetForm();
        fetchUsers();
      } else {
        setError(data.error || 'Failed to create user.');
      }
    } catch (err) {
      setError('Server connection failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- EDIT USER ---
  const openEditModal = (acc: Account) => {
    setUserId(acc.user_id);
    setUsername(acc.username);
    setRole(acc.role);
    setPassword(''); 
    setIsEditModalOpen(true);
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/guiding_light_backend/edit_user.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: userId, 
          username, 
          password, 
          role,
          admin_id: currentUser?.id,
          admin_password: adminPassword
        })
      });
      const data = await response.json();
      if (data.success) {
        setIsEditModalOpen(false);
        resetForm();
        fetchUsers();
      } else {
        setError(data.error || 'Failed to update user.');
      }
    } catch (err) {
      setError('Server connection failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- DELETE USER ---
  const handleDeleteUser = async (id: number, name: string) => {
    if (!window.confirm(`Are you absolutely sure you want to delete the account for "${name}"? This cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch('/guiding_light_backend/delete_user.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: id })
      });
      const data = await response.json();
      
      if (data.success) {
        fetchUsers();
      } else {
        alert(data.error || 'Failed to delete user.');
      }
    } catch (err) {
      alert('Server connection failed.');
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-3xl font-serif italic text-stone-800 mb-2">User Accounts</h2>
          <p className="text-stone-500">Manage system access and permissions for NGO staff.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsCreateModalOpen(true); }}
          className="flex items-center bg-[#4b5e52] text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#3a4740] transition-colors shadow-lg active:scale-95"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add New User
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[32px] border border-stone-100 shadow-sm overflow-hidden"
      >
        <table className="w-full text-left border-collapse">
          <thead className="bg-stone-50 border-b border-stone-100">
            <tr>
              <th className="px-8 py-5 text-[10px] font-bold text-stone-400 uppercase tracking-widest">User ID</th>
              <th className="px-8 py-5 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Username</th>
              <th className="px-8 py-5 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Role</th>
              <th className="px-8 py-5 text-[10px] font-bold text-stone-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {isLoading ? (
              <tr><td colSpan={4} className="text-center py-12 text-stone-400">Loading accounts...</td></tr>
            ) : accounts.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-12 text-stone-400">No accounts found.</td></tr>
            ) : (
              accounts.map((acc) => (
                <tr key={acc.user_id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-8 py-5 text-sm font-mono text-stone-400">#{acc.user_id}</td>
                  <td className="px-8 py-5"><span className="text-sm font-bold text-stone-800 capitalize">{acc.username}</span></td>
                  <td className="px-8 py-5">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      acc.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {acc.role === 'admin' ? <Shield className="w-3 h-3 mr-1.5" /> : <User className="w-3 h-3 mr-1.5" />}
                      {acc.role}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end space-x-3">
                      <button onClick={() => openEditModal(acc)} className="p-2 text-stone-400 hover:text-blue-500 transition-colors rounded-xl hover:bg-blue-50">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteUser(acc.user_id, acc.username)} className="p-2 text-stone-400 hover:text-red-500 transition-colors rounded-xl hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </motion.div>

      {/* Shared Modal for Create & Edit */}
      <AnimatePresence>
        {(isCreateModalOpen || isEditModalOpen) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-serif italic text-stone-800">
                  {isEditModalOpen ? 'Edit User' : 'Add New User'}
                </h3>
                <button 
                  onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }}
                  className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={isEditModalOpen ? handleEditUser : handleCreateUser} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Username</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 bg-stone-50 border-none rounded-2xl focus:ring-2 focus:ring-[#d4c5b3]"
                    placeholder="Enter username"
                  />
                </div>

                {/* Password Input with Visibility Toggle */}
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">
                    {isEditModalOpen ? 'New Password (leave blank to keep current)' : 'Password'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required={!isEditModalOpen}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-stone-50 border-none rounded-2xl focus:ring-2 focus:ring-[#d4c5b3] pr-12"
                      placeholder={isEditModalOpen ? "Enter new password..." : "Enter password..."}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Account Role</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setRole('media')}
                      className={`py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                        role === 'media' ? 'bg-[#4b5e52] text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                      }`}
                    >
                      <User className="w-4 h-4 mx-auto mb-1" />
                      Media
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('admin')}
                      className={`py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                        role === 'admin' ? 'bg-[#4b5e52] text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                      }`}
                    >
                      <Shield className="w-4 h-4 mx-auto mb-1" />
                      Admin
                    </button>
                  </div>
                </div>

                {/* Admin Authorization Block (Only shows on Edit) */}
                {isEditModalOpen && (
                  <div className="pt-4 border-t border-stone-100">
                    <label className="block text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-2">
                      Admin Authorization Required
                    </label>
                    <p className="text-[9px] text-stone-400 mb-3">Please enter your own admin password to save these changes.</p>
                    <div className="relative">
                      <input
                        type={showAdminPassword ? "text" : "password"}
                        required
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-amber-50 border border-amber-100 rounded-2xl focus:ring-2 focus:ring-amber-200 pr-12"
                        placeholder="Your admin password..."
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                      >
                        {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {error && <p className="text-red-500 text-xs font-bold text-center flex justify-center items-center gap-2"><AlertTriangle className="w-4 h-4"/>{error}</p>}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-[#d4c5b3] text-[#3a4740] rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-[#c4b5a3] transition-colors"
                >
                  {isSubmitting ? 'Saving...' : isEditModalOpen ? 'Update Account' : 'Create Account'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}