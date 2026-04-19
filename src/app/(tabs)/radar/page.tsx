'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { Radio, MapPin, CalendarPlus, Bell } from 'lucide-react'
import { mockMeetings } from '@/data/mock-meetings'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/toast'

const PILLAR_COLORS: Record<string, string> = {
  Safety: '#D7EBFF',
  Public: '#2B8A9E',
  Land: '#7FB069',
  Beautify: '#8CC8FF',
  Recreation: '#F0B429',
}

const PILLAR_THEME: Record<string, { rail: string; badge: string; chip: string }> = {
  Safety: {
    rail: 'bg-[#D7EBFF]',
    badge: 'text-[#D7EBFF] border-[#D7EBFF]/30 bg-[#D7EBFF]/12',
    chip: 'bg-[#D7EBFF]/20 border-[#D7EBFF]/40 text-[#D7EBFF]',
  },
  Public: {
    rail: 'bg-[#2B8A9E]',
    badge: 'text-[#2B8A9E] border-[#2B8A9E]/30 bg-[#2B8A9E]/12',
    chip: 'bg-[#2B8A9E]/20 border-[#2B8A9E]/40 text-[#2B8A9E]',
  },
  Land: {
    rail: 'bg-[#7FB069]',
    badge: 'text-[#7FB069] border-[#7FB069]/30 bg-[#7FB069]/12',
    chip: 'bg-[#7FB069]/20 border-[#7FB069]/40 text-[#7FB069]',
  },
  Beautify: {
    rail: 'bg-[#8CC8FF]',
    badge: 'text-[#8CC8FF] border-[#8CC8FF]/30 bg-[#8CC8FF]/12',
    chip: 'bg-[#8CC8FF]/20 border-[#8CC8FF]/40 text-[#8CC8FF]',
  },
  Recreation: {
    rail: 'bg-[#F0B429]',
    badge: 'text-[#F0B429] border-[#F0B429]/30 bg-[#F0B429]/12',
    chip: 'bg-[#F0B429]/20 border-[#F0B429]/40 text-[#F0B429]',
  },
}

const ALL_PILLARS = ['All', ...Object.keys(PILLAR_COLORS)]

export default function RadarPage() {
  const [activeFilters, setActiveFilters] = useState<string[]>(['All'])
  const prefersReduced = useReducedMotion()
  const listVariants = prefersReduced
    ? undefined
    : {
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: { staggerChildren: 0.05, delayChildren: 0.04 },
        },
      }

  const cardVariants = prefersReduced
    ? undefined
    : {
        hidden: { opacity: 0, y: 14, scale: 0.99 },
        show: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { type: 'spring' as const, stiffness: 290, damping: 30, mass: 0.8 },
        },
      }

  function toggleFilter(pillar: string) {
    if (pillar === 'All') {
      setActiveFilters(['All'])
      return
    }
    setActiveFilters(prev => {
      const without = prev.filter(f => f !== 'All')
      const next = without.includes(pillar)
        ? without.filter(f => f !== pillar)
        : [...without, pillar]
      return next.length === 0 ? ['All'] : next
    })
  }

  const filtered = activeFilters.includes('All')
    ? mockMeetings
    : mockMeetings.filter(m => activeFilters.includes(m.pillar))

  return (
    <div className="flex flex-col min-h-screen pb-16">
      {/* Sticky header */}
      <header className="sticky top-0 z-40 h-16 bg-vf-navy/60 backdrop-blur-2xl border-b border-border/5 flex items-center justify-between px-5">
        <div className="flex flex-row items-center gap-3">
          <Image 
            src="/images/ventura/logo-white.png" 
            alt="Ventura Forward Logo" 
            width={24} 
            height={24} 
            className="object-contain h-6 w-auto mix-blend-plus-lighter opacity-90 drop-shadow-[0_0_12px_rgba(215,235,255,0.4)]"
          />
          <span className="font-poppins font-black text-sm tracking-widest text-white uppercase drop-shadow-sm">
            Civic Radar
          </span>
        </div>
        <motion.div
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <Radio className="size-4 text-vf-orange drop-shadow-[0_0_6px_rgba(215,235,255,0.4)]" />
        </motion.div>
      </header>

      {/* Filter chips */}
      <div className="flex gap-2.5 px-5 py-4 overflow-x-auto scrollbar-hide border-b border-border/5 bg-vf-navy-100/10">
        {ALL_PILLARS.map(pillar => {
          const isActive = activeFilters.includes(pillar)
          return (
            <motion.button
              key={pillar}
              onClick={() => toggleFilter(pillar)}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap border transition-colors btn-ripple',
                isActive
                  ? 'text-white border-transparent'
                  : 'bg-vf-navy-100 text-vf-sand/60 border-white/5',
                isActive && pillar !== 'All' ? PILLAR_THEME[pillar].chip : '',
                isActive && pillar === 'All'
                  ? 'bg-gradient-to-br from-[#d7ebff] to-[#8cc8ff] border-transparent text-[#06203d]'
                  : ''
              )}
              whileTap={prefersReduced ? undefined : { scale: 0.96 }}
            >
              {pillar}
            </motion.button>
          )
        })}
      </div>

      {/* Meeting cards */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Radio className="size-12 text-vf-sand/20" />
          <p className="font-display font-bold text-xl text-vf-sand/40">Quiet on the radar</p>
          <p className="text-sm text-vf-sand/30">Try a different filter</p>
        </div>
      ) : (
        <motion.div
          className="space-y-3 px-4 pb-28"
          variants={listVariants}
          initial={prefersReduced ? false : 'hidden'}
          animate={prefersReduced ? undefined : 'show'}
        >
          {filtered.map((meeting) => {
            const date = new Date(meeting.datetime)
            const weekday = date.toLocaleDateString('en-US', { weekday: 'short' })
            const day = date.getDate()
            const month = date.toLocaleDateString('en-US', { month: 'short' })

            return (
              <motion.div
                key={meeting.id}
                variants={cardVariants}
                whileTap={prefersReduced ? undefined : { scale: 0.985 }}
                className="rounded-2xl bg-vf-navy-100 border border-white/5 overflow-hidden flex"
              >
                {/* Pillar color edge */}
                <div className={cn('w-1 flex-shrink-0', PILLAR_THEME[meeting.pillar].rail)} />

                {/* Card content */}
                <div className="flex gap-3 p-4 flex-1">
                  {/* Date column */}
                  <div className="flex flex-col items-center justify-center w-14 flex-shrink-0 text-center">
                    <span className="text-[10px] uppercase tracking-widest text-vf-sand/40 font-semibold">
                      {weekday}
                    </span>
                    <span className="font-display font-extrabold text-3xl text-vf-sand leading-none">
                      {day}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-vf-sand/40">
                      {month}
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="w-px bg-white/5 self-stretch mx-1" />

                  {/* Details */}
                  <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                    {/* Pillar badge */}
                    <span
                      className={cn(
                        'inline-flex self-start px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide border',
                        PILLAR_THEME[meeting.pillar].badge
                      )}
                    >
                      {meeting.pillar}
                    </span>

                    {/* Title */}
                    <p className="font-display font-bold text-base text-vf-sand leading-snug">
                      {meeting.title}
                    </p>

                    {/* Location */}
                    <div className="flex items-center gap-1 text-vf-sand/50 text-xs">
                      <MapPin className="size-3 flex-shrink-0" />
                      <span className="truncate">{meeting.location}</span>
                    </div>

                    {/* Agenda highlight */}
                    <p className="text-sm text-vf-sand/70 leading-relaxed line-clamp-2">
                      {meeting.agendaHighlight}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => toast("We'll remind you 👀")}
                        className="h-7 px-3 rounded-full border border-white/10 text-vf-sand/60 text-xs flex items-center gap-1 btn-ripple"
                      >
                        <CalendarPlus className="size-3" />
                        Add to Calendar
                      </button>
                      <button
                        onClick={() => toast("We'll remind you 👀")}
                        className="h-7 px-3 rounded-full border border-white/10 text-vf-sand/60 text-xs flex items-center gap-1 btn-ripple"
                      >
                        <Bell className="size-3" />
                        Remind Me
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}
