/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mail, User, Loader } from 'lucide-react';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  email: string;
  image_url?: string;
  display_order?: number;
}

export default function Team() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await fetch('http://localhost/GuidingLight_Project/guiding_light_backend/get_team.php');
        const data = await response.json();
        if (!data.error) setMembers(data);
      } catch (err) {
        console.error("Failed to fetch team:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeam();
  }, []);

  // Group the members by their Row assignment (display_order)
  const groupedMembers = members.reduce((acc, member) => {
    const row = member.display_order || 1;
    if (!acc[row]) acc[row] = [];
    acc[row].push(member);
    return acc;
  }, {} as Record<number, TeamMember[]>);

  const sortedRows = Object.keys(groupedMembers).map(Number).sort((a, b) => a - b);

  return (
    <div className="min-h-screen bg-[#f7f5f2] pt-32 pb-32 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1 bg-stone-200 text-stone-600 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4"
          >
            Our People
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-serif italic text-stone-800 mb-6"
          >
            Meet the team
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-stone-500 max-w-2xl mx-auto text-sm leading-relaxed"
          >
            A dedicated group of social workers, medical professionals, and volunteers united by a single mission: guiding the youth towards a brighter future.
          </motion.p>
        </div>

        {/* Dynamic Org Chart Layout */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader className="w-8 h-8 text-[#4b5e52] animate-spin" />
          </div>
        ) : members.length === 0 ? (
          <div className="text-center text-stone-400 py-20">
            <User className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No team members listed yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-16 md:gap-24 items-center">
            {sortedRows.map((rowNum, rowIndex) => (
              <div 
                key={rowNum} 
                className="flex flex-wrap justify-center gap-10 md:gap-16 w-full"
              >
                {groupedMembers[rowNum].map((member, memberIndex) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: (rowIndex * 0.1) + (memberIndex * 0.1) }}
                    className="flex flex-col items-center text-center group w-48 md:w-56"
                  >
                    {/* Circular Image Container (Overlay Removed) */}
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden mb-6 bg-[#e5e7eb] shadow-md relative group-hover:-translate-y-2 transition-transform duration-300">
                      {member.image_url ? (
                        <img 
                          src={member.image_url} 
                          alt={member.name} 
                          className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-400">
                          <User className="w-12 h-12 md:w-16 md:h-16 opacity-50" />
                        </div>
                      )}
                    </div>
                    
                    {/* Text Info */}
                    <h3 className="text-lg font-bold text-stone-800 mb-1 leading-tight">{member.name}</h3>
                    <p className="text-[10px] md:text-[11px] text-stone-500 uppercase tracking-widest font-bold leading-tight mt-1 mb-3">{member.role}</p>
                    
                    {/* Explicitly Displayed Email (Non-Clickable) */}
                    {member.email && (
                      <div className="flex items-center justify-center text-xs text-stone-400 mt-auto">
                        <Mail className="w-3.5 h-3.5 mr-1.5" />
                        {member.email}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}