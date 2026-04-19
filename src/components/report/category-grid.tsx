'use client'
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
    <div className="min-h-screen bg-vf-navy flex flex-col">
      <div className="px-6 pt-10 pb-6">
        <h1 className="font-display font-extrabold text-3xl text-vf-sand">What did you spot?</h1>
        <p className="text-sm text-vf-sand/50 mt-1">Tap a category to start</p>
      </div>

      <div className="grid grid-cols-2 gap-3 px-6 flex-1">
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
                className="w-full aspect-square rounded-2xl bg-vf-navy-100 border border-white/5 flex flex-col items-center justify-center gap-3 active:bg-vf-navy-50 transition-colors"
              >
                <Icon className="size-8 text-vf-orange" />
                <span className="font-semibold text-base text-vf-sand capitalize">{category.value}</span>
              </button>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}