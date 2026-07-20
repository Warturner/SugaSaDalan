/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LayoutDashboard, FileText, Landmark, LogOut, ChevronRight } from 'lucide-react';
import { AdminTab } from '../../types';
import { motion } from 'motion/react';

interface SidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  onLogout: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, onLogout }: SidebarProps) {
  const menuItems = [
    { id: 'CMS' as AdminTab, icon: FileText, label: 'CMS' },
    { id: 'Donations' as AdminTab, icon: LayoutDashboard, label: 'Donations' },
    { id: 'Reconciliation' as AdminTab, icon: Landmark, label: 'Bank Reconciliation' },
  ];

  return (
    <div className="w-64 bg-[#3a4740] h-screen text-stone-100 flex flex-col fixed left-0 top-0">
      <div className="p-8 border-b border-white/10">
        <h1 className="text-2xl font-serif italic text-[#d4c5b3]">Guiding Light</h1>
        <p className="text-[10px] uppercase tracking-widest opacity-60 mt-1">Streetlight: Suga sa Dalan</p>
      </div>

      <nav className="flex-1 mt-8">
        <div className="px-8 mb-4 opacity-50 text-[10px] uppercase tracking-widest">NGO Administration</div>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center px-8 py-4 text-sm transition-colors relative ${
              activeTab === item.id ? 'text-[#d4c5b3] bg-white/5' : 'opacity-70 hover:opacity-100 hover:bg-white/5'
            }`}
          >
            <item.icon className="w-4 h-4 mr-3" />
            {item.label}
            {activeTab === item.id && (
              <motion.div
                layoutId="active-sidebar-indicator"
                className="absolute left-0 w-1 h-full bg-[#d4c5b3]"
              />
            )}
          </button>
        ))}
      </nav>

      <div className="p-8 border-t border-white/10">
        <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/10">
          <p className="text-[11px] opacity-70 mb-2">Secure Admin Session</p>
          <p className="text-xs font-semibold">Maria Clara Santos</p>
          <p className="text-[10px] opacity-50">System Administrator</p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center text-stone-400 hover:text-[#d4a373] transition-colors w-full text-xs uppercase tracking-widest font-bold"
        >
          <LogOut className="w-4 h-4 mr-3" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
