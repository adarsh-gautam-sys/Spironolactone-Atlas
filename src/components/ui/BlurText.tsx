// Adapted from React Bits BlurText; only the single-load word reveal is retained.
import { motion, useReducedMotion } from 'motion/react';
export default function BlurText({ text }: { text: string }) {
  const reduced = useReducedMotion();
  return (
    <p className="hero-eyebrow">
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.split(' ').map((word, index) => (
          <motion.span
            key={`${word}-${index}`}
            initial={
              reduced !== false ? false : { filter: 'blur(4px)', opacity: 0.5 }
            }
            animate={{ filter: 'blur(0px)', opacity: 1 }}
            transition={{
              duration: reduced ? 0 : 0.4,
              delay: reduced ? 0 : index * 0.04,
            }}
          >
            {word}{' '}
          </motion.span>
        ))}
      </span>
    </p>
  );
}
