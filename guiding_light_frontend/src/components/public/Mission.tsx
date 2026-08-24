/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Target, Compass, Heart, Shield, Award, Users, Zap, Lightbulb } from 'lucide-react';

const VALUES = [
  {
    icon: Heart,
    title: 'Compassion',
    description: 'We respond with empathy, love, and care to every child we encounter, recognizing their inherent worth and dignity.'
  },
  {
    icon: Shield,
    title: 'Integrity',
    description: 'We uphold transparency, honesty, and accountability in all our actions and relationsips with the children, partners, and the public'
  },
  {
    icon: Award,
    title: 'Dignity of the child',
    description: 'Every child has the right to a life free from all forms of sexual exploitation. We advocate for their protection, restoration, and empowerment.'
  },
  {
    icon: Users,
    title: 'Collaboration',
    description: 'We work hand-inhand with communities, government agencies, and partner organizations to ensure holistic and sutainable support for children.'
  },
  {
    icon: Zap,
    title: 'Empowerment',
    description: 'We aim not only to rescue, but to inspire and equip  everychild to dream, grow, and thrive beyond their past.'
  },
  {
    icon: Lightbulb,
    title: 'Faith & Hope',
    description: 'We are grounded in the belief that transformation is possible. We brin light and hope to the darkest places.'
  }
];

export default function Mission() {
  return (
    <section className="py-24 bg-[#f7f5f2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <div className="inline-block px-4 py-1 bg-stone-200 text-stone-600 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6">Who We Are</div>
          <h2 className="text-5xl font-serif italic text-stone-800 mb-8">Our Mission & Vision</h2>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
            Guided by faith and humanity, we strive to create a world where every victim of abuse finds the path to healing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-12 rounded-[48px] shadow-sm border border-stone-100 flex flex-col items-center text-center"
          >
            <div className="w-20 h-20 bg-stone-50 text-[#3a4740] rounded-[24px] flex items-center justify-center mb-8">
              <Target className="w-10 h-10" />
            </div>
            <h3 className="text-3xl font-serif italic text-stone-800 mb-6">Our Mission</h3>
            <p className="text-stone-600 leading-relaxed font-medium">
              To rescue, protect, and empower
minors who are victims of
prostitution, trafficking, and other
sexual exploitation. Through holistic
intervention, rehabilitation, and
reintegration programs, we aim to
restore their lives and potential. By
working alongside communities,
stakeholders, and governments, we
strive to eliminate exploitation and
create a society that nurtures and
safeguards every child.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#3a4740] p-12 rounded-[48px] shadow-xl text-white flex flex-col items-center text-center"
          >
            <div className="w-20 h-20 bg-white/10 text-[#d4c5b3] rounded-[24px] flex items-center justify-center mb-8 border border-white/10">
              <Compass className="w-10 h-10" />
            </div>
            <h3 className="text-3xl font-serif italic text-[#d4c5b3] mb-6">Our Vision</h3>
            <p className="text-stone-300 leading-relaxed font-medium">
              A world where every child thrives in
a safe, supportive environment, free
from exploitation, and where their
dignity, safety, and rights are
cherished and upheld by society.
            </p>
          </motion.div>
        </div>

        <div className="bg-[#3a4740] rounded-[48px] p-12 md:p-20 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl -mr-32 -mt-32 rounded-full"></div>
          
          <div className="relative z-10">
            <div className="text-center mb-16">
              <h3 className="text-[10px] font-bold text-[#d4c5b3] uppercase tracking-[0.25em] mb-4">Foundation of Our Service</h3>
              <h2 className="text-4xl font-serif italic text-white">Our Core Values</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {VALUES.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm p-10 rounded-[32px] border border-white/10 group hover:bg-white transition-all duration-500"
                >
                  <div className="w-12 h-12 bg-white/10 text-[#d4c5b3] rounded-[16px] flex items-center justify-center mb-6 group-hover:bg-[#3a4740] group-hover:scale-110 transition-all">
                    <value.icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-serif italic text-white group-hover:text-stone-800 mb-3 transition-colors">{value.title}</h4>
                  <p className="text-sm text-stone-300 group-hover:text-stone-600 leading-relaxed transition-colors">
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
