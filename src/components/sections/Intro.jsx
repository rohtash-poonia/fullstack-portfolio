import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function IntroScreen({ onFinish }) {
  const greetings = useMemo(
    () => [
      "Hello",
      "नमस्ते",
      "Hola",
      "Bonjour",
      "Ciao",
      "Olá",
      "Здравствуйте",
      "Merhaba",
      "Γειά",
      "Hej",
      "Hallo",
      "Salam",
    ],
    [],
  );

  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((current) => (current + 1) % greetings.length);
    }, 200);
    const hideTimeout = setTimeout(
      () => setVisible(false),
      greetings.length * 200 + 100,
    );

    return () => {
      clearInterval(interval);
      clearTimeout(hideTimeout);
    };
  }, [greetings.length]);

  useEffect(() => {
    const timeout = setTimeout(onFinish, 6000);
    return () => clearTimeout(timeout);
  }, [onFinish]);

  return (
    <AnimatePresence onExitComplete={onFinish}>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black text-white overflow-hidden"
          initial={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{
            duration: 1.05,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <motion.h1
            key={greetings[index]}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.16 }}
            className="text-4xl md:text-6xl font-bold"
          >
            {greetings[index]}
          </motion.h1>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
