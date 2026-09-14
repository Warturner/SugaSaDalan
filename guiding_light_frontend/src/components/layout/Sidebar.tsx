/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Landmark, 
  LogOut,
  Settings,
  Users,
  UserSquare,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { AdminTab } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  onLogout: () => void;
  user: { id: number; username: string; role?: string } | null; 
}

export default function Sidebar({ activeTab, setActiveTab, onLogout, user }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    // Both roles can see Stories
    { id: 'Stories' as AdminTab, icon: FileText, label: 'Stories', allowedRoles: ['admin', 'media'] },
    
    // Only Admin can see these
    { id: 'Team' as AdminTab, icon: UserSquare, label: 'Team Profiles', allowedRoles: ['admin'] },
    { id: 'Donations' as AdminTab, icon: LayoutDashboard, label: 'Donations', allowedRoles: ['admin'] },
    { id: 'Reconciliation' as AdminTab, icon: Landmark, label: 'Bank Reconciliation', allowedRoles: ['admin'] },
    { id: 'Accounts' as AdminTab, icon: Users, label: 'User Accounts', allowedRoles: ['admin'] },
    
    // Both roles should be able to change their own password
    { id: 'Settings' as AdminTab, icon: Settings, label: 'Settings', allowedRoles: ['admin', 'media'] }, 
  ];

  // Filter the menu so they only see what they are allowed to see
  const visibleMenu = menuItems.filter(item => item.allowedRoles.includes(user?.role || 'media'));

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden fixed top-6 left-6 z-[60]">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-3 bg-[#3a4740] text-[#d4c5b3] rounded-2xl shadow-xl border border-white/10 active:scale-95 transition-transform"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[50] lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={`
        w-64 bg-[#3a4740] h-screen text-stone-100 flex flex-col fixed left-0 top-0 z-[55] 
        transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none
        overflow-y-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-8 border-b border-white/10">
          <h1 className="text-2xl font-serif italic text-[#d4c5b3]">Guiding Light</h1>
          <p className="text-[10px] uppercase tracking-widest opacity-60 mt-1">Streetlight: Suga sa Dalan</p>
        </div>

        <nav className="flex-1 mt-8">
          <div className="px-8 mb-4 opacity-50 text-[10px] uppercase tracking-widest font-bold">NGO Administration</div>
          {visibleMenu.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsOpen(false); }}
              className={`w-full flex items-center px-8 py-5 text-[11px] uppercase tracking-widest font-bold transition-all relative group ${
                activeTab === item.id ? 'text-[#d4c5b3] bg-white/5' : 'text-stone-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className={`w-4 h-4 mr-3 transition-transform ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
              {item.label}
              {activeTab === item.id && (
                <motion.div
                  layoutId="active-sidebar-indicator"
                  className="absolute left-0 w-1.5 h-full bg-[#d4c5b3]"
                />
              )}
            </button>
          ))}
        </nav>

        <div className="p-8 border-t border-white/10">
          <div className="mb-6 p-5 rounded-[24px] bg-white/5 border border-white/10">
            <p className="text-[10px] opacity-40 uppercase tracking-widest font-bold mb-3">Admin Session</p>
            <p className="text-xs font-semibold text-white capitalize">{user?.username || 'System User'}</p>
            <p className="text-[9px] text-[#d4c5b3] uppercase tracking-tighter mt-0.5">
              {user?.role === 'admin' ? 'System Administrator' : 'Media Manager'}
            </p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center text-stone-400 hover:text-[#d4c5b3] transition-colors w-full text-[10px] uppercase tracking-widest font-bold group"
          >
            <LogOut className="w-4 h-4 mr-3 group-hover:-translate-x-1 transition-transform" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}