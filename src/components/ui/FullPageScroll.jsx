import React, { useRef, useEffect, useLayoutEffect, useCallback, useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';

const paths = ['/', '/about', '/skills', '/projects', '/experience', '/testimonials', '/contact'];
const fittedSections = new Set([4]);
const isFittedPanel = element => fittedSections.has(Number(element?.dataset.sectionIndex));
const sectionVariants = {
  enter: direction => ({ y: direction > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { y: '0%', opacity: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  exit: direction => ({ y: direction > 0 ? '-100%' : '100%', opacity: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }),
};

function canScroll(element, direction) {
  return element && !isFittedPanel(element) && element.scrollHeight > element.clientHeight + 1 &&
    (direction > 0 ? element.scrollTop + element.clientHeight < element.scrollHeight - 1 : element.scrollTop > 1);
}

function SectionContent({ children, fromEnd }) {
  const content = useRef(null);
  useLayoutEffect(() => {
    const viewport = content.current.closest('.section-viewport');
    viewport.scrollTop = fromEnd && !isFittedPanel(viewport) ? viewport.scrollHeight : 0;
    // Runs after lazy content commits, so backward navigation begins at its bottom.
  }, [fromEnd]);
  return <div ref={content} style={{ minHeight: '100%' }}>{children}</div>;
}

export default function FullPageScroll({ children, enabled = true }) {
  const sections = React.Children.toArray(children);
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.hash ? (location.hash === '#home' ? '/' : `/${location.hash.slice(1)}`) : location.pathname;
  const activeIndex = Math.max(0, paths.indexOf(path));
  const [transition, setTransition] = useState({ index: activeIndex, direction: 1 });
  if (transition.index !== activeIndex) {
    setTransition({ index: activeIndex, direction: activeIndex > transition.index ? 1 : -1 });
  }
  const direction = transition.direction;
  const fromEnd = location.state?.entry === "end";
  const root = useRef(null);
  const navigationIndex = useRef(activeIndex);
  useLayoutEffect(() => { navigationIndex.current = activeIndex; }, [activeIndex]);
  const gesture = useRef({ direction: 0, time: 0, amount: 0, stepTime: -Infinity, stepDirection: 0, consumed: false, scrolled: false });
  const touch = useRef(null);
  const panel = useCallback(() => root.current?.querySelector(`[data-section-index="${navigationIndex.current}"]`), []);
  const goTo = useCallback((index, { fromScroll = false } = {}) => {
    if (index < 0 || index >= sections.length || index === navigationIndex.current) return false;
    const previousIndex = navigationIndex.current;
    navigationIndex.current = index;
    navigate(paths[index], { state: { entry: fromScroll && index < previousIndex && !fittedSections.has(index) ? "end" : "start" } });
    return true;
  }, [navigate, sections.length]);

  // One coordinator owns page and project navigation, including touch and keys.
  // The delay coalesces momentum in the SAME direction; reversal is immediate.
  const step = useCallback(dir => {
    const now = performance.now();
    const state = gesture.current;
    if (dir === state.stepDirection && now - state.stepTime < 650) return false;
    const event = new CustomEvent('portfolio:step', { detail: { direction: dir }, cancelable: true });
    const allowed = panel()?.dispatchEvent(event) ?? true;
    if (!allowed || goTo(navigationIndex.current + dir, { fromScroll: true })) {
      state.stepDirection = dir;
      state.stepTime = now;
      return true;
    }
    return false;
  }, [goTo, panel]);

  useEffect(() => {
    window.__fullPageGoTo = goTo;
    return () => { delete window.__fullPageGoTo; };
  }, [goTo]);

  useEffect(() => {
    if (!enabled) return;
    const menuOpen = () => document.querySelector('[role="dialog"][aria-modal="true"]');
    const nestedScroller = (target, dir) => {
      if (!panel()?.contains(target)) return false;
      for (let node = target; node && node !== panel(); node = node.parentElement) {
        if (node instanceof HTMLElement && /(auto|scroll)/.test(getComputedStyle(node).overflowY) && canScroll(node, dir)) return true;
      }
      return false;
    };
    const onWheel = event => {
      if (event.defaultPrevented || event.ctrlKey || menuOpen() || Math.abs(event.deltaX) > Math.abs(event.deltaY) || !event.deltaY) return;
      const container = panel();
      const dir = Math.sign(event.deltaY);
      const state = gesture.current;
      const now = performance.now();
      // A wheel gesture includes its momentum tail, even after a new section mounts.
      // A pause or direction reversal starts a new gesture.
      if (state.direction !== dir || event.timeStamp - state.time > 250) {
        state.amount = 0;
        state.consumed = false;
        state.scrolled = false;
      }
      state.direction = dir;
      state.time = event.timeStamp;
      if (state.consumed || (dir === state.stepDirection && now - state.stepTime < 650)) {
        event.preventDefault();
        return;
      }
      if (!container) {
        // Navigation can precede the incoming panel commit. Keep reversal responsive.
        event.preventDefault();
        if (dir !== state.stepDirection) state.consumed = step(dir);
        return;
      }
      if (nestedScroller(event.target, dir)) return;
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? container.clientHeight : 1);
      event.preventDefault();
      if (canScroll(container, dir)) {
        container.scrollTop += delta;
        state.amount = 0;
        state.scrolled = true;
        return;
      }
      // Finishing a tall section's content must not also trigger its exit.
      if (state.scrolled) return;
      state.amount += Math.abs(delta);
      if (state.amount >= 40) {
        state.amount = 0;
        state.consumed = step(dir);
      }
    };
    const onKey = event => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || menuOpen() ||
        event.target.closest?.('input, textarea, select, [contenteditable="true"]')) return;
      const dir = ['ArrowDown', 'PageDown'].includes(event.key) ? 1 : ['ArrowUp', 'PageUp'].includes(event.key) ? -1 : 0;
      if (!dir) return;
      event.preventDefault();
      const container = panel();
      if (dir === gesture.current.stepDirection && performance.now() - gesture.current.stepTime < 650) return;
      if (canScroll(container, dir)) {
        container.scrollBy({ top: dir * (event.key.startsWith('Page') ? container.clientHeight * 0.8 : 48) });
      } else step(dir);
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
    };
  }, [enabled, panel, step]);

  return (
    <main id="main" ref={root}
      onTouchStart={event => {
        if (!enabled) return;
        if (event.touches.length !== 1) { touch.current = null; return; }
        const container = panel();
        touch.current = { x: event.touches[0].clientX, y: event.touches[0].clientY,
          scrollTop: container?.scrollTop, target: event.target, targetScroll: event.target.scrollTop,
          index: activeIndex };
      }}
      onTouchEnd={event => {
        if (!enabled) return;
        const start = touch.current;
        touch.current = null;
        if (!start || start.index !== activeIndex || event.defaultPrevented || document.querySelector('[role="dialog"][aria-modal="true"]')) return;
        const dy = start.y - event.changedTouches[0].clientY;
        const dx = start.x - event.changedTouches[0].clientX;
        const container = panel();
        // Native scrolling gets the whole gesture when content is taller than its viewport.
        if (Math.abs(dy) < 60 || Math.abs(dy) <= Math.abs(dx) ||
          Math.abs((container?.scrollTop ?? 0) - start.scrollTop) > 1 ||
          start.target.scrollTop !== start.targetScroll || canScroll(container, Math.sign(dy)) ||
          start.target.closest?.('input, textarea, select, [contenteditable="true"]')) return;
        step(Math.sign(dy));
      }}
      onTouchCancel={() => { touch.current = null; }}
      style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: '#050505' }}>
      <AnimatePresence initial={false} mode="popLayout" custom={direction}>
        <motion.div key={activeIndex} data-section-index={activeIndex} custom={direction}
          variants={sectionVariants} initial="enter" animate="center" exit="exit"
          className="section-viewport"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
            overflowY: fittedSections.has(activeIndex) ? 'hidden' : 'auto', overflowX: 'hidden', overscrollBehavior: 'contain', willChange: 'transform, opacity' }}>
          <Suspense fallback={<div style={{ background: '#050505', height: '100%' }} />}>
            <SectionContent fromEnd={fromEnd}>{React.cloneElement(sections[activeIndex], { entryDirection: fromEnd ? -1 : 1 })}</SectionContent>
          </Suspense>
        </motion.div>
      </AnimatePresence>
      {activeIndex === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
          style={{ position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', zIndex: 40,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', pointerEvents: 'none' }}>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
            style={{ width: '22px', height: '36px', borderRadius: '12px', border: '2px solid #444', display: 'flex', justifyContent: 'center', paddingTop: '6px' }}>
            <motion.div animate={{ y: [0, 10, 0], opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
              style={{ width: '4px', height: '8px', borderRadius: '4px', background: '#00f5a0' }} />
          </motion.div>
          <span style={{ color: '#444', fontSize: '0.7rem', letterSpacing: '2px' }}>SCROLL</span>
        </motion.div>
      )}
    </main>
  );
}
