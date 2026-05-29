'use client';

import { motion } from 'framer-motion';
import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from 'react';
import { useCalmSound } from '../../hooks/useCalmSound';
import { cn } from '../../utils/cn';
import { calmSpring, GPU_CLASS } from '../../utils/motionVariants';

interface MotionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
  playSoundOnClick?: boolean;
}

export function MotionButton({
  children,
  className,
  onClick,
  playSoundOnClick = true,
  type = 'button',
  ...props
}: MotionButtonProps) {
  const { playTap } = useCalmSound();

  const handlePress = (e: MouseEvent<HTMLButtonElement>) => {
    if (playSoundOnClick) playTap();
    onClick?.(e);
  };

  return (
    <motion.button
      type={type}
      whileHover={{ scale: 1.015, y: -0.5 }}
      whileTap={{ scale: 0.985, y: 0 }}
      transition={calmSpring}
      onClick={handlePress}
      className={cn(GPU_CLASS, className)}
      {...props}
    >
      {children}
    </motion.button>
  );
}
