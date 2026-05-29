'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { calmSpring, GPU_CLASS } from '../../utils/motionVariants';

interface SmoothCardProps {
  children: ReactNode;
  className?: string;
}

export function SmoothCard({ children, className }: SmoothCardProps) {
  return (
    <motion.div
      className={cn(GPU_CLASS, className)}
      whileHover={{
        y: -3,
        boxShadow: '0 20px 35px -12px rgba(0, 0, 0, 0.25)',
        borderColor: 'rgba(255, 255, 255, 0.12)',
      }}
      transition={calmSpring}
    >
      {children}
    </motion.div>
  );
}
