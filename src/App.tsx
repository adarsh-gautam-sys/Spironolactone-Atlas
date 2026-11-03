import { motion, useReducedMotion } from 'motion/react';

export default function App() {
  const reducedMotion = useReducedMotion();

  return (
    <motion.main
      className="p-4"
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reducedMotion ? 0 : 0.3 }}
    >
      Spironolactone Atlas — setup complete
    </motion.main>
  );
}
