import { useEffect, useRef } from "react";

export default function Background() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ------------------ Resize ------------------
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // ------------------ Settings ------------------
    const particleCount = 50;   // reduced for smoothness
    const starCount = 80;
    const connectionDistance = 50;

    let particles = [];
    let stars = [];
    let shootingStars = [];
    let animationId;

    const mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    let warpX = 0;
    let warpY = 0;

    // ------------------ Creators ------------------
    function createStar() {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5,
        opacity: Math.random(),
        fade: Math.random() * 0.02 + 0.005,
      };
    }

    function createParticle(depth) {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * depth,
        speedY: (Math.random() - 0.5) * depth,
        depth,
        pulse: Math.random() * Math.PI * 2,
        trail: [],
      };
    }

    function createShootingStar() {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height / 2,
        length: Math.random() * 80 + 50,
        speed: Math.random() * 6 + 6,
        opacity: 1,
      };
    }

    // ------------------ Init ------------------
    for (let i = 0; i < particleCount; i++) {
      const depth = Math.random() * 0.6 + 0.2;
      particles.push(createParticle(depth));
    }
    for (let i = 0; i < starCount; i++) {
      stars.push(createStar());
    }

    // ------------------ Mouse ------------------
    const handleMouseMove = (e) => {
      const dx = e.clientX - canvas.width / 2;
      const dy = e.clientY - canvas.height / 2;
      warpX = dx * 0.0015;
      warpY = dy * 0.0015;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // ------------------ Connections ------------------
    function connectParticles() {
  for (let a = 0; a < particles.length; a++) {
    for (let b = a + 1; b < particles.length; b++) {
      const dx = particles[a].x - particles[b].x;
      const dy = particles[a].y - particles[b].y;
      const distance = dx*dx + dy*dy; // squared distance

      if (distance < connectionDistance*connectionDistance) {  // check squared
        const opacity = 1 - distance / (connectionDistance*connectionDistance);
        ctx.strokeStyle = `rgba(255,105,180,${opacity * 0.6})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(particles[a].x, particles[a].y);
        ctx.lineTo(particles[b].x, particles[b].y);
        ctx.stroke();
      }
    }
  }
}

    // ------------------ Animation ------------------
    function animate() {
      // Gradient background
      // Solid black background
ctx.fillStyle = "#000000"; // black
ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Stars
      stars.forEach((star) => {
        star.opacity += star.fade;
        if (star.opacity >= 1 || star.opacity <= 0) star.fade *= -1;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,105,180,${star.opacity})`;
        ctx.fill();
      });

      // Particles
      particles.forEach((p) => {
        p.x += p.speedX + warpX * p.depth * 20;
        p.y += p.speedY + warpY * p.depth * 20;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.fill();
      });

      connectParticles();

      // Shooting stars
      if (Math.random() < 0.0015) { // half of previous
  shootingStars.push(createShootingStar());
}

      shootingStars.forEach((star, index) => {
        star.x += star.speed;
        star.y += star.speed * 0.3;
        star.opacity -= 0.02;

        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(star.x - star.length, star.y - star.length * 0.3);
        ctx.strokeStyle = `rgba(255,105,180,${star.opacity})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        if (star.opacity <= 0) shootingStars.splice(index, 1);
      });

      animationId = requestAnimationFrame(animate);
    }

    animate();

    // ------------------ Cleanup ------------------
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none"
    />
  );
}