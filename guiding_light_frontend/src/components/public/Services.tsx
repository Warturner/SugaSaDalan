/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2,
  ChevronDown,
  X
} from 'lucide-react';
import { SERVICES, PROCESS_FLOW } from '../../data/services';

export default function Services() {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [prevScrollPos, setPrevScrollPos] = React.useState<number>(0);

  const expandedService = React.useMemo(() => {
    return expandedId ? SERVICES.find(s => s.id === expandedId) : null;
  }, [expandedId]);

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      handleClose();
    } else {
      setPrevScrollPos(window.scrollY);
      setExpandedId(id);
      // Give layout a moment to update before scrolling
      setTimeout(() => {
        const container = document.getElementById('services-container');
        container?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  };

  const handleClose = () => {
    setExpandedId(null);
    window.scrollTo({ top: prevScrollPos, behavior: 'smooth' });
  };

  return (
    <section id="services-section" className="py-24 bg-[#f7f5f2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <div className="inline-block px-4 py-1 bg-stone-200 text-stone-600 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6">What We Do</div>
          <h2 className="text-5xl font-serif italic text-stone-800 mb-8">Our Services</h2>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
            We provide a comprehensive range of services designed to support the holistic recovery and empowerment of survivors.
          </p>
        </div>

        <div id="services-container" className="bg-[#4b5e52] rounded-[48px] p-8 md:p-12 lg:p-16 shadow-2xl overflow-hidden relative mb-32">
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 blur-3xl -ml-32 -mb-32 rounded-full"></div>
          
          {/* Expanded Detail View - Always at the top if something is selected */}
          <AnimatePresence mode="wait">
            {expandedService && (
              <motion.div
                key={expandedId}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="relative z-20 mb-12 bg-white rounded-[40px] p-8 md:p-12 shadow-2xl border border-white/20 flex flex-col lg:flex-row gap-12"
              >
                <div className="lg:w-1/2 aspect-video lg:aspect-auto relative rounded-[24px] overflow-hidden shadow-xl">
                  <img 
                    src={expandedService.image} 
                    alt={expandedService.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="lg:w-1/2 space-y-6 flex flex-col justify-center">
                  <div className="flex items-center justify-between">
                    <h3 className="text-3xl lg:text-4xl font-serif italic text-stone-800 leading-tight">
                      {expandedService.title}
                    </h3>
                    <button 
                      onClick={handleClose}
                      className="w-10 h-10 bg-stone-50 text-stone-400 hover:text-stone-800 rounded-full flex items-center justify-center transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="text-stone-600 leading-relaxed text-sm md:text-base whitespace-pre-line max-h-[300px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-stone-200">
                    {expandedService.longDescription}
                  </div>
                  <div className="pt-4">
                    <button
                      onClick={handleClose}
                      className="px-8 py-3 bg-[#4b5e52] text-white rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-[#3a4740] transition-all shadow-lg"
                    >
                      Close Details
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                onClick={() => toggleExpand(service.id)}
                className={`bg-white rounded-[32px] overflow-hidden group shadow-lg flex flex-col cursor-pointer transition-all duration-300 ${
                  expandedId === service.id ? 'ring-4 ring-[#d4c5b3] scale-[1.02]' : 'hover:scale-[1.02]'
                }`}
              >
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={service.image} 
                    alt={service.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                  
                  {/* Expand Icon */}
                  <div className="absolute bottom-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-[#4b5e52] shadow-lg">
                    <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${expandedId === service.id ? 'rotate-180' : ''}`} />
                  </div>
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <h3 className="text-lg font-serif italic text-stone-800 mb-4">{service.title}</h3>
                  <p className="text-sm text-stone-600 leading-relaxed mb-4">
                    {service.description}
                  </p>
                  <div className="mt-auto pt-4 border-t border-stone-50 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-stone-400">
                    <span>{expandedId === service.id ? 'Active' : 'Learn More'}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Process Flow Section */}
        <div className="bg-[#3a4740] rounded-[48px] p-8 md:p-20 border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 blur-3xl -mr-48 -mt-48 rounded-full"></div>
          
          <div className="text-center mb-16 relative z-10">
            <h3 className="text-[10px] font-bold text-[#d4c5b3] uppercase tracking-[0.25em] mb-4 opacity-80">The Journey</h3>
            <h2 className="text-4xl font-serif italic text-white">Our Process Flow</h2>
          </div>

          <div className="space-y-8 md:space-y-12 relative z-10">
            {PROCESS_FLOW.map((step, index) => (
              <div key={step.step} className="relative">
                {index !== PROCESS_FLOW.length - 1 && (
                  <div className="absolute left-5 md:left-6 top-16 bottom-[-32px] md:bottom-[-48px] w-0.5 bg-white/10"></div>
                )}
                
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="flex gap-4 md:gap-8 items-start"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-[#d4c5b3] text-[#3a4740] rounded-full flex items-center justify-center font-bold shrink-0 z-10 text-xs shadow-lg">
                    {step.step}
                  </div>
                  
                  <div className="flex-1">
                    <div className="bg-white/5 backdrop-blur-sm p-6 md:p-8 rounded-[24px] md:rounded-[32px] border border-white/10 shadow-sm">
                      <div className="mb-4 md:mb-6">
                        <h4 className="text-lg md:text-xl font-serif italic text-white mb-2">{step.title}</h4>
                        <p className="text-[10px] md:text-xs font-bold text-[#d4c5b3] uppercase tracking-widest opacity-80">{step.objective}</p>
                      </div>
                      
                      <div className="space-y-3">
                        {step.actions.map((action, i) => (
                          <div key={i} className="flex items-start gap-3 md:gap-4 text-xs md:text-sm text-stone-300 leading-relaxed">
                            <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#d4c5b3] shrink-0 mt-1 opacity-60" />
                            {action}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
