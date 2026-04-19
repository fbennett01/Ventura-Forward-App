'use client'
import { motion, useReducedMotion } from 'framer-motion'

export function SuccessState() {
  const reduced = useReducedMotion()

  return (
    <motion.div
      className="fixed inset-0 bg-vf-navy/95 backdrop-blur-xl z-50 flex flex-col items-center justify-center gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduced ? 0 : 0.3 }}
    >
      {/* Animated checkmark */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={reduced ? { duration: 0 } : { type: 'spring', damping: 12, stiffness: 200 }}
      >
        <svg width="120" height="120" viewBox="0 0 120 120">
          {/* Track circle */}
          <circle cx="60" cy="60" r="54" stroke="rgba(245,233,215,0.08)" strokeWidth="4" fill="none" />
          {/* Animated fill circle */}
          <motion.circle
            cx="60"
            cy="60"
            r="54"
            stroke="#D7EBFF"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={reduced ? { duration: 0 } : { duration: 0.6, ease: 'easeOut' }}
            style={{ rotate: -90, transformOrigin: '60px 60px' }}
          />
          {/* Checkmark */}
          <motion.path
            d="M36 60 L52 76 L84 44"
            stroke="#D7EBFF"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={reduced ? { duration: 0 } : { duration: 0.4, delay: 0.5, ease: 'easeOut' }}
          />
        </svg>
      </motion.div>

      <motion.div
        className="flex flex-col items-center gap-2 text-center px-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduced ? { duration: 0 } : { delay: 0.7, duration: 0.4 }}
      >
        <h2 className="font-display font-extrabold text-4xl text-vf-sand">On it.</h2>
        <p className="text-base text-vf-sand/60 leading-relaxed">
          Thanks for keeping Ventura moving forward 🌴
        </p>
      </motion.div>
    </motion.div>
  )
}