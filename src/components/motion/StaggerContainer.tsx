'use client';

import { motion } from 'framer-motion';
import { Children, type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import {
  childItemVariants,
  containerStaggerVariants,
  GPU_CLASS,
} from '../../utils/motionVariants';

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
}

export function StaggerContainer({ children, className }: StaggerContainerProps) {
  return (
    <motion.div
      className={cn(GPU_CLASS, className)}
      variants={containerStaggerVariants}
      initial="initial"
      animate="animate"
    >
      {Children.map(children, (child, index) =>
        child != null ? (
          <motion.div key={index} className={GPU_CLASS} variants={childItemVariants}>
            {child}
          </motion.div>
        ) : null,
      )}
    </motion.div>
  );
}
