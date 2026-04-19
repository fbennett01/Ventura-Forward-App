"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, Home, Leaf, Radio } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const isActivePath = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname.startsWith(href);

export function BottomTabs() {
  const pathname = usePathname();
  const prefersReduced = useReducedMotion();
  const reportActive = isActivePath(pathname, "/report");

  const springTransition = {
    type: "spring" as const,
    stiffness: 400,
    damping: 25,
    duration: prefersReduced ? 0 : undefined,
  };

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 pb-[env(safe-area-inset-bottom)] pointer-events-none"
      aria-label="Main navigation"
    >
      <div className="pointer-events-auto bg-vf-navy/50 backdrop-blur-3xl border-t border-white/5 shadow-vf-premium h-20 flex items-stretch"
      >

        {/* Home */}
        <TabItem
          href="/"
          label="Home"
          icon={Home}
          active={isActivePath(pathname, "/")}
          prefersReduced={!!prefersReduced}
          springTransition={springTransition}
        />

        {/* Radar */}
        <TabItem
          href="/radar"
          label="Radar"
          icon={Radio}
          active={isActivePath(pathname, "/radar")}
          prefersReduced={!!prefersReduced}
          springTransition={springTransition}
        />

        {/* Report — center special tab */}
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            whileTap={{ scale: prefersReduced ? 1 : 0.92 }}
            transition={springTransition}
            className="relative flex items-center justify-center"
          >
            {reportActive && (
              <motion.div
                className="absolute w-14 h-14 rounded-full bg-vf-orange/30"
                animate={
                  prefersReduced
                    ? {}
                    : { scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }
                }
                transition={{
                  repeat: Infinity,
                  duration: prefersReduced ? 0 : 2,
                  ease: "easeInOut",
                }}
              />
            )}
            <Link
              href="/report"
              aria-label="Report"
              aria-current={reportActive ? "page" : undefined}
              className="-translate-y-3 vf-gradient rounded-full w-14 h-14 flex items-center justify-center shadow-lg shadow-vf-orange/30"
              onClick={() => {
                if (typeof navigator !== "undefined") navigator.vibrate?.(8);
              }}
            >
              <Camera size={24} className="text-white" aria-hidden />
            </Link>
          </motion.div>
        </div>

        {/* Rewards */}
        <TabItem
          href="/rewards"
          label="Rewards"
          icon={Leaf}
          active={isActivePath(pathname, "/rewards")}
          prefersReduced={!!prefersReduced}
          springTransition={springTransition}
        />
      </div>
    </nav>
  );
}

type SpringTransition = {
  type: "spring";
  stiffness: number;
  damping: number;
  duration: number | undefined;
};

function TabItem({
  href,
  label,
  icon: Icon,
  active,
  prefersReduced,
  springTransition,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
  prefersReduced: boolean;
  springTransition: SpringTransition;
}) {
  return (
    <motion.div
      className="flex-1 flex flex-col items-center justify-center h-full relative"
      whileTap={{ scale: prefersReduced ? 1 : 0.9 }}
      transition={springTransition}
    >
      {active && (
        <motion.div
          layoutId="tab-indicator"
          className="absolute top-0 left-1/2 -translate-x-1/2 h-1 w-8 rounded-full bg-gradient-to-r from-vf-orange to-vf-orange/60 shadow-lg shadow-vf-orange/40"
          transition={
            prefersReduced
              ? { duration: 0 }
              : { type: "spring", stiffness: 400, damping: 30 }
          }
        />
      )}
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className="flex flex-col items-center justify-center h-full w-full rounded-2xl btn-ripple"
      >
        <Icon
          size={20}
          aria-hidden
          className={
            active
              ? "text-vf-orange drop-shadow-[0_0_6px_rgba(160,210,255,0.8)]"
              : "text-vf-sand/40"
          }
        />
        <span
          className={`text-[10px] font-medium mt-1 tracking-wide uppercase ${
            active ? "text-vf-orange" : "text-vf-sand/40"
          }`}
        >
          {label}
        </span>
      </Link>
    </motion.div>
  );
}
