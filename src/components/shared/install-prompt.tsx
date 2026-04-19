'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Smartphone, X } from 'lucide-react'

const DISMISSED_KEY = 'vf_install_dismissed'
const DISMISS_TTL = 7 * 24 * 60 * 60 * 1000 // 7 days

function isIosSafari() {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  return /iPhone|iPad/.test(ua) && /Safari/.test(ua) && !/CriOS|FxiOS/.test(ua)
}

function isStandalone() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(display-mode: standalone)').matches
}

function isDismissed() {
  if (typeof localStorage === 'undefined') return false
  const ts = localStorage.getItem(DISMISSED_KEY)
  if (!ts) return false
  return Date.now() - parseInt(ts) < DISMISS_TTL
}

export function InstallPrompt() {
  const [show, setShow] = useState(false)
  const [isIos, setIsIos] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    if (isStandalone() || isDismissed()) return

    if (isIosSafari()) {
      setIsIos(true)
      setShow(true)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, Date.now().toString())
    setShow(false)
  }

  async function install() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setShow(false)
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed bottom-24 inset-x-4 z-30 rounded-2xl vf-gradient p-4 flex items-center gap-3 shadow-xl shadow-vf-orange/20"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        >
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Smartphone className="size-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            {isIos ? (
              <p className="text-white text-sm leading-snug">
                <span className="font-bold">Add to Home Screen</span> — tap Share, then "Add to Home Screen"
              </p>
            ) : (
              <p className="text-white text-sm leading-snug">
                <span className="font-bold">Install the app</span> for the full Ventura Forward experience
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {!isIos && deferredPrompt && (
              <button
                onClick={install}
                className="bg-white text-vf-orange text-xs font-bold px-3 py-1.5 rounded-full"
              >
                Install
              </button>
            )}
            <button onClick={dismiss} className="text-white/70 hover:text-white">
              <X className="size-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
