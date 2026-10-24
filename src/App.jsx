import React, { lazy, Suspense, useState, useEffect } from "react";
import IntroScreen from "./components/sections/Intro";
import Nav from "./components/layout/Navbar";
import Cursor from "./components/common/Cursor";
import FullPageScroll from "./components/ui/FullPageScroll";
import { preloadRobot } from "./components/ui/spline-loader";

// Lazy imports - Same hi rahenge
const loadHome = () => import("./sections/Home");
const Home = lazy(loadHome);
const About = lazy(() => import("./sections/About"));
const Skill = lazy(() => import("./sections/Skill"));
const Project = lazy(() => import("./sections/Project"));
const Experience = lazy(() => import("./sections/Experience"));
const Testimonial = lazy(() => import("./sections/Testimonial"));
const Contact = lazy(() => import("./sections/Contact"));

export default function App() {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const isHome = window.location.hash
      ? window.location.hash === '#home'
      : window.location.pathname === '/';
    if (!isHome) return;

    // Use the intro time to fetch the first screen and the visible desktop robot.
    loadHome().catch(() => {});
    if (window.matchMedia('(min-width: 1024px) and (prefers-reduced-motion: no-preference)').matches) {
      preloadRobot().catch(() => {});
    }
  }, []);
  
  // Mobile check optimization - Isko dynamic rakhte hain taaki mobile load aur kam ho
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1024);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth > 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative text-white bg-black min-h-screen">
      {showIntro && <IntroScreen onFinish={() => setShowIntro(false)} />}

      <div inert={showIntro} aria-hidden={showIntro || undefined} style={{ visibility: showIntro ? "hidden" : "visible" }}>
          {/* Desktop specific components ko condition mein rakha taaki mobile lag na ho */}
          {!showIntro && isDesktop && <Cursor isDesktop={isDesktop} />}
          
          <Nav />

          <Suspense 
            fallback={
              <div className="h-screen flex items-center justify-center bg-[#050505] text-white">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-t-pink-500 border-gray-800 rounded-full animate-spin"></div>
                  <p className="text-sm tracking-widest animate-pulse">SYNCING UNIVERSE...</p>
                </div>
              </div>
            }
          >
            <FullPageScroll enabled={!showIntro}>
              {/* Har section tabhi load hoga jab user wahan pahuchega */}
              <Home />
              <About />
              <Skill />
              <Project />
              <Experience />
              <Testimonial />
              <Contact /> 
            </FullPageScroll>
          </Suspense>
      </div>
    </div>
  );
}