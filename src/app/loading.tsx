"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-vf-navy">
      <Image
        src="/images/ventura/blue-texture.jpeg"
        alt=""
        fill
        priority
        className="object-cover opacity-35 mix-blend-soft-light"
      />

      <div className="absolute inset-0 bg-gradient-to-b from-vf-navy/55 via-vf-navy/70 to-vf-navy/90" />

      <motion.div
        className="relative flex flex-col items-center gap-4"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.9, 1, 0.9] }}
          transition={{ repeat: Infinity, duration: 1.9, ease: "easeInOut" }}
        >
          <Image
            src="/images/ventura/logo-white.png"
            alt="Ventura Forward"
            width={132}
            height={132}
            priority
            className="h-28 w-28 sm:h-32 sm:w-32"
          />
        </motion.div>

        <motion.p
          className="text-xs tracking-[0.22em] uppercase text-vf-sand/75"
          animate={{ opacity: [0.35, 1, 0.35] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          Ventura Forward
        </motion.p>
      </motion.div>
    </div>
  );
}
