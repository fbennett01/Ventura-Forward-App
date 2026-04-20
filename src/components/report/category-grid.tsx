'use client'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import {
  Trash2,
  PaintBucket,
  Construction,
  ShoppingCart,
  AlertTriangle,
  MoreHorizontal,
} from 'lucide-react'
import type { ReportCategory, LucideIcon } from '@/types'

const categories: Array<{ value: ReportCategory }> = [
  { value: 'trash' },
  { value: 'graffiti' },
  { value: 'pothole' },
  { value: 'abandoned' },
  { value: 'hazard' },
  { value: 'other' },
]

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  trash: Trash2,
  graffiti: PaintBucket,
  pothole: Construction,
  abandoned: ShoppingCart,
  hazard: AlertTriangle,
  other: MoreHorizontal,
}

interface CategoryGridProps {
  onSelect: (category: ReportCategory) => void
}

export function CategoryGrid({ onSelect }: CategoryGridProps) {
  const reduced = useReducedMotion()

  return (
    <div className="flex flex-col min-h-screen pb-24">
      {/* Sticky header */}
      <header className="sticky top-0 z-40 h-[calc(4rem+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] bg-vf-navy/60 backdrop-blur-2xl border-b border-border/5 flex items-center justify-between px-5">
        <div className="flex flex-row items-center gap-3">
          <Image 
            src="/images/ventura/logo-white.png" 
            alt="Ventura Forward Logo" 
            width={224} 
            height={94} 
            className="object-contain h-6 w-auto mix-blend-plus-lighter opacity-90 drop-shadow-[0_0_12px_rgba(215,235,255,0.4)]"
          />
          <span className="font-poppins font-black text-sm tracking-widest text-white uppercase drop-shadow-sm">
            Report Issue
          </span>
        </div>
      </header>

      <div className="px-6 pt-8 pb-6">
        <h1 className="font-poppins font-extrabold text-3xl text-white">What did you spot?</h1>
        <p className="text-base text-vf-sand/60 mt-2 font-medium">Tap a category to get started.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 px-6 flex-1 content-start">
        {categories.map((category, index) => {
          const Icon = CATEGORY_ICONS[category.value]
          return (
            <motion.div
              key={category.value}
              initial={reduced ? undefined : { opacity: 0, y: 16 }}
              animate={reduced ? undefined : { opacity: 1, y: 0 }}
              transition={reduced ? undefined : { delay: index * 0.04, duration: 0.3 }}
              whileTap={{ scale: 0.94 }}
            >
              <button
                onClick={() => {
                  navigator.vibrate?.(10)
                  onSelect(category.value)
                }}
                className="btn-ripple relative w-full aspect-square rounded-3xl bg-vf-navy-100/40 backdrop-blur-md border border-white/5 shadow-vf-soft flex flex-col items-center justify-center gap-4 hover:bg-vf-navy-100/60 hover:shadow-vf-medium transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-vf-orange/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className="size-7 text-vf-orange drop-shadow-sm" />
                </div>
                <span className="font-poppins font-semibold text-lg text-vf-sand capitalize tracking-tight">{category.value}</span>
              </button>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}