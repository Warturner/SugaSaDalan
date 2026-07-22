/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, User, Loader2, ArrowLeft } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: { id: number; username: string }) => void;
  onBack: () => void;
}

export default function Login({ onLoginSuccess, onBack }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost/GuidingLight_Project/guiding_light_backend/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (data.error) throw new Error(data.error);
      
if (data.success) {
        onLoginSuccess(data.user);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f5f2] flex flex-col justify-center items-center p-4">
      <button 
        onClick={onBack}
        className="absolute top-10 left-10 flex items-center text-stone-500 hover:text-stone-800 transition-colors text-[10px] font-bold uppercase tracking-widest"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Site
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[32px] shadow-xl border border-stone-100 p-10"
      >
        <div className="text-center mb-10">
          <h2 className="text-3xl font-serif italic text-stone-800 mb-2">Staff Portal</h2>
          <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Secure System Access</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold uppercase tracking-widest text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-12 pr-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#4b5e52]/20 focus:border-[#4b5e52] text-stone-800 text-sm"
                placeholder="Enter your username"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#4b5e52]/20 focus:border-[#4b5e52] text-stone-800 text-sm"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-[#4b5e52] text-white py-4 rounded-full font-bold text-[10px] uppercase tracking-widest shadow-lg hover:bg-[#3a4740] transition-all flex items-center justify-center disabled:opacity-70 mt-4"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {isLoading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}