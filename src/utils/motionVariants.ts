import type { Transition, Variants } from 'framer-motion';

export const calmSpring: Transition = {
  type: 'spring',
  stiffness: 90,
  damping: 24,
  mass: 1,
};

export const calmEase = [0.22, 1, 0.36, 1] as const;
export const calmExitEase = [0.64, 0, 0.78, 0] as const;

export const pageFadeVariants: Variants = {
  initial: { opacity: 0, y: 14, filter: 'blur(8px)' },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.45, ease: calmEase },
  },
  exit: {
    opacity: 0,
    y: -10,
    filter: 'blur(6px)',
    transition: { duration: 0.3, ease: calmExitEase },
  },
};

export const containerStaggerVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.08 },
  },
};

export const childItemVariants: Variants = {
  initial: { opacity: 0, y: 12, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: calmSpring,
  },
};

export const GPU_CLASS = 'transform-gpu';
