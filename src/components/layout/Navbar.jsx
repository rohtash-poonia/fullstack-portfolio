import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import Menu from "./Menu";
import SV from "../../assets/images/SV.png";
import { FiMenu } from "react-icons/fi";

export default function Navbar() {
  const [menuopen, setMenuopen] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const clickAudio = useRef(null);
  const musicAudio = useRef(null);
  const musicPending = useRef(false);
  const closeMenu = useCallback(() => setMenuopen(false), []);

  useEffect(() => () => { musicAudio.current?.pause(); clickAudio.current?.pause(); }, []);
  const handleMenuClick = async () => {
    setMenuopen(true);
    try {
      if (!clickAudio.current) {
        const { default: file } = await import('../../assets/audio/key5.wav');
        clickAudio.current = new Audio(file);
      }
      clickAudio.current.currentTime = 0;
      await clickAudio.current.play();
    } catch { /* Navigation does not depend on sound. */ }
  };
  const handleMusicToggle = async () => {
    if (musicPending.current) return;
    musicPending.current = true;
    try {
      if (!musicAudio.current) {
        const { default: file } = await import('../../assets/audio/song.mp3');
        musicAudio.current = new Audio(file);
        musicAudio.current.loop = true;
      }
      if (musicAudio.current.paused) {
        await musicAudio.current.play();
        setIsMusicPlaying(true);
      } else {
        musicAudio.current.pause();
        setIsMusicPlaying(false);
      }
    } catch { setIsMusicPlaying(false); }
    finally { musicPending.current = false; }
  };

  return <>
    <nav className="fixed top-0 left-0 w-full flex items-center justify-between px-6 py-4 z-50 transition-transform duration-300 pointer-events-none">
      <Link to="/" aria-label="Home" className="flex items-center space-x-0 -translate-y-7 -translate-x-5 pointer-events-auto">
        <img src={SV} alt="Logo" className="w-20 h-20 object-contain" />
        <span className="text-2xl font-bold text-white">.PORTFOLIO</span>
      </Link>
      <div className="flex items-center gap-3 sm:gap-4 shrink-0 -translate-y-6 pointer-events-auto">
        <button type="button" onClick={handleMusicToggle} className="hidden lg:block bg-gradient-to-r from-pink-500 to-blue-500 text-white px-5 py-2 rounded-full font-medium shadow-lg hover:opacity-90 transition-opacity duration-300">
          {isMusicPlaying ? "Stop Music" : "Play Music"}
        </button>
        <button type="button" aria-label="Open Pages" title="Open Pages" aria-expanded={menuopen} onClick={handleMenuClick} className="text-white text-3xl p-2"><FiMenu /></button>
      </div>
    </nav>
    <Menu isOpen={menuopen} onClose={closeMenu} />
  </>;
}
