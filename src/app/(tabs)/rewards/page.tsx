'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { Leaf, QrCode, MapPin, Check, Plus, Gift } from 'lucide-react'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useRewards } from '@/lib/rewards/use-rewards'
import { MemberQr } from '@/components/rewards/member-qr'
import { RedeemSheet } from '@/components/rewards/redeem-sheet'
import { JoinRewards } from '@/components/rewards/join-rewards'
import type { Partner } from '@/types'

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const day = 86_400_000
  if (diff < day) return 'today'
  const days = Math.floor(diff / day)
  if (days < 7) return `${days}d ago`
  return `${Math.floor(days / 7)}w ago`
}

function ProgressRing({ value, max }: { value: number; max: number }) {
  const size = 48
  const radius = (size - 6) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(value / max, 1)
  const offset = circumference * (1 - progress)
  const complete = value >= max

  return (
    <div className="relative flex-shrink-0 size-12">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          strokeWidth={3} fill="none"
          stroke="rgba(245,233,215,0.1)"
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          strokeWidth={3} fill="none"
          stroke={complete ? '#7FB069' : '#D7EBFF'}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {complete
          ? <Check className="size-4 text-green-400" />
          : <span className="font-display font-bold text-xs text-vf-sand">{max}</span>
        }
      </div>
    </div>
  )
}

export default function RewardsPage() {
  const [scanOpen, setScanOpen] = useState(false)
  const [redeemPartner, setRedeemPartner] = useState<Partner | null>(null)
  const prefersReduced = useReducedMotion()
  const { balance, partners, activity, loading, demo, signedUp, signUp, simulateVisit, redeem } = useRewards()
  const featured = partners.slice(0, 4)

  const handlePartnerTap = (partner: Partner) => setRedeemPartner(partner)
  const listVariants = prefersReduced
    ? undefined
    : {
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: { staggerChildren: 0.05, delayChildren: 0.03 },
        },
      }

  const itemVariants = prefersReduced
    ? undefined
    : {
        hidden: { opacity: 0, y: 12, scale: 0.99 },
        show: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { type: 'spring' as const, stiffness: 290, damping: 30, mass: 0.82 },
        },
      }

  return (
    <div className="flex flex-col min-h-screen pb-28">
      {/* Sticky header */}
      <header className="sticky top-0 z-40 h-[calc(4rem+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] bg-vf-navy/60 backdrop-blur-2xl border-b border-border/5 flex items-center justify-between px-5">
        <div className="flex flex-row items-center gap-3">
          <Image
            src="/images/ventura/logo-white.png"
            alt="Ventura Forward Logo"
            width={224}
            height={94}
            priority
            className="object-contain h-6 w-auto mix-blend-plus-lighter opacity-90 drop-shadow-[0_0_12px_rgba(215,235,255,0.4)]"
          />
          <span className="font-poppins font-black text-sm tracking-widest text-white uppercase drop-shadow-sm">
            Rewards
          </span>
        </div>
        <Leaf className="size-4 text-vf-accent drop-shadow-[0_0_12px_rgba(215,235,255,0.4)]" />
      </header>

      {!demo && !signedUp ? (
        <JoinRewards onJoin={signUp} />
      ) : (
      <>
      {/* Balance hero card */}
      <motion.div
        className="mx-5 mt-5 rounded-3xl p-6 relative overflow-hidden bg-vf-navy-100/50 backdrop-blur-xl border border-white/5 shadow-vf-medium hover:shadow-vf-premium transition-all duration-300"
        initial={prefersReduced ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReduced ? 0 : 0.34, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Grain overlay */}
        <div className="texture-grain absolute inset-0 pointer-events-none" />

        {/* Background decoration */}
        <div className="absolute -bottom-4 -right-4 opacity-10 pointer-events-none">
          <Leaf className="size-32 text-white rotate-[-20deg]" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <p className="text-white/70 text-xs tracking-widest font-semibold uppercase">
            Forward Points
          </p>
          <p className="font-display font-extrabold text-6xl text-white leading-none mt-1">
            {balance}
          </p>
        </div>

        {/* Scan button */}
        <button
          onClick={() => setScanOpen(true)}
          className="btn-ripple absolute bottom-4 right-4 z-20 bg-white text-vf-navy rounded-full px-4 py-2 text-sm font-bold flex items-center gap-1.5 shadow-md shadow-white/20 hover:scale-105 active:scale-95 transition-all"
        >
          <QrCode className="size-4 text-vf-navy" />
          Scan to Earn
        </button>
      </motion.div>

      {/* Scan Sheet */}
      <Sheet open={scanOpen} onOpenChange={setScanOpen}>
        <SheetContent side="bottom" className="bg-vf-navy border-t border-white/10 rounded-t-3xl pb-10">
          <div className="flex flex-col items-center gap-4 pt-2">
            <div className="w-12 h-1 rounded-full bg-white/20" />
            {demo ? (
              <>
                <QrCode className="size-16 text-vf-accent" />
                <h3 className="font-display font-bold text-xl text-vf-sand">Demo mode</h3>
                <p className="text-vf-sand/60 text-sm text-center px-6 leading-relaxed">
                  Live scanning is off in the demo. Simulate a partner visit to earn points.
                </p>
                <Button
                  onClick={() => simulateVisit?.()}
                  className="btn-ripple relative vf-gradient text-vf-navy font-bold rounded-full px-8 mt-2 active:scale-95 transition-all shadow-md hover:shadow-lg shadow-vf-accent/30"
                >
                  Simulate a visit (+5)
                </Button>
              </>
            ) : (
              <>
                <h3 className="font-display font-bold text-xl text-vf-sand">Scan to Earn</h3>
                <p className="text-vf-sand/60 text-sm text-center px-6 leading-relaxed">
                  Show this code to a partner to collect your Forward Points.
                </p>
                <MemberQr />
                <Button
                  onClick={() => setScanOpen(false)}
                  className="btn-ripple relative bg-white/10 text-vf-sand font-bold rounded-full px-8 mt-1 active:scale-95 transition-all"
                >
                  Done
                </Button>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Featured partners */}
      <p className="px-4 mt-6 mb-3 text-xs tracking-widest text-vf-sand/40 uppercase font-semibold">
        Featured Stops
      </p>
      <motion.div
        className="flex gap-3 px-4 overflow-x-auto scrollbar-hide pb-2"
        variants={listVariants}
        initial={prefersReduced ? false : 'hidden'}
        animate={prefersReduced ? undefined : 'show'}
      >
        {featured.map((partner) => (
          <motion.div
            key={partner.id}
            className="flex-shrink-0 w-36 rounded-2xl bg-vf-navy-100 border border-white/5 p-3 cursor-pointer"
            variants={itemVariants}
            whileTap={prefersReduced ? undefined : { scale: 0.985 }}
            onClick={() => handlePartnerTap(partner)}
          >
            <div className="w-full aspect-[2/1] rounded-xl bg-vf-navy border border-white/10 flex items-center justify-center mb-2 overflow-hidden relative px-2 shadow-vf-soft">
              {partner.logoUrl ? (
                <Image
                  src={partner.logoUrl}
                  alt={`${partner.name} logo`}
                  fill
                  sizes="144px"
                  className="object-contain object-center p-1"
                  unoptimized
                />
              ) : (
                <span className="font-display font-bold text-xl text-vf-navy/70">
                  {partner.name[0]}
                </span>
              )}
            </div>
            <p className="font-semibold text-sm text-vf-sand truncate">{partner.name}</p>
            <p className="text-xs text-vf-sand/50 line-clamp-2 mt-0.5 leading-relaxed">
              {partner.perk}
            </p>
            <div className="flex items-center gap-1 mt-2 text-vf-accent text-xs font-bold">
              <Leaf className="size-3" />
              {partner.pointsCost} pts
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* All partners */}
      <p className="px-4 mt-6 mb-3 text-xs tracking-widest text-vf-sand/40 uppercase font-semibold">
        All Partners
      </p>
      <motion.div
        className="space-y-2 px-4"
        variants={listVariants}
        initial={prefersReduced ? false : 'hidden'}
        animate={prefersReduced ? undefined : 'show'}
      >
        {partners.map((partner) => (
          <motion.div
            key={partner.id}
            className="rounded-2xl bg-vf-navy-100 border border-white/5 p-3 flex gap-3 items-center cursor-pointer"
            variants={itemVariants}
            whileTap={prefersReduced ? undefined : { scale: 0.99 }}
            onClick={() => handlePartnerTap(partner)}
          >
            <div className="w-24 aspect-[2/1] rounded-xl bg-vf-navy border border-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden relative px-2 shadow-vf-soft">
              {partner.logoUrl ? (
                <Image
                  src={partner.logoUrl}
                  alt={`${partner.name} logo`}
                  fill
                  sizes="96px"
                  className="object-contain object-center p-1"
                  unoptimized
                />
              ) : (
                <span className="font-display font-bold text-xl text-vf-navy/70">
                  {partner.name[0]}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-vf-sand">{partner.name}</p>
              <div className="flex items-center gap-1 text-xs text-vf-sand/40 mt-0.5">
                <MapPin className="size-3 flex-shrink-0" />
                <span className="truncate">{partner.address}</span>
              </div>
              <p className="text-sm text-vf-sand/70 line-clamp-1 mt-0.5">{partner.perk}</p>
            </div>
            <ProgressRing value={balance} max={partner.pointsCost} />
          </motion.div>
        ))}
      </motion.div>

      {/* Recent activity */}
      <p className="px-4 mt-6 mb-3 text-xs tracking-widest text-vf-sand/40 uppercase font-semibold">
        Recent Activity
      </p>
      <motion.div
        className="space-y-2 px-4 mb-4"
        variants={listVariants}
        initial={prefersReduced ? false : 'hidden'}
        animate={prefersReduced ? undefined : 'show'}
      >
        {!loading && activity.length === 0 ? (
          <motion.div
            className="flex items-center justify-center rounded-xl bg-vf-navy-100 border border-white/5 px-4 py-6"
            variants={itemVariants}
          >
            <span className="text-sm text-vf-sand/40 text-center">
              No activity yet — scan to earn your first points.
            </span>
          </motion.div>
        ) : (
          activity.map((item) => {
            const isEarn = item.points > 0
            return (
              <motion.div
                key={item.id}
                className="flex items-center gap-3 rounded-xl bg-vf-navy-100 border border-white/5 px-4 py-3"
                variants={itemVariants}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isEarn ? 'bg-vf-accent/15' : 'bg-vf-sea/15'
                  }`}
                >
                  {isEarn ? (
                    <Plus className="size-4 text-vf-accent" />
                  ) : (
                    <Gift className="size-4 text-vf-sea" />
                  )}
                </div>
                <span className="flex-1 text-sm text-vf-sand font-medium">{item.label}</span>
                <span className="text-xs text-vf-sand/40">{relativeTime(item.createdAt)}</span>
              </motion.div>
            )
          })
        )}
      </motion.div>

      <RedeemSheet
        partner={redeemPartner}
        balance={balance}
        redeem={redeem}
        onOpenChange={(open) => {
          if (!open) setRedeemPartner(null)
        }}
      />
      </>
      )}
    </div>
  )
}
