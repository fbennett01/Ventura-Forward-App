'use client'

import { useState } from 'react'
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

const ALL_PILLARS = ['All', ...Object.keys(PILLAR_COLORS)]

export default function RadarPage() {
  const [activeFilters, setActiveFilters] = useState<string[]>(['All'])
  const prefersReduced = useReducedMotion()

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
    <div className="min-h-screen bg-vf-navy/55">
      {/* Sticky header */}
      <header className="sticky top-0 z-40 h-14 bg-vf-navy/70 backdrop-blur-xl border-b border-white/5 flex items-center px-4 gap-2">
        <div className="w-1 h-5 rounded-full bg-vf-orange flex-shrink-0" />
        <span className="font-display font-bold text-sm tracking-widest text-vf-sand uppercase flex-1">
          Civic Radar
        </span>
        <motion.div
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <Radio className="size-4 text-vf-orange" />
        </motion.div>
      </header>

      {/* Filter chips */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
        {ALL_PILLARS.map(pillar => {
          const isActive = activeFilters.includes(pillar)
          return (
            <button
              key={pillar}
              onClick={() => toggleFilter(pillar)}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap border transition-colors',
                isActive
                  ? 'text-white border-transparent'
                  : 'bg-vf-navy-100 text-vf-sand/60 border-white/5'
              )}
              style={
                isActive && pillar !== 'All'
                  ? {
                      backgroundColor: PILLAR_COLORS[pillar] + '33',
                      borderColor: PILLAR_COLORS[pillar] + '66',
                      color: PILLAR_COLORS[pillar],
                    }
                  : isActive
                    ? { background: 'linear-gradient(135deg, #d7ebff, #8cc8ff)', borderColor: 'transparent', color: '#06203d' }
                  : {}
              }
            >
              {pillar}
            </button>
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
        <div className="space-y-3 px-4 pb-28">
          {filtered.map((meeting, index) => {
            const date = new Date(meeting.datetime)
            const weekday = date.toLocaleDateString('en-US', { weekday: 'short' })
            const day = date.getDate()
            const month = date.toLocaleDateString('en-US', { month: 'short' })

            return (
              <motion.div
                key={meeting.id}
                initial={prefersReduced ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04, duration: 0.3, ease: 'easeOut' }}
                className="rounded-2xl bg-vf-navy-100 border border-white/5 overflow-hidden flex"
              >
                {/* Pillar color edge */}
                <div
                  className="w-1 flex-shrink-0"
                  style={{ backgroundColor: PILLAR_COLORS[meeting.pillar] }}
                />

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
                      className="inline-flex self-start px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide border"
                      style={{
                        color: PILLAR_COLORS[meeting.pillar],
                        borderColor: PILLAR_COLORS[meeting.pillar] + '44',
                        backgroundColor: PILLAR_COLORS[meeting.pillar] + '18',
                      }}
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
                        className="h-7 px-3 rounded-full border border-white/10 text-vf-sand/60 text-xs flex items-center gap-1"
                      >
                        <CalendarPlus className="size-3" />
                        Add to Calendar
                      </button>
                      <button
                        onClick={() => toast("We'll remind you 👀")}
                        className="h-7 px-3 rounded-full border border-white/10 text-vf-sand/60 text-xs flex items-center gap-1"
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
        </div>
      )}
    </div>
  )
}
