/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MOCK_DONATIONS } from '../../data/mockData';
import { Search, Filter, ShieldCheck, Check } from 'lucide-react';
import { motion } from 'motion/react';

export default function DonationVerification() {
  const [donations, setDonations] = React.useState(MOCK_DONATIONS);
  const [verifyingId, setVerifyingId] = React.useState<string | null>(null);

  const handleVerify = (id: string) => {
    setVerifyingId(id);
    setTimeout(() => {
      setDonations(prev => prev.map(d => d.id === id ? { ...d, status: 'Verified' as const } : d));
      setVerifyingId(null);
    }, 1000);
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div>
          <h2 className="text-3xl font-serif italic text-stone-800">Donation Verification</h2>
          <p className="text-stone-400 text-sm">Monitor and verify incoming transactions from PayMongo.</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300 group-focus-within:text-stone-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search TXN ID..." 
              className="pl-12 pr-6 py-3 bg-white border border-stone-100 rounded-full text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-[#d4c5b3] w-72 shadow-sm"
            />
          </div>
          <button className="p-3 bg-white border border-stone-100 rounded-full hover:bg-stone-50 text-stone-400 transition-colors shadow-sm">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-stone-100 shadow-sm overflow-hidden p-4">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-stone-50">
              <th className="px-8 py-6 text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">TXN ID</th>
              <th className="px-8 py-6 text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">Donor Profile</th>
              <th className="px-8 py-6 text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] text-right">Amount</th>
              <th className="px-8 py-6 text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">Method</th>
              <th className="px-8 py-6 text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">Status</th>
              <th className="px-8 py-6 text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {donations.map((donation) => (
              <tr key={donation.id} className="hover:bg-stone-50/50 transition-colors group">
                <td className="px-8 py-6 text-[11px] font-mono font-bold text-stone-400 group-hover:text-stone-800">{donation.id}</td>
                <td className="px-8 py-6">
                  <p className="text-xs font-bold text-stone-800 uppercase tracking-widest mb-1">{donation.donorName}</p>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter">{donation.date}</p>
                </td>
                <td className="px-8 py-6 text-sm font-bold text-stone-800 text-right">₱ {donation.amount.toLocaleString()}</td>
                <td className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-stone-500">{donation.gateway}</td>
                <td className="px-8 py-6">
                  {donation.status === 'Verified' ? (
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-bold bg-[#3a4740]/10 text-[#3a4740] uppercase tracking-widest border border-[#3a4740]/20">
                      <Check className="w-3 h-3 mr-2" /> Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-bold bg-[#d4a373]/10 text-[#d4a373] uppercase tracking-widest border border-[#d4a373]/20">
                      Pending
                    </span>
                  )}
                </td>
                <td className="px-8 py-6 text-right">
                  {donation.status === 'Pending' && (
                    <button
                      onClick={() => handleVerify(donation.id)}
                      disabled={verifyingId === donation.id}
                      className="px-6 py-2.5 bg-[#4b5e52] text-white text-[9px] font-bold rounded-full hover:bg-[#3a4740] transition-all disabled:bg-stone-200 uppercase tracking-[0.2em] shadow-md shadow-stone-100"
                    >
                      {verifyingId === donation.id ? 'Verifying...' : 'Verify'}
                    </button>
                  )}
                  {donation.status === 'Verified' && (
                    <div className="text-[#3a4740] flex justify-end">
                      <ShieldCheck className="w-6 h-6 opacity-60" />
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
