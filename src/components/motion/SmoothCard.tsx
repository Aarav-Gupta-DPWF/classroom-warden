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
        y: -5,
        scale: 1.008,
        boxShadow: '0 24px 40px -14px rgba(0, 229, 180, 0.12)',
        borderColor: 'rgba(0, 229, 180, 0.22)',
      }}
      transition={calmSpring}
    >
      {children}
    </motion.div>
  );
}
