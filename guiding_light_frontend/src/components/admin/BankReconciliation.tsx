/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Upload, FileText, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function BankReconciliation() {
  const [file, setFile] = React.useState<File | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isDone, setIsDone] = React.useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleProcess = () => {
    if (!file) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsDone(true);
    }, 3000);
  };

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-3xl font-serif italic text-stone-800">Bank Reconciliation</h2>
        <p className="text-stone-400 text-sm">Automate verification by uploading PayMongo CSV statements.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-8">
          <div className="bg-white p-12 rounded-[40px] border-2 border-dashed border-stone-200 flex flex-col items-center justify-center text-center group hover:border-[#d4c5b3] transition-colors relative overflow-hidden">
            <div className="w-20 h-20 bg-stone-50 text-stone-400 rounded-[24px] flex items-center justify-center mb-8 group-hover:scale-110 group-hover:text-[#3a4740] transition-all">
              <Upload className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-serif italic text-stone-800 mb-2">Upload PayMongo Statement</h3>
            <p className="text-sm text-stone-500 mb-10 max-w-xs leading-relaxed">Drag and drop your CSV file here or click to browse files from your computer.</p>
            
            <label className="bg-stone-800 text-white px-10 py-4 rounded-full font-bold text-xs uppercase tracking-[0.2em] hover:bg-stone-900 transition-all cursor-pointer shadow-lg shadow-stone-100">
              Choose CSV File
              <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
            </label>
            
            <AnimatePresence>
              {file && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-10 flex items-center p-6 bg-[#ede9e3] rounded-[24px] w-full border border-stone-200 shadow-sm"
                >
                  <FileText className="w-10 h-10 text-[#3a4740] mr-5" />
                  <div className="text-left flex-1">
                    <p className="text-sm font-bold text-stone-800 uppercase tracking-widest">{file.name}</p>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                  <button 
                    onClick={handleProcess}
                    disabled={isProcessing}
                    className="bg-[#4b5e52] text-white px-8 py-3 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-[#3a4740] transition-all disabled:bg-stone-200 ml-4"
                  >
                    {isProcessing ? 'Processing...' : 'Reconcile'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="bg-[#3a4740] rounded-[40px] p-10 text-white relative overflow-hidden shadow-xl">
            <div className="relative z-10">
              <h4 className="text-2xl font-serif italic mb-8 text-[#d4c5b3]">How it works</h4>
              <ul className="space-y-6">
                {[
                  'Download your daily statement from PayMongo dashboard.',
                  'Upload the CSV file here to cross-reference transactions.',
                  'System automatically matches IDs and verifies amounts.',
                  'Unmatched transactions are flagged for manual review.'
                ].map((step, i) => (
                  <li key={i} className="flex items-start text-xs font-medium text-stone-300 leading-relaxed">
                    <span className="w-6 h-6 bg-white/10 border border-white/10 rounded-full flex items-center justify-center text-[10px] font-bold mr-4 shrink-0 text-[#d4c5b3]">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#d4c5b3]/10 blur-3xl -mr-24 -mt-24 rounded-full"></div>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[40px] border border-stone-100 shadow-sm">
          <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-10">Reconciliation Log</h3>
          
          <AnimatePresence mode="wait">
            {isDone ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                <div className="p-8 bg-[#ede9e3] rounded-[32px] border border-stone-200 flex items-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mr-6 shadow-sm">
                    <CheckCircle2 className="w-8 h-8 text-[#3a4740]" />
                  </div>
                  <div>
                    <h4 className="font-serif italic text-2xl text-stone-800">Process Complete</h4>
                    <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mt-1">12 transactions verified, 0 errors.</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {[
                    { id: 'TXN-942', amount: 5000, status: 'Matched' },
                    { id: 'TXN-943', amount: 2500, status: 'Matched' },
                    { id: 'TXN-944', amount: 10000, status: 'Matched' },
                  ].map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-6 bg-stone-50 rounded-[24px] border border-stone-100 group hover:bg-white hover:shadow-md transition-all">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mr-5 shadow-sm group-hover:scale-110 transition-transform">
                          <span className="text-[10px] font-bold text-stone-400">ID</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-stone-800 tracking-tighter">{log.id}</span>
                      </div>
                      <div className="flex items-center space-x-8">
                        <span className="text-sm font-bold text-stone-800 font-serif italic text-lg">₱ {log.amount.toLocaleString()}</span>
                        <span className="text-[9px] font-bold text-[#3a4740] uppercase tracking-widest px-3 py-1 bg-[#3a4740]/10 rounded-full">Matched</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button className="w-full py-6 text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] hover:text-stone-900 transition-colors flex items-center justify-center border-t border-stone-50 mt-10">
                  View Full Audit Report <ArrowRight className="w-4 h-4 ml-3" />
                </button>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 text-stone-300">
                <AlertTriangle className="w-16 h-16 mb-6 opacity-20" />
                <p className="text-sm font-bold uppercase tracking-widest">No active session</p>
                <p className="text-[10px] uppercase tracking-[0.2em] mt-3 opacity-60">Upload a statement to begin</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
