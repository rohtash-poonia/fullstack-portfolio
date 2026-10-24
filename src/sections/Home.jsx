// Is code ko apne Home.jsx mein rakhein (optimized version)
import React, { useMemo, useEffect, useState, useRef, useSyncExternalStore } from "react";
import Background from "../components/ui/Background";
import { motion } from "framer-motion";
import { FaGithub, FaLinkedin } from "react-icons/fa6";
import Hero from "../components/sections/Hero";
import clickSoundFile from "../assets/audio/multi-pop.mp3";

const desktopQuery = '(min-width: 1024px)';
const getDesktopSnapshot = () => window.matchMedia(desktopQuery).matches;
const getServerSnapshot = () => false;
const subscribeDesktop = (onChange) => {
  const media = window.matchMedia(desktopQuery);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
};

const combinedRole = "Node.js Developer & NestJS Developer";

const socials = [
  { Icon: FaLinkedin, label: "LinkedIn", href: "https://www.linkedin.com/in/rohtash-poonia2274/" },
  { Icon: FaGithub, label: "GitHub", href: "https://github.com/rohtash-poonia" },
];

const glowVariants = {
  initial: { scale: 1, y: 0 },
  hover: { scale: 1.15, y: -3, transition: { type: "spring", stiffness: 260, damping: 18 } },
  tap: { scale: 0.95 },
};

export default function Home() {
  const showRobot = useSyncExternalStore(subscribeDesktop, getDesktopSnapshot, getServerSnapshot);
  const roles = useMemo(() => ["Full Stack Developer", combinedRole, "Software Developer", "React & Next.js Developer", "Web Developer"], []);
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  // Typewriter: Cleanup automatic hota hai on unmount
  useEffect(() => {
    const current = roles[index];
    let pause;
    const timeout = setTimeout(() => {
      if (!deleting && subIndex < current.length) { setSubIndex((v) => v + 1); }
      else if (!deleting && subIndex === current.length) { pause = setTimeout(() => setDeleting(true), 800); }
      else if (deleting && subIndex > 0) { setSubIndex((v) => v - 1); }
      else if (deleting && subIndex === 0) { setDeleting(false); setIndex((p) => (p + 1) % roles.length); }
    }, deleting ? 60 : 90);
    return () => { clearTimeout(timeout); clearTimeout(pause); };
  }, [subIndex, index, deleting, roles]);

  // Audio: Optimized to play only on click
  const audioRef = useRef(null);
  const handleClickSound = () => {
    if (!audioRef.current) {
        audioRef.current = new Audio(clickSoundFile);
    }
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {}); // catch silent error if browser blocks
  };

  return (
    <section id="home" className="relative min-h-screen overflow-hidden" style={{ transform: "translateZ(0)" }}>
      {/* Background component unmounts automatically when page changes */}
      <Background />

      <div className="relative z-10 min-h-svh flex items-center pt-24 pb-28 lg:py-0">
        <div className="w-full max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-12">
          
          <div className="hero-copy w-full lg:flex-1 min-w-0 text-left will-change-[transform,opacity]">
            <motion.div className="grid text-3xl sm:text-4xl font-semibold text-white">
              <span aria-hidden="true" className="hero-role-combined invisible [grid-area:1/1]">
                {roles.reduce((longest, role) => role.length > longest.length ? role : longest, "")}
                <span className="inline-block w-[2px] ml-2 h-[2.5rem] align-middle" />
              </span>
              <span className={`[grid-area:1/1] ${roles[index] === combinedRole ? "hero-role-combined" : ""}`}>
              {roles[index].substring(0, subIndex)}
              <span className="inline-block w-[2px] ml-2 bg-white h-[2.5rem] align-middle animate-blink"></span>
              </span>
            </motion.div>

            <motion.h1 className="mt-4 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="animated-gradient-text">Hello, I'm </span>
              <span className="text-pink-400 hover:text-pink-500 transition-colors duration-300">Rohtash poonia</span>
            </motion.h1>

            <motion.p className="mt-6 text-base sm:text-lg md:text-xl text-gray-300 max-w-xl">
              I turn complex ideas into seamless, high-impact web experiences.
            </motion.p>

            <div className="mt-10 flex flex-wrap items-center gap-6">
              <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" onClick={handleClickSound} className="px-8 py-3 rounded-full text-lg font-semibold text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:scale-105 transition-all">
                My Resume
              </a>
              <div className="flex gap-5 text-2xl md:text-3xl">
                {socials.map(({ Icon, label, href }) => (
                  <motion.a key={label} aria-label={label} href={href} target="_blank" rel="noopener noreferrer" onClick={handleClickSound} variants={glowVariants} initial="initial" whileHover="hover" className="text-gray-300 hover:text-white">
                    <Icon />
                  </motion.a>
                ))}
              </div>
            </div>
          </div>

          {showRobot && (
            <div className="w-full flex-1 min-w-0 flex justify-end will-change-transform">
              <Hero />
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes blink { 0%,100% { opacity: 1 } 50% { opacity: 0 } }
        .animate-blink { animation: blink 1s infinite; }
      `}</style>
    </section>
  );
}