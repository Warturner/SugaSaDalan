/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ServiceCategory, PaymentMethod } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, Wallet, Smartphone, CheckCircle2, AlertCircle } from 'lucide-react';

const CATEGORIES: ServiceCategory[] = [
  'Trauma Counseling',
  'Educational Support',
  'Emergency Relief',
  'Community Outreach',
  'Legal Assistance'
];

const METHODS: { id: PaymentMethod, label: string, icon: any }[] = [
  { id: 'GCash', label: 'GCash', icon: Smartphone },
  { id: 'Maya', label: 'Maya', icon: Wallet },
  { id: 'Bank Card', label: 'Bank Card', icon: CreditCard },
];

export default function DonationForm() {
  const [amount, setAmount] = React.useState<string>('');
  const [category, setCategory] = React.useState<ServiceCategory>(CATEGORIES[0]);
  const [method, setMethod] = React.useState<PaymentMethod>('GCash');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;
    
    setIsSubmitting(true);
    // Mock API call to PayMongo
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 2000);
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
          It will appear in our transparency tracker within 24 hours.
        </p>
        <button 
          onClick={() => setIsSuccess(false)}
          className="bg-[#4b5e52] text-white px-12 py-4 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#3a4740] transition-all shadow-lg"
        >
          Make Another Donation
        </button>
      </motion.div>
    );
  }

  return (
    <section className="py-32 bg-[#f7f5f2] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
        <div>
          <div className="inline-block px-4 py-1 bg-stone-200 text-stone-600 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6">Contribute</div>
          <h2 className="text-5xl font-serif italic text-stone-800 mb-8 leading-tight">Your Light Helps Others Find Their Way</h2>
          <p className="text-lg text-stone-600 mb-10 leading-relaxed font-medium">
            Every peso donated to Streetlight goes directly into trauma counseling, education, and community support for those who need it most.
          </p>
          
          <ul className="space-y-6">
            {CATEGORIES.map((cat) => (
              <li key={cat} className="flex items-center text-stone-700 font-bold text-sm uppercase tracking-widest">
                <div className="w-8 h-8 bg-white text-[#4b5e52] rounded-full shadow-sm flex items-center justify-center mr-5 shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                {cat}
              </li>
            ))}
          </ul>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-12 rounded-[48px] shadow-sm border border-stone-100"
        >
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Amount */}
            <div>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Category */}
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4">Service Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                  className="w-full px-6 py-5 bg-stone-50 border-none rounded-[20px] focus:ring-2 focus:ring-[#d4c5b3] font-bold text-xs uppercase tracking-widest appearance-none cursor-pointer"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4">Method</label>
                <div className="flex bg-stone-50 p-1 rounded-[20px]">
                  {METHODS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMethod(m.id)}
                      className={`flex-1 py-4 px-2 rounded-[16px] flex items-center justify-center transition-all ${
                        method === m.id 
                          ? 'bg-white shadow-sm text-[#3a4740]' 
                          : 'text-stone-400 hover:text-stone-600'
                      }`}
                    >
                      <m.icon className="w-5 h-5" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

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

            <div className="flex items-center justify-center space-x-4 text-stone-400">
              <div className="h-px bg-stone-100 flex-1"></div>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] shrink-0">PayMongo Secured</span>
              <div className="h-px bg-stone-100 flex-1"></div>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
