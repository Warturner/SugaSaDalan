/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, User, ArrowLeft, Loader, AlertTriangle, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: { id: number; username: string; role?: string }) => void;
  onBack: () => void;
}

export default function Login({ onLoginSuccess, onBack }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/guiding_light_backend/login.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        onLoginSuccess(data.user);
      } else {
        setError(data.error || 'Invalid username or password.');
      }
    } catch (err) {
      setError('Unable to connect to the server. Please check your internet connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ede9e3] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/40 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#d4c5b3]/30 blur-3xl rounded-full -translate-x-1/2 translate-y-1/2"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-10 md:p-14 rounded-[48px] shadow-2xl max-w-md w-full relative z-10 border border-white/50"
      >
        <button 
          onClick={onBack}
          className="flex items-center text-stone-400 hover:text-stone-800 transition-colors mb-12 group text-[10px] font-bold uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Public Site
        </button>

        <div className="mb-12">
          {/* The padlock icon has been removed from here! */}
          <h2 className="text-4xl font-serif italic text-stone-800 mb-2">Admin Portal</h2>
          <p className="text-stone-500 text-sm">Secure access for authorized personnel only.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Username</label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-6 py-4 bg-stone-50 border-none rounded-2xl focus:ring-2 focus:ring-[#d4c5b3] pl-12"
                placeholder="Enter username"
              />
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 bg-stone-50 border-none rounded-2xl focus:ring-2 focus:ring-[#d4c5b3] pl-12 pr-12"
                placeholder="••••••••"
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300" />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs flex items-start font-medium"
            >
              <AlertTriangle className="w-4 h-4 mr-2 shrink-0 mt-0.5" />
              <p>{error}</p>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#3a4740] text-[#d4c5b3] py-4 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-[#2c3630] transition-colors flex items-center justify-center shadow-xl shadow-[#3a4740]/20 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              'Authenticate'
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-stone-100 pt-8">
          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest flex items-center justify-center">
            <Lock className="w-3 h-3 mr-2" />
            Protected System
          </p>
        </div>
      </motion.div>
    </div>
  );
}