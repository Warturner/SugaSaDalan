/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ServiceCategory, PaymentMethod } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, Wallet, Landmark, CheckCircle2, AlertCircle } from 'lucide-react';

const CATEGORIES: ServiceCategory[] = [
  'Trauma Counseling',
  'Educational Support',
  'Emergency Relief',
  'Community Outreach',
  'Legal Assistance'
];

const METHODS: { id: PaymentMethod, label: string, icon: any }[] = [
  { id: 'E-wallet', label: 'E-wallet', icon: Wallet },
  { id: 'Bank Card', label: 'Bank Card', icon: CreditCard },
  { id: 'Manual Bank Transfer', label: 'Manual Bank', icon: Landmark },
];

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const ALLOCATION_DATA = [
  { name: 'Trauma Counseling', value: 30, color: '#f2ede4' },
  { name: 'Educational Support', value: 25, color: '#4b5e52' },
  { name: 'Emergency Relief', value: 20, color: '#d4c5b3' },
  { name: 'Community Outreach', value: 15, color: '#8c9a8e' },
  { name: 'Legal Assistance', value: 10, color: '#c4b5a3' },
];

export default function DonationForm() {
  const [amount, setAmount] = React.useState<string>('');
  const [method, setMethod] = React.useState<PaymentMethod>('E-wallet');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;
    
    setIsSubmitting(true);
    setError(null);

    const donationData = {
      amount: parseFloat(amount),
      payment_method: method,
      // In a real app, you'd get donor info from a form or user session
      donor_name: 'Anonymous Donor', 
      donor_email: 'anonymous@example.com'
    };

    try {
      const response = await fetch('/guiding_light_backend/process_donation.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(donationData),
      });

      const result = await response.json();

      if (result.success) {
        setIsSuccess(true);
      } else {
        setError(result.error || 'An unknown error occurred during donation processing.');
      }
    } catch (err) {
      setError('Failed to connect to the server. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-16 rounded-[48px] shadow-sm border border-stone-100 text-center max-w-2xl mx-auto my-20"
      >
        <div className="w-24 h-24 bg-stone-100 text-[#3a4740] rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h2 className="text-4xl font-serif italic text-stone-800 mb-6">Salamat kaayo!</h2>
<p className="text-stone-600 mb-10 leading-relaxed">
          Your donation of <span className="font-bold text-stone-800">PHP {parseFloat(amount).toLocaleString()}</span> has been received and is pending verification. 
          Thank you for your generous support in helping us empower the unheard!
        </p>
        <button 
          onClick={() => {
            setIsSuccess(false);
            setAmount('');
            setError(null);
          }}
          className="bg-[#4b5e52] text-white px-12 py-4 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#3a4740] transition-all shadow-lg"
        >
          Make Another Donation
        </button>
      </motion.div>
    );
  }

  return (
    <section className="py-24 bg-[#f7f5f2] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1 bg-stone-200 text-stone-600 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6">Your Impact</div>
          <h2 className="text-5xl font-serif italic text-stone-800 mb-4">Support Our Cause</h2>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">See how your contributions are distributed and make a direct impact today.</p>
        </div>

        {/* Transparency Pie Chart Box */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-[#3a4740] rounded-[48px] p-8 md:p-12 mb-12 shadow-xl border border-white/10 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl -mr-32 -mt-32 rounded-full"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
            <div>
              <h3 className="text-3xl font-serif italic text-[#d4c5b3] mb-6">Fund Allocation Transparency</h3>
              <p className="text-stone-300 mb-8 leading-relaxed">
                We believe in radical transparency. Every peso you donate is carefully allocated to ensure the highest impact for our survivors. This chart shows our planned distribution for the current fiscal year.
              </p>
              <div className="space-y-4">
                {ALLOCATION_DATA.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: item.color }}></div>
                      <span className="text-xs font-bold text-white uppercase tracking-widest">{item.name}</span>
                    </div>
                    <span className="text-xs font-bold text-[#d4c5b3]">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="h-[300px] md:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ALLOCATION_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {ALLOCATION_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#3a4740', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '16px',
                      color: '#fff'
                    }}
                    itemStyle={{ color: '#d4c5b3' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="lg:sticky lg:top-32">
            <h3 className="text-3xl font-serif italic text-stone-800 mb-8 leading-tight">Your Light Helps Others Find Their Way</h3>
            <p className="text-lg text-stone-600 mb-10 leading-relaxed font-medium">
              Every peso donated to Streetlight goes directly into trauma counseling, education, and community support for those who need it most.
            </p>
            
            <div className="bg-white p-8 rounded-[32px] border border-stone-100 shadow-sm">
              <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-6">How we use your funds</h4>
              <ul className="space-y-4">
                {CATEGORIES.map((cat) => (
                  <li key={cat} className="flex items-center text-stone-700 font-bold text-[11px] uppercase tracking-widest">
                    <div className="w-6 h-6 bg-stone-50 text-[#4b5e52] rounded-full flex items-center justify-center mr-4 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    {cat}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white p-12 rounded-[48px] shadow-sm border border-stone-100"
          >
            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Amount */}
              <AnimatePresence>
                {method !== 'Manual Bank Transfer' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4">Amount (PHP)</label>
                    <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-300 font-serif italic text-2xl">₱</span>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        required
                        className="w-full pl-14 pr-6 py-6 bg-stone-50 border-none rounded-[24px] focus:ring-2 focus:ring-[#d4c5b3] font-mono text-2xl"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4">Payment Method</label>
                <div className="grid grid-cols-3 gap-3 bg-stone-50 p-2 rounded-[24px]">
                  {METHODS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMethod(m.id)}
                      className={`py-4 px-2 rounded-[18px] flex flex-col items-center justify-center transition-all gap-2 ${
                        method === m.id 
                          ? 'bg-white shadow-md text-[#3a4740]' 
                          : 'text-stone-400 hover:text-stone-600'
                      }`}
                    >
                      <m.icon className="w-5 h-5" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Manual Bank Transfer Details */}
              <AnimatePresence>
                {method === 'Manual Bank Transfer' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-stone-50 p-6 rounded-[24px] border border-stone-200 mt-4 space-y-4">
                      <p className="text-[10px] font-bold text-[#4b5e52] uppercase tracking-widest mb-2">Bank Transfer Details</p>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-stone-100">
                          <div>
                            <p className="text-[9px] text-stone-400 uppercase tracking-tighter">Bank Name</p>
                            <p className="text-sm font-bold text-stone-800">Bank of the Philippine Islands (BPI)</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-stone-100">
                          <div>
                            <p className="text-[9px] text-stone-400 uppercase tracking-tighter">Account Name</p>
                            <p className="text-sm font-bold text-stone-800">Streetlight: Suga sa Dalan Org Inc.</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-stone-100">
                          <div>
                            <p className="text-[9px] text-stone-400 uppercase tracking-tighter">Account Number</p>
                            <p className="text-sm font-mono font-bold text-stone-800">1234 5678 90</p>
                          </div>
                        </div>
                      </div>
                      <p className="text-[9px] text-stone-400 italic">Please send a screenshot of your transaction to finance@streetlight.org for verification.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {method !== 'Manual Bank Transfer' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#4b5e52] text-white py-6 rounded-[24px] font-bold text-xs uppercase tracking-[0.2em] hover:bg-[#3a4740] transition-all flex items-center justify-center relative overflow-hidden group shadow-xl shadow-stone-100"
                    >
                      {isSubmitting ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <span>Submit via PayMongo</span>
                      )}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <div className="text-center text-red-500 text-sm font-bold pt-4">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-center space-x-4 text-stone-400">
                <div className="h-px bg-stone-100 flex-1"></div>
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] shrink-0">PayMongo Secured Transaction</span>
                <div className="h-px bg-stone-100 flex-1"></div>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
