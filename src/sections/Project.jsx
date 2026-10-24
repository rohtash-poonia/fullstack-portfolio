
import React, { useState, useRef, useEffect, useCallback } from "react";

import icyImage from "../assets/images/i.png";
import img1 from "../assets/images/ko.png";
import img3 from "../assets/images/Screenshot 2026-04-05 124850.png";



const projectsData = [
  {
    id: 1,
    title: "IcyTales",
    description: "A modern ice cream eCommerce website to explore flavors, browse products, and enjoy a smooth, visually engaging shopping experience.",
    image: icyImage,
    tags: ["React", "Next.js", "Tailwind CSS", "JavaScript", "UI/UX", "Responsive Design"],
    liveLink: "https://icylates.vercel.app/",
    githubLink: "https://github.com/rohtash-poonia/Icytales",
    accentColor: "236, 72, 153",
  },
  {
    title: "Task Master",
    description: "A task management app to add, track, and complete tasks through a clean, responsive interface, with tasks saved locally in the browser.",
    id: 2,
    image: img3,
    tags: ["React", "Next.js", "Tailwind CSS", "JavaScript", "Vercel"],
    liveLink: "https://task-master-one-delta.vercel.app/",
    githubLink: "https://github.com/rohtash-poonia/Task-Master",
    accentColor: "139, 92, 246",
  },
  {
    title: "Portfolio Website",
    description: "This responsive developer portfolio brings together project showcases, interactive visuals, and an EmailJS contact form. Built with React and Vite, with assets loaded to suit the device.",
    id: 3,
    image: img1,
    tags: ["React", "JavaScript", "Vite", "Tailwind CSS", "EmailJS", "Spline"],
    liveLink: "https://portfolio-omega-seven-l7y6bvxpew.vercel.app/",
    githubLink: "https://github.com/rohtash-poonia/My_Portfolio",
    accentColor: "255, 62, 150",
  },
];


const Project = ({ entryDirection = 1 }) => {
  const [activeIndex, setActiveIndex] = useState(() => entryDirection < 0 ? projectsData.length - 1 : 0);
  const [fade, setFade] = useState(true);
  const sectionRef = useRef(null);
  const activeRef = useRef(activeIndex);
  const fadeTimer = useRef(null);
  const project = projectsData[activeIndex];
  const accent = `rgb(${project.accentColor})`;

  const goTo = useCallback(newIndex => {
    if (newIndex < 0 || newIndex >= projectsData.length || newIndex === activeRef.current) return false;
    // Update the requested index immediately so a reversal can cancel the pending fade.
    activeRef.current = newIndex;
    clearTimeout(fadeTimer.current);
    setFade(false);
    fadeTimer.current = setTimeout(() => { setActiveIndex(newIndex); setFade(true); }, 250);
    return true;
  }, []);

  useEffect(() => {
    const viewport = sectionRef.current.closest('.section-viewport');
    const onStep = event => {
      if (goTo(activeRef.current + event.detail.direction)) event.preventDefault();
    };
    viewport.addEventListener('portfolio:step', onStep);
    return () => {
      viewport.removeEventListener('portfolio:step', onStep);
      clearTimeout(fadeTimer.current);
    };
  }, [goTo]);

  return (
    <section
      ref={sectionRef}
      id="projects"
      aria-label="Projects"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "60px 5%",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Segoe UI', Tahoma, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `url(${project.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transform: fade ? "scale(1.05)" : "scale(1)",
          transition: "transform 1.2s ease, opacity 0.6s ease",
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(6px)",
          zIndex: 1,
        }}
      />

      <h2
        style={{
          fontSize: "2.5rem",
          fontWeight: 700,
          marginBottom: "50px",
          zIndex: 2,
          color: accent,
          textAlign: "center",
          letterSpacing: "1px",
          transition: "color 0.8s ease",
        }}
      >
        My Projects
      </h2>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "50px",
          maxWidth: "1000px",
          width: "100%",
          zIndex: 2,
          opacity: fade ? 1 : 0,
          transform: fade ? "translateY(0)" : "translateY(30px)",
          transition: "opacity 0.35s ease, transform 0.35s ease",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: "1 1 400px", minWidth: 0 }} aria-live="polite">
          <div
            style={{
              fontSize: "4rem",
              fontWeight: 800,
              color: `rgba(${project.accentColor}, 0.7)`,
              lineHeight: 1,
              marginBottom: "10px",
            }}
          >
            0{project.id}
          </div>

          <h3
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              color: "#fff",
              marginBottom: "15px",
            }}
          >
            {project.title}
          </h3>

          <p
            style={{
              color: "#ccc",
              fontSize: "0.95rem",
              lineHeight: 1.8,
              marginBottom: "25px",
            }}
          >
            {project.description}
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              marginBottom: "28px",
            }}
          >
            {project.tags.map((tag, i) => (
              <span
                key={i}
                style={{
                  padding: "6px 16px",
                  background: `rgba(${project.accentColor}, 0.1)`,
                  color: accent,
                  borderRadius: "8px",
                  fontSize: "0.8rem",
                  border: `1px solid rgba(${project.accentColor}, 0.2)`,
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
            <a
              href={project.liveLink}
              target="_blank"
              rel="noreferrer"
              style={{
                padding: "12px 28px",
                background: accent,
                color: "#000",
                borderRadius: "50px",
                fontSize: "0.9rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Live Demo
            </a>

            <a
              href={project.githubLink}
              target="_blank"
              rel="noreferrer"
              style={{
                padding: "12px 28px",
                background: "transparent",
                color: "#fff",
                border: "2px solid #444",
                borderRadius: "50px",
                fontSize: "0.9rem",
                textDecoration: "none",
              }}
            >
              GitHub
            </a>
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          right: "clamp(12px, 2vw, 30px)",
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          zIndex: 3,
        }}
      >
        {projectsData.map((item, i) => (
          <button
            type="button"
            aria-label={`Show ${item.title}`}
            aria-pressed={i === activeIndex}
            key={i}
            onClick={() => goTo(i)}
            style={{
              width: i === activeIndex ? "14px" : "10px",
              height: i === activeIndex ? "14px" : "10px",
              borderRadius: "50%",
              background: i === activeIndex ? accent : "#333",
              cursor: "pointer",
              transition: "all 0.4s ease",
            }}
          />
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "25px",
          color: "#aaa",
          fontSize: "0.8rem",
          zIndex: 2,
        }}
      >
        Scroll to explore projects
      </div>
    </section>
  );
};

export default Project;
