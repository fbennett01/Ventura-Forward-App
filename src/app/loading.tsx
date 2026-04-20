"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-vf-navy px-6 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <Image
        src="/images/ventura/ventura-fade-2.webp"
        alt="Ventura from sky"
        fill
        priority
        className="object-cover opacity-30 mix-blend-luminosity"
      />

      <div className="absolute inset-0 bg-gradient-to-b from-vf-navy/45 via-vf-navy/72 to-vf-navy/92" />

      <motion.div
        className="relative flex flex-col items-center gap-4"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <motion.div
          className="absolute -inset-8 rounded-full border border-vf-sand/10"
          animate={{ scale: [0.95, 1.06, 0.95], opacity: [0.5, 0.2, 0.5] }}
          transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
        />

        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.9, 1, 0.9] }}
          transition={{ repeat: Infinity, duration: 1.9, ease: "easeInOut" }}
        >
          <Image
            src="/images/ventura/logo-white.png"
            alt="Ventura Forward"
            width={224}
            height={94}
            priority
            className="h-12 w-auto sm:h-14 drop-shadow-[0_0_22px_rgba(215,235,255,0.35)]"
          />
        </motion.div>

        <motion.p
          className="text-xs tracking-[0.22em] uppercase text-vf-sand/85 font-semibold"
          animate={{ opacity: [0.35, 1, 0.35] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          Ventura Forward Loading
        </motion.p>
      </motion.div>
    </div>
  );
}
