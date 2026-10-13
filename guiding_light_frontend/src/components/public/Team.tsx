/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, {
  useState,
  useEffect
} from 'react';

import {
  motion
} from 'motion/react';

import {
  Mail,
  User,
  Loader
} from 'lucide-react';

import {
  useTheme
} from '../../context/ThemeContext';


interface TeamMember {
  id: number;
  name: string;
  role: string;
  email: string;
  image_url?: string;
  display_order?: number;
}


export default function Team() {

  const {
    isDarkMode
  } = useTheme();

  const [
    members,
    setMembers
  ] = useState<TeamMember[]>([]);

  const [
    isLoading,
    setIsLoading
  ] = useState(true);


  useEffect(() => {

    const fetchTeam = async () => {

      try {

        const response =
          await fetch(
            '/guiding_light_backend/get_team.php'
          );

        const data =
          await response.json();

        if (!data.error) {

          setMembers(data);

        }

      } catch (error) {

        console.error(
          'Failed to fetch team:',
          error
        );

      } finally {

        setIsLoading(false);

      }

    };

    fetchTeam();

  }, []);


  const groupedMembers =
    members.reduce((
      acc,
      member
    ) => {

      const row =
        member.display_order || 1;

      if (!acc[row]) {

        acc[row] = [];

      }

      acc[row].push(member);

      return acc;

    }, {} as Record<
      number,
      TeamMember[]
    >);


  const sortedRows =
    Object.keys(
      groupedMembers
    )
      .map(Number)
      .sort((
        a,
        b
      ) => a - b);


  return (

    <div
      className={`min-h-screen pt-32 pb-32 px-4 transition-colors duration-300 ${
        isDarkMode
          ? 'bg-[#242c28]'
          : 'bg-[#f7f5f2]'
      }`}
    >

      <div className="max-w-7xl mx-auto">


        {/* HEADER */}
        <div className="text-center mb-24">

          <motion.div
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            className={`inline-block px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 ${
              isDarkMode
                ? 'bg-white/10 text-[#d4c5b3]'
                : 'bg-stone-200 text-stone-600'
            }`}
          >
            Our People
          </motion.div>


          <motion.h1
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              delay: 0.1
            }}
            className={`text-4xl md:text-5xl font-serif italic mb-6 transition-colors ${
              isDarkMode
                ? 'text-[#f7f5f2]'
                : 'text-stone-800'
            }`}
          >
            Meet the team
          </motion.h1>


          <motion.p
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              delay: 0.2
            }}
            className={`max-w-2xl mx-auto text-sm leading-relaxed transition-colors ${
              isDarkMode
                ? 'text-stone-300'
                : 'text-stone-500'
            }`}
          >
            A dedicated group of social workers, medical professionals, and volunteers united by a single mission: guiding the youth towards a brighter future.
          </motion.p>

        </div>


        {/* CONTENT */}
        {isLoading ? (

          <div className="flex justify-center py-20">

            <Loader
              className={`w-8 h-8 animate-spin ${
                isDarkMode
                  ? 'text-[#d4c5b3]'
                  : 'text-[#4b5e52]'
              }`}
            />

          </div>

        ) : members.length === 0 ? (

          <div
            className={`text-center py-20 ${
              isDarkMode
                ? 'text-stone-500'
                : 'text-stone-400'
            }`}
          >

            <User className="w-12 h-12 mx-auto mb-4 opacity-20" />

            <p>
              No team members listed yet.
            </p>

          </div>

        ) : (

          <div className="flex flex-col gap-16 md:gap-24 items-center">

            {sortedRows.map((
              rowNum,
              rowIndex
            ) => (

              <div
                key={rowNum}
                className="flex flex-wrap justify-center gap-10 md:gap-16 w-full"
              >

                {groupedMembers[
                  rowNum
                ].map((
                  member,
                  memberIndex
                ) => (

                  <motion.div
                    key={member.id}
                    initial={{
                      opacity: 0,
                      y: 20
                    }}
                    whileInView={{
                      opacity: 1,
                      y: 0
                    }}
                    viewport={{
                      once: true
                    }}
                    transition={{
                      delay:
                        (
                          rowIndex *
                          0.1
                        ) +
                        (
                          memberIndex *
                          0.1
                        )
                    }}
                    className="flex flex-col items-center text-center group w-48 md:w-56"
                  >

                    {/* PHOTO */}
                    <div
                      className={`w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden mb-6 shadow-md relative group-hover:-translate-y-2 transition-all duration-300 ring-4 ${
                        isDarkMode
                          ? 'bg-[#303a35] ring-white/10'
                          : 'bg-[#e5e7eb] ring-white'
                      }`}
                    >

                      {member.image_url ? (

                        <img
                          src={
                            member.image_url
                          }
                          alt={
                            member.name
                          }
                          className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500"
                        />

                      ) : (

                        <div
                          className={`w-full h-full flex items-center justify-center ${
                            isDarkMode
                              ? 'text-stone-500'
                              : 'text-stone-400'
                          }`}
                        >

                          <User className="w-12 h-12 md:w-16 md:h-16 opacity-50" />

                        </div>

                      )}

                    </div>


                    {/* NAME */}
                    <h3
                      className={`text-lg font-bold mb-1 leading-tight ${
                        isDarkMode
                          ? 'text-[#f7f5f2]'
                          : 'text-stone-800'
                      }`}
                    >
                      {member.name}
                    </h3>


                    {/* ROLE */}
                    <p
                      className={`text-[10px] md:text-[11px] uppercase tracking-widest font-bold leading-tight mt-1 mb-3 ${
                        isDarkMode
                          ? 'text-[#d4c5b3]'
                          : 'text-stone-500'
                      }`}
                    >
                      {member.role}
                    </p>


                    {/* EMAIL */}
                    {member.email && (

                      <div
                        className={`flex items-center justify-center text-xs mt-auto break-all ${
                          isDarkMode
                            ? 'text-stone-400'
                            : 'text-stone-400'
                        }`}
                      >

                        <Mail className="w-3.5 h-3.5 mr-1.5 shrink-0" />

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