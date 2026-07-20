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

const SERVICES = [
  {
    id: 'outreach',
    image: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&q=80&w=800',
    title: 'Outreach Work',
    description: 'Identifying and reaching out to minors in vulnerable situations on the streets.',
    longDescription: 'Once or twice a week, Streetlight conducts night monitoring in the areas where the girls are waiting for customers. We build a trust relationship with them and offer them or help: enrolling them in school again, accompany them to medical check-ups, and referral to residential based institutions.\n\nStreetlight thematizes the risks of their activities with the young sex workers and shows ways to exit prostitution. The individual cases are monitored closely and if a girl is very young or otherwise highly endangered, rescued from the streets in collaboration with the City Social Welfare and Development CSWD and the police for her own safety.'
  },
  {
    id: 'reintegration',
    image: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&q=80&w=800',
    title: 'Re-Integration in the Family',
    description: 'Facilitating the safe return and reconciliation of survivors with their families.',
    longDescription: 'When a girl expresses the wish to exit prostitution, we will search for the best possible individual scenario for her. In general, we assume that a child should grow up in its family or with relatives as much as possible. Through home visits with the minor’s family, we determine if a reintegration is possible and desired by all involved parties.\n\nIf a reintegration is possible, we will clarify what support the child and its family need to improve the situation and problems of the family so that the girl won’t run away again. Furthermore, we will help the child re-enroll in school and, if necessary, provide psychological intervention.\n\nThe aim is to provide the minor with a perspective for a better future away from the streets and poverty – thanks to a good education. If a reintegration in the family is not possible, the girl can be transferred in a fast and unbureaucratic fashion to a facility-based NGO, from where she will be enrolled in school again.'
  },
  {
    id: 'harm-reduction',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800',
    title: 'Harm Reduction Through Awareness & Medical Treatment',
    description: 'Providing immediate medical care and education to reduce risks through awareness.',
    longDescription: 'A lot of the young sex workers don’t consider themselves to be victims, but instead feel flattered that adult men are willing to pay for sexual activity with them. Furthermore, they consider prostitution as a way to earn “fast and easy money”. Before they realize that they are being abused, an attempt to bring them away from the streets makes no sense because they would return there voluntarily.\n\nMost of the girls come from impoverished families, and as a result, they develop a sort of addiction to money as a compensation. Furthermore, most have been so neglected that any form of attention is considered positive, even if it’s the attention of sex customers.'
  },
  {
    id: 'legal',
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800',
    title: 'Assistance in Court Cases',
    description: 'Providing legal support and advocacy for victims seeking justice in the legal system.',
    longDescription: 'According to the law in the Philippines, every minor involved in prostitution is a victim of child trafficking. However, if a girl has a pimp, it is considered as “qualified trafficking” and the girls are encouraged to file charges against their pimps who often force them into prostitution, put them under the influence of drugs, and abuse them themselves sexually.\n\nAlso, in case of rape through a customer, the girl is accompanied through the whole process which includes statements to the police, medical examinations to get the medical legal document required from the court, as well as appointments at the prosecutor`s office and the court hearings.\n\nIf safety of a child is at risk due to the filing charges, she is referred to the Witness Protection Program. Otherwise, the girl is sheltered at a residential based institution until the court proceedings are completed.'
  },
  {
    id: 'education',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800',
    title: 'Education',
    description: 'Ensuring access to formal schooling and alternative learning systems for a better future.',
    longDescription: 'Most of the girls Streetlight look for, dropped out of school and spend most of their time on the streets. Enrolling them in a regular school in this situation, makes little sense. Nevertheless, they are encouraged to resume education. If a girl decides to finish school, Streetlight normally enrolls them in a Night School Program which corresponds more to their rhythm then a regular school.\n\nWe work closely together with the teachers and responsible of the school to avoid another dropping out of school as much as possible. Streetlight also provides for their school supplies and allowance. Minors who are reintegrated in their families are also supported regarding their education.'
  },
  {
    id: 'aftercare',
    image: 'https://images.unsplash.com/photo-1521791136064-7986c2959213?auto=format&fit=crop&q=80&w=800',
    title: 'Aftercare',
    description: 'Providing long-term monitoring and support to ensure sustained recovery and well-being.',
    longDescription: 'Girls who can be reintegrated in their families are visited regularly. Through one-on-one conversations with all parties involved, including possible school visits, the well-being of the child is ensured.\n\nIf there are any problems, the social worker will discuss them with the child and her family to search for solutions together. If the problems are insurmountable and the safety of the child can’t be ensured, an immediate transfer to a facility-based institution will be organized.\n\nIf everything goes smoothly, the frequency of home visits will decrease until they can finally be stopped. However, the girl can always contact Streetlight in case she needs support again.'
  }
];

const PROCESS_FLOW = [
  {
    step: 1,
    title: 'Initial Identification & Outreach',
    objective: 'Identify and reach out to minors involved in prostitution and trafficking',
    actions: [
      'Partner with Barangays, City Social Welfare and Development Office (CSWDO), Cagayan de Oro City Police Office (COCPO), and other organizations for referrals.',
      'Conduct street-level outreach to minors engaged in prostitution.'
    ]
  },
  {
    step: 2,
    title: 'Assessment & Immediate Intervention',
    objective: 'Assess the immediate needs of the minor.',
    actions: [
      'Interview the minor to understand their situation (safety concerns, health, emotional state).',
      'Coordinate with partner agencies for urgent support (temporary shelter, and medical attention).',
      'Refer to Cagayan de Oro City Police Office (COCPO) or City Social Welfare and Development Office (CSWDO) if legal intervention or protective custody is needed.'
    ]
  },
  {
    step: 3,
    title: 'Referral to Shelter or Support Services',
    objective: 'Provide a safe and supportive environment for the minor.',
    actions: [
      'Refer the minor to appropriate partner shelters or organizations for temporary or long-term shelter.',
      'Coordinate with the City Social Welfare and Development Office (CSWDO) for case management and follow-up'
    ]
  },
  {
    step: 4,
    title: 'Comprehensive Case Management',
    objective: 'Develop a personalized support plan.',
    actions: [
      'Collaborate with partner agencies to design intervention programs tailored to the minor’s needs',
      'Monitor progress through regular follow-ups with the minor and partner organizations.'
    ]
  },
  {
    step: 5,
    title: 'Rehabilitation & Empowerment',
    objective: 'Help the minor rebuild their life and reintegrate into society.',
    actions: [
      'Facilitate access to education, vocational training, or skills development programs.',
      'Provide counseling services (via partners) to address trauma and build self-esteem.',
      'Work with partner agencies to find employment opportunities or further education.'
    ]
  },
  {
    step: 6,
    title: 'Long-Term Support & Advocacy',
    objective: 'Ensure sustainable support and raise awareness about the issue.',
    actions: [
      'Maintain regular contact with rehabilitated minors to ensure their well-being.',
      'Advocate for stronger policies and support systems for trafficked and prostituted minors.',
      'Conduct community awareness campaigns in collaboration with partners.'
    ]
  }
];

export default function Services() {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [prevScrollPos, setPrevScrollPos] = React.useState<number>(0);

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
            {expandedId && (
              <motion.div
                key={expandedId}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="relative z-20 mb-12 bg-white rounded-[40px] p-8 md:p-12 shadow-2xl border border-white/20 flex flex-col lg:flex-row gap-12"
              >
                <div className="lg:w-1/2 aspect-video lg:aspect-auto relative rounded-[24px] overflow-hidden shadow-xl">
                  <img 
                    src={SERVICES.find(s => s.id === expandedId)?.image} 
                    alt={SERVICES.find(s => s.id === expandedId)?.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="lg:w-1/2 space-y-6 flex flex-col justify-center">
                  <div className="flex items-center justify-between">
                    <h3 className="text-3xl lg:text-4xl font-serif italic text-stone-800 leading-tight">
                      {SERVICES.find(s => s.id === expandedId)?.title}
                    </h3>
                    <button 
                      onClick={handleClose}
                      className="w-10 h-10 bg-stone-50 text-stone-400 hover:text-stone-800 rounded-full flex items-center justify-center transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="text-stone-600 leading-relaxed text-sm md:text-base whitespace-pre-line max-h-[300px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-stone-200">
                    {SERVICES.find(s => s.id === expandedId)?.longDescription}
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
            <h3 className="text-[10px] font-bold text-[#d4c5b3] uppercase tracking-[0.25em] mb-4 opacity-80">The Journey to Recovery</h3>
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
