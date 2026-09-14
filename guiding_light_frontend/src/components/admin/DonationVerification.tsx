/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, Filter, ShieldCheck, Check, Loader, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

interface DonationVerificationProps {
  currentUser: { id: number; username: string; role?: string } | null;
}

// Ensure your donation type matches what your PHP script returns
interface Donation {
  id: string; // The database might return a string or number depending on your schema. Adjust if needed.
  donor_name: string; // Using snake_case to match standard PHP/MySQL output
  transaction_date: string;
  amount: string;
  payment_method: string;
  status: string;
}

export default function DonationVerification({ currentUser }: DonationVerificationProps) {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Verification states
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  // Search filter state
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDonations();
  }, [currentUser]);

  const fetchDonations = async () => {
    if (!currentUser?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Secure URL with the admin_id badge!
      const response = await fetch(`/guiding_light_backend/get_donations.php?admin_id=${currentUser.id}`);
      const data = await response.json();
      
      if (data.success) {
        setDonations(data.donations);
      } else {
        setError(data.error || 'Failed to load donations.');
      }
    } catch (err) {
      setError('Failed to connect to the server.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (id: string) => {
    // In a real application, you would send a fetch POST request here to update the database status.
    // For this capstone demo, if you don't have an update script yet, we will just simulate it in the UI.
    
    setVerifyingId(id);
    
    setTimeout(() => {
      setDonations(prev => prev.map(d => d.id === id ? { ...d, status: 'Verified' } : d));
      setVerifyingId(null);
    }, 1000);
  };

  // Filter the donations based on the search query
  const filteredDonations = donations.filter(donation => 
    donation.id?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    donation.donor_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              placeholder="Search TXN ID or Name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-6 py-3 bg-white border border-stone-100 rounded-full text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-[#d4c5b3] w-72 shadow-sm"
            />
          </div>
          <button className="p-3 bg-white border border-stone-100 rounded-full hover:bg-stone-50 text-stone-400 transition-colors shadow-sm">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-stone-100 shadow-sm overflow-hidden p-4">
        {error ? (
          <div className="p-12 text-center text-red-500 flex flex-col items-center justify-center">
             <AlertTriangle className="w-12 h-12 mb-4 opacity-50" />
             <p className="font-bold uppercase tracking-widest">{error}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
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
                {isLoading ? (
                   <tr>
                    <td colSpan={6} className="text-center p-20">
                      <div className="flex flex-col items-center justify-center text-stone-400">
                        <Loader className="w-8 h-8 animate-spin mb-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">Loading Records...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredDonations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-20 text-stone-400 font-bold uppercase tracking-widest">
                      {searchQuery ? 'No donations match your search.' : 'No donation records found.'}
                    </td>
                  </tr>
                ) : (
                  filteredDonations.map((donation) => (
                    <tr key={donation.id} className="hover:bg-stone-50/50 transition-colors group">
                      <td className="px-8 py-6 text-[11px] font-mono font-bold text-stone-400 group-hover:text-stone-800">#{donation.id}</td>
                      <td className="px-8 py-6">
                        <p className="text-xs font-bold text-stone-800 uppercase tracking-widest mb-1">{donation.donor_name}</p>
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter">
                           {/* Formatting the date nicely if it exists */}
                           {donation.transaction_date ? new Date(donation.transaction_date).toLocaleDateString() : 'N/A'}
                        </p>
                      </td>
                      <td className="px-8 py-6 text-sm font-bold text-stone-800 text-right">
                        {/* Make sure we safely parse the amount string to a number for formatting */}
                        ₱ {parseFloat(donation.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-stone-500">{donation.payment_method}</td>
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}