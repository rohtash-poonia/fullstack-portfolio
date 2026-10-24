import { useRef, useState } from "react";
import AstraImg from "../assets/images/optimized/astra-450.webp";
import AstraLarge from "../assets/images/optimized/astra-900.webp";
import Stars from "../components/common/Stars";
import { sendContactForm } from "../utils/mailer";
import Footer from "./Footer";

export default function Contact() {
  const form = useRef(null);
  const inFlight = useRef(false);
  const sound = useRef(null);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");

  const playSound = async () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    try {
      if (!sound.current) {
        const { default: source } = await import("../assets/audio/charge-up.wav");
        sound.current = new Audio(source);
        sound.current.volume = 0.3;
      }
      sound.current.currentTime = 0;
      await sound.current.play();
    } catch { /* Optional sound never affects delivery. */ }
  };

  const sendEmail = async event => {
    event.preventDefault();
    if (inFlight.current) return;
    inFlight.current = true;
    setSending(true);
    setStatus("");
    try {
      await sendContactForm(form.current);
      setStatus("Message sent! Thanks for getting in touch.");
      form.current.reset();
      void playSound();
    } catch (error) {
      setStatus(error.message?.includes("not configured") ? error.message : "Your message could not be sent. Please try again.");
    } finally {
      inFlight.current = false;
      setSending(false);
    }
  };

  return (
    <>
      <style>
        {`
          .contact-wrapper {
            min-height: 100vh;
            width: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: center;
            background: radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%);
            position: relative;
            overflow: hidden;
            font-family: 'Segoe UI', sans-serif;
          }

          .stars-container {
            position: absolute;
            inset: 0;
            pointer-events: none;
            z-index: 0;
          }

          .star {
            position: absolute;
            background: white;
            border-radius: 50%;
            animation: twinkle var(--duration) infinite ease-in-out;
          }

          @keyframes twinkle {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.2); }
          }

          .main-content {
            flex: 1;
            display: flex;
            align-items: center;
            /* Space between image and card */
            justify-content: space-between; 
            max-width: 1400px; /* Width bada di taaki corners tak ja sakein */
            width: 100%;
            z-index: 10;
            padding: 20px 80px; /* Side paddings for safe distance */
            margin-top: 20px;
          }

          .astra-image {
            width: 100%;
            max-width: 450px; /* Image ka size bada kar diya */
            filter: drop-shadow(0 0 30px rgba(56, 189, 248, 0.4));
            animation: float 5s ease-in-out infinite;
            /* Left side shift alignment */
            margin-left: -40px; 
          }

          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(-2deg); }
            50% { transform: translateY(-30px) rotate(2deg); }
          }

          .contact-card {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(15px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 25px;
            padding: 30px;
            width: 100%;
            max-width: 450px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.3);
            /* Extreme right shift alignment */
            margin-right: -20px; 
          }

          .contact-card h2 {
            font-size: 2.2rem;
            margin-bottom: 12px;
            background: linear-gradient(to right, #38bdf8, #fff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-weight: 800;
          }

          .input-style {
            width: 100%;
            padding: 12px;
            margin: 8px 0;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            color: white;
            outline: none;
            box-sizing: border-box;
            font-size: 1rem;
            transition: 0.3s;
          }

          .input-style:focus {
            border-color: #38bdf8;
            background: rgba(255, 255, 255, 0.12);
            box-shadow: 0 0 10px rgba(56, 189, 248, 0.2);
          }

          select.input-style option {
            background: #1B2735;
            color: white;
          }

          .btn-send {
            width: 100%;
            padding: 14px;
            margin-top: 15px;
            background: #38bdf8;
            border: none;
            border-radius: 12px;
            color: #000;
            font-weight: bold;
            cursor: pointer;
            transition: 0.3s;
            text-transform: uppercase;
            letter-spacing: 1px;
          }

          .btn-send:hover { 
            background: #fff; 
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(56, 189, 248, 0.5);
          }

          @media (max-width: 1100px) {
            .astra-image { max-width: 350px; margin-left: 0; }
            .main-content { padding: 20px 40px; }
          }

          @media (max-width: 900px) {
            .main-content { justify-content: center; }
            .astra-image { display: none; }
            .contact-card { margin-right: 0; }
          }
        `}
      </style>
      <section id="contact" tabIndex={-1} aria-labelledby="contact-title" className="contact-wrapper">
        <Stars />
        <div className="main-content">
          <img src={AstraImg} srcSet={AstraImg + " 450w, " + AstraLarge + " 900w"} sizes="(min-width: 1100px) 450px, 350px" width="450" height="450" loading="lazy" decoding="async" alt="Floating astronaut" className="astra-image" />
          <div className="contact-card">
            <h2 id="contact-title">Let's Connect</h2>
            <form ref={form} onSubmit={sendEmail} aria-busy={sending}>
              <label className="sr-only" htmlFor="contact-name">Full Name</label>
              <input id="contact-name" type="text" name="from_name" autoComplete="name" placeholder="Full Name" className="input-style" maxLength={120} required />
              <label className="sr-only" htmlFor="contact-email">Email Address</label>
              <input id="contact-email" type="email" name="from_email" autoComplete="email" placeholder="Email Address" className="input-style" maxLength={254} required />
              <label className="sr-only" htmlFor="contact-service">Service</label>
              <select id="contact-service" name="service" className="input-style" defaultValue="" required>
                <option value="" disabled>Select Service</option>
                <option value="Full Stack Development">Full Stack Development</option>
                <option value="Web Development">Web Development</option>
                <option value="Backend & REST APIs">Backend & REST APIs</option>
                <option value="API Integration">API Integration</option>
                <option value="Other">Other</option>
              </select>
              <label className="sr-only" htmlFor="contact-message">Message</label>
              <textarea id="contact-message" name="message" placeholder="Message..." rows={4} className="input-style" style={{ resize: "vertical" }} maxLength={5000} required />
              <button type="submit" className="btn-send" disabled={sending}>{sending ? "Sending..." : "Send Message"}</button>
              <p role="status" aria-live="polite" className={status ? "mt-3 text-sm text-sky-100" : "sr-only"}>{status}</p>
            </form>
          </div>
        </div>
        <Footer />
      </section>
    </>
  );
}
