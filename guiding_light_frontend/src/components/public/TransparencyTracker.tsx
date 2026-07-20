/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MOCK_DONATIONS, TOP_INDIVIDUAL_DONORS, TOP_ORG_DONORS } from '../../data/mockData';
import { ShieldCheck, Info, Trophy, Building2, User } from 'lucide-react';

export default function TransparencyTracker() {
  const verifiedDonations = MOCK_DONATIONS.filter(d => d.status === 'Verified');

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#3a4740] rounded-[48px] p-8 md:p-16 overflow-hidden relative shadow-2xl">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#d4c5b3]/10 blur-3xl -mr-48 -mt-48 rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 blur-3xl -ml-48 -mb-48 rounded-full"></div>

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-10">
              <div>
                <div className="inline-flex items-center bg-white/10 text-[#d4c5b3] px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-6 border border-white/10">
                  <ShieldCheck className="w-4 h-4 mr-3" />
                  Public Ledger
                </div>
                <h2 className="text-5xl font-serif italic text-white mb-4">Transparency Tracker</h2>
                <p className="text-stone-400 max-w-xl leading-relaxed">
                  Real-time updates of verified donations that power our mission to restore lives.
                </p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-[24px] flex items-center max-w-sm">
                <Info className="w-5 h-5 text-[#d4c5b3] mr-4 shrink-0" />
                <p className="text-[11px] text-stone-300 leading-relaxed font-medium">
                  Data updated every 24 hours upon bank verification. Verified by NGO administration.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Public Ledger Table */}
              <div className="lg:col-span-2">
                <div className="overflow-x-auto rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="px-8 py-6 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Date</th>
                        <th className="px-8 py-6 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Donor Name</th>
                        <th className="px-8 py-6 text-[10px] font-bold text-stone-400 uppercase tracking-widest text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {verifiedDonations.map((donation) => (
                        <tr key={donation.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-8 py-6 text-sm text-stone-300 font-mono">{donation.date}</td>
                          <td className="px-8 py-6 text-sm font-bold text-white">
                            {donation.donorName === 'Anonymous Donor' ? (
                              <span className="italic opacity-40 font-normal">Anonymous Donor</span>
                            ) : (
                              donation.donorName
                            )}
                          </td>
                          <td className="px-8 py-6 text-lg font-serif italic text-[#d4c5b3] text-right">
                            ₱ {donation.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top Donors Section */}
              <div className="space-y-8">
                {/* Individual Top Donors */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-[32px]">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-[#d4c5b3]/10 text-[#d4c5b3] rounded-full flex items-center justify-center mr-4">
                      <User className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-serif italic text-white">Top Individuals</h3>
                  </div>
                  <div className="space-y-6">
                    {TOP_INDIVIDUAL_DONORS.map((donor, idx) => (
                      <div key={donor.name} className="flex items-center justify-between group">
                        <div className="flex items-center">
                          <span className="text-[10px] font-bold text-stone-500 mr-4 w-4">0{idx + 1}</span>
                          <span className="text-sm font-bold text-white group-hover:text-[#d4c5b3] transition-colors">{donor.name}</span>
                        </div>
                        <span className="text-sm font-serif italic text-[#d4c5b3]">₱{donor.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Corporate/LGU Top Donors */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-[32px]">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-[#d4c5b3]/10 text-[#d4c5b3] rounded-full flex items-center justify-center mr-4">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-serif italic text-white">Major Contributors</h3>
                  </div>
                  <div className="space-y-6">
                    {TOP_ORG_DONORS.map((org, idx) => (
                      <div key={org.name} className="flex items-center justify-between group">
                        <div className="flex items-center">
                          <span className="text-[10px] font-bold text-stone-500 mr-4 w-4">0{idx + 1}</span>
                          <span className="text-sm font-bold text-white group-hover:text-[#d4c5b3] transition-colors">{org.name}</span>
                        </div>
                        <span className="text-sm font-serif italic text-[#d4c5b3]">₱{org.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 text-stone-500 text-[10px] font-bold uppercase tracking-[0.2em]">
              <p>© 2024 Streetlight: Suga sa Dalan Organization Inc.</p>
              <div className="flex items-center space-x-8">
                <span className="flex items-center"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-3"></div> System Online</span>
                <span className="flex items-center"><div className="w-1.5 h-1.5 rounded-full bg-[#d4c5b3] mr-3"></div> Secured Access</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
