// Adapted from React Bits CountUp's count mode. Registry source and license: docs/REACTBITS.md.
import { animate, useInView, useReducedMotion } from 'motion/react';
import { useEffect, useRef } from 'react';
import { number } from '@/lib/format';
export default function CountUp({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const visible = useInView(ref, { once: true });
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!visible || reduced !== false || !ref.current) return;
    const node = ref.current;
    const controls = animate(0, to, {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (value) => {
        node.textContent = number(Math.round(value));
      },
    });
    return () => {
      controls.stop();
      node.textContent = number(to);
    };
  }, [to, visible, reduced]);
  return (
    <>
      <span aria-hidden="true" ref={ref}>
        {number(to)}
      </span>
      <span className="sr-only">{number(to)}</span>
    </>
  );
}
