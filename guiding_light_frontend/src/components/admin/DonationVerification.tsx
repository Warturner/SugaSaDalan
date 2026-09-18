/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, Filter, ShieldCheck, Loader, AlertTriangle, Clock } from 'lucide-react';

interface DonationVerificationProps {
  currentUser: { id: number; username: string; role?: string } | null;
}

// Updated to perfectly match the new merged SQL database structure
interface Donation {
  donation_id: number;
  donor_name: string;
  contact_email: string;
  amount: string;
  reference_number: string;
  transaction_date: string;
  payment_method: number;
  status: number;
}

export default function DonationVerification({ currentUser }: DonationVerificationProps) {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
      const response = await fetch(
        '/guiding_light_backend/get_donations.php', {
          credentials: 'include'
        }
      );
      const data = await response.json();
      
      if (data.success) {
        // MATCHED WITH PHP: The PHP script returns json_encode(['success' => true, 'data' => $donations])
        setDonations(data.data || []);
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

  // Helper to map database numeric payment methods to readable text
const getPaymentMethodName = (method: number | string) => {
    switch (Number(method)) {
      case 1: return 'Bank Card';
      case 2: return 'Manual Bank';
      case 3: return 'E-Wallet / Card';
      default: return 'Unknown';
    }
  };

  // Filter the donations based on the search query (Checks Name, Email, or TXN ID)
  const filteredDonations = donations.filter(donation => 
    donation.reference_number?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    donation.donor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    donation.contact_email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div>
          <h2 className="text-3xl font-serif italic text-stone-800">Donation Ledger</h2>
          <p className="text-stone-400 text-sm">Read-only audit trail of all incoming transactions.</p>
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
                  <th className="px-8 py-6 text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">Date</th>
                  <th className="px-8 py-6 text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">TXN ID</th>
                  <th className="px-8 py-6 text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">Donor Profile</th>
                  <th className="px-8 py-6 text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] text-right">Amount</th>
                  <th className="px-8 py-6 text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">Method</th>
                  <th className="px-8 py-6 text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">Status</th>
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
                    <tr key={donation.donation_id} className="hover:bg-stone-50/50 transition-colors group">
                      
                      {/* Date */}
                      <td className="px-8 py-6">
                        <p className="text-xs font-bold text-stone-800 uppercase tracking-widest mb-1">
                           {new Date(donation.transaction_date).toLocaleDateString()}
                        </p>
                        <p className="text-[10px] text-stone-400 uppercase tracking-tighter">
                           {new Date(donation.transaction_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>

                      {/* Transaction ID */}
                      <td className="px-8 py-6">
                        <span className="text-[10px] font-mono font-bold text-stone-400 bg-stone-100 px-2 py-1 rounded">
                          {donation.reference_number}
                        </span>
                      </td>

                      {/* Donor Name & Email */}
                      <td className="px-8 py-6">
                        <p className="text-xs font-bold text-stone-800 uppercase tracking-widest mb-1">{donation.donor_name}</p>
                        <p className="text-[10px] font-bold text-stone-400 tracking-tighter">
                           {donation.contact_email}
                        </p>
                      </td>

                      {/* Amount */}
                      <td className="px-8 py-6 text-sm font-bold text-[#4b5e52] text-right whitespace-nowrap">
                        ₱ {parseFloat(donation.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      {/* Payment Method */}
                      <td className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-stone-500">
                        {getPaymentMethodName(donation.payment_method)}
                      </td>

                      {/* Status Badge */}
                      <td className="px-8 py-6">
                        {donation.status === 2 ? (
                          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-bold bg-[#3a4740]/10 text-[#3a4740] uppercase tracking-widest border border-[#3a4740]/20">
                            <ShieldCheck className="w-3 h-3 mr-2" /> Successful
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-bold bg-[#d4a373]/10 text-[#d4a373] uppercase tracking-widest border border-[#d4a373]/20">
                            <Clock className="w-3 h-3 mr-2" /> Pending
                          </span>
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