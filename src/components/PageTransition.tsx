"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { ReactNode } from "react";

interface PageTransitionProps {
  show: boolean;
  children: ReactNode;
}

export default function PageTransition({ show, children }: PageTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          key="page-transition"
          initial={{ opacity: 0, scale: 0.97, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: -20 }}
          transition={{
            duration: 0.5,
            ease: [0.23, 1, 0.32, 1],
          }}
          className="w-full h-full"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
