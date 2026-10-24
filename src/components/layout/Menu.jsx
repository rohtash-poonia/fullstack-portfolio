import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";
import clickSoundFile from "../../assets/audio/mouse-click.mp3"; // ✅ import MP3

import { Link } from "react-router-dom";

export default function Menu({ isOpen, onClose }) {
  const origin = "95% 8%";

  // create Audio object from imported file
  const dialog = useRef(null);
  const clickSound = useRef(null);
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement;
    const escape = event => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); }
    };
    document.addEventListener('keydown', escape);
    const frame = requestAnimationFrame(() => dialog.current?.querySelector('button')?.focus());
    return () => { document.removeEventListener('keydown', escape); cancelAnimationFrame(frame); previous?.focus(); };
  }, [isOpen, onClose]);

  const handleClose = () => {
    if (!clickSound.current) clickSound.current = new Audio(clickSoundFile);
    clickSound.current.currentTime = 0;
    clickSound.current.play().catch(() => {});
    onClose();         // close the menu
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dialog} role="dialog" aria-modal="true" aria-label="Navigation"
          onKeyDown={event => {
            if (event.key === 'Escape') { event.stopPropagation(); handleClose(); }
            if (event.key === 'Tab') {
              const items = [...dialog.current.querySelectorAll('button, a')];
              const first = items[0], last = items.at(-1);
              if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
              else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
            }
          }}
          className="fixed inset-0 flex items-center justify-center z-50 overflow-y-auto"
          initial={{ clipPath: `circle(0% at ${origin})` }}
          animate={{ clipPath: `circle(150% at ${origin})` }}
          exit={{ clipPath: `circle(0% at ${origin})` }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          style={{ backgroundColor: "rgba(0,0,0,0.95)", alignItems: "safe center" }}
        >
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 text-white text-3xl"
            aria-label="Close Menu"
          >
            <FiX />
          </button>

          <ul className="space-y-6 text-center py-2">
            {[
              "Home",
              "About",
              "Skills",
              "Projects",
              "Experience",
              "Testimonials",
              "Contact",
            ].map((item, index) => (
              <motion.li
                key={item}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Link
                  to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                  onClick={handleClose} // also plays sound
                  className="text-4xl text-white font-semibold hover:text-pink-400 transition-colors duration-300"
                >
                  {item}
                </Link>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
}