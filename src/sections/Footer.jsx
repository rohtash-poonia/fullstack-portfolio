import React from 'react';
import { FaGithub, FaLinkedin, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  return (
    <>
      <style>
        {`
          .footer-section {
            width: 100%;
            padding: 20px 0 10px 0; /* Padding kam ki hai taaki screen mein fit ho */
            color: white;
            font-family: 'Segoe UI', sans-serif;
            position: relative;
            z-index: 50; /* Z-index bada diya */
            background: transparent; 
          }

          .footer-content {
            max-width: 1100px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px; /* Gap kam kiya hai */
          }

          .footer-logo {
            font-size: 1.4rem;
            font-weight: 800;
            background: linear-gradient(to right, #38bdf8, #ffffff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            letter-spacing: 2px;
          }

          .footer-socials {
            display: flex;
            gap: 15px;
          }

          .social-link {
            width: 38px;
            height: 38px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            justify-content: center;
            align-items: center;
            color: #94a3b8;
            font-size: 1.1rem;
            transition: all 0.3s ease;
            text-decoration: none;
          }

          .social-link:hover {
            transform: translateY(-3px);
            color: #38bdf8;
            border-color: #38bdf8;
          }

          .footer-quote {
            font-style: italic;
            color: #64748b;
            font-size: 0.9rem;
            text-align: center;
            max-width: 90%;
            margin: 5px 0;
          }

          .footer-quote::before, .footer-quote::after {
            content: '"';
            color: #38bdf8;
            font-weight: bold;
          }

          .copyright {
            font-size: 0.75rem;
            color: #475569;
            text-align: center;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            padding-top: 10px;
            width: 80%;
          }
        `}
      </style>

      <footer className="footer-section">
        <div className="footer-content">
          <div className="footer-logo">ROHTASH POONIA</div>
          
          <div className="footer-socials">
            <a href="https://github.com/rohtash-poonia" target="_blank" rel="noreferrer" className="social-link"><FaGithub /></a>
            <a href="https://www.linkedin.com/in/rohtash-poonia2274/" target="_blank" rel="noreferrer" className="social-link"><FaLinkedin /></a>
            <a href="https://www.instagram.com/rohtash_poonia_/" target="_blank" rel="noreferrer" className="social-link"><FaInstagram /></a>
          </div>

          <div className="copyright">
            <p>© {new Date().getFullYear()} Designed & Built by Rohtash poonia. ✨</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;