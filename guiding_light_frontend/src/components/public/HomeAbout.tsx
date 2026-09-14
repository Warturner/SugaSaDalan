import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Heart } from 'lucide-react';
import { PublicPage } from '../../types';

interface HomeAboutProps {
  setActivePage: (page: PublicPage) => void;
}

export default function HomeAbout({ setActivePage }: HomeAboutProps) {
  const whatWeDoItems = [
    "Appreciative and accepting approach to strengthen their self-worth and to build trusting relationships",
    "Damage reduction through education and medical treatment",
    "Clarification of their rights and support in court cases",
    "Reintegration in the family or integration in a facility-based institution",
    "Help with re-entry in school and covering the expenses for their education",
    "Close monitoring of the girls, their families, and schools during the aftercare"
  ];

  return (
    <div className="bg-white">
      {/* About Streetlight */}
      <section id="about-section" className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-block px-4 py-1 bg-stone-100 text-stone-500 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6">About Us</div>
              <h2 className="text-4xl md:text-5xl font-serif italic text-stone-800 mb-8 leading-tight">About Streetlight</h2>
              <div className="space-y-6 text-stone-600 leading-relaxed text-lg">
                <p>
                  Streetlight "Suga sa Dalan" was founded with a
mission to bring light and hope to minors involved in
prostitution and victims trafficking in Cagayan de Oro
City, Philippines. The organization began its journey in
Switzerland on May 1, 2022, founded by Esther
Buehlmann and Kathrin Schelker, two Swiss
nationals with a deep passion for helping vulnerable
children and youth.
                </p>
                <p>
                  Recognizing the urgent need for intervention and
support in the Philippines, Esther expanded the
organization's reach and officially established
Streetlight: Suga sa Dalan in Cagayan de Oro City in
September 2022. Even before its formal founding in
the city, Esther had been actively collaborating with
local partner agencies, the City Social Welfare and
Development Office (CSWDO), Cagayan de Oro City
Police Office (COCPO), Barangays, and other
organizations, laying the groundwork for what would
become a vital support system for the community.
                </p>
                <p>
                  Since its inception, Streetlight: Suga sa Dalan has
been dedicated to rescuing and empowering minors,
providing intervention programs, and ensuring access
to future support services through strong partnerships
with local agencies. The organization continues to
grow, guided by the vision of creating safer
environments and brighter futures for those in need.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-[4/5] rounded-[48px] overflow-hidden shadow-2xl border-[12px] border-stone-50">
                <img 
                  src="https://petapixel.com/assets/uploads/2024/01/The-Star-of-System-Sol-Rectangle-640x800.jpg" 
                  alt="Streetlight Outreach" 
                  className="w-full h-full object-cover"
                />
              </div>

            </motion.div>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-24 bg-stone-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <div className="aspect-[4/3] rounded-[48px] overflow-hidden shadow-2xl border-[12px] border-white">
                <img 
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRj1kvjG1UFrLa01L8ZwBoD3bapZgco4x2oPddy_HqAgQPHLdE0PH3lVCJ1&s=10" 
                  alt="Children at school" 
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <div className="inline-block px-4 py-1 bg-white text-stone-500 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 shadow-sm">Our Impact</div>
              <h2 className="text-4xl md:text-5xl font-serif italic text-stone-800 mb-8 leading-tight">What we do</h2>
              <ul className="space-y-6">
                {whatWeDoItems.map((item, idx) => (
                  <li key={idx} className="flex items-start group">
                    <div className="w-6 h-6 bg-white text-[#4b5e52] rounded-full shadow-sm flex items-center justify-center mr-4 shrink-0 mt-1 group-hover:scale-110 transition-transform">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-stone-600 leading-relaxed font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How You Can Help */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-block px-4 py-1 bg-stone-100 text-stone-500 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6">Partnership</div>
            <h2 className="text-4xl md:text-5xl font-serif italic text-stone-800 mb-8 leading-tight">How You Can Help</h2>
            <div className="space-y-6 text-stone-600 leading-relaxed text-lg mb-12">
              <p>
                With low financial and personnel investments, the project can guide the lives of many young people in a healthier direction: 
                away from the streets and the redlight district, back to a safe environment and to school, and, therefore, to a better future. 
                To be able to offer these girls this opportunity, we are dependent on your donations.
              </p>
              <p>
                Our monthly expenses are limited to the salary of the small team on site, as well as the expenses for the medical treatment 
                and the education of the clients, gasoline, and hygiene products. Your donation fully benefits Streetlight as there 
                are hardly any administrative expenses in Switzerland.
              </p>
            </div>
            
            <button
              onClick={() => {
                setActivePage('Donate');
                window.scrollTo(0, 0);
              }}
              className="inline-flex items-center px-12 py-6 bg-[#4b5e52] text-white rounded-full font-bold text-xs uppercase tracking-[0.2em] hover:bg-[#3a4740] transition-all shadow-xl hover:scale-105 active:scale-95"
            >
              <Heart className="w-4 h-4 mr-3" />
              Donate Now
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
