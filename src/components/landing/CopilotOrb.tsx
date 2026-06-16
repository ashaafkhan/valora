'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Sparkles, X } from 'lucide-react'

interface Props {
  onOpen: () => void
}

export function CopilotOrb({ onOpen }: Props) {
  const [visible, setVisible] = useState(false)
  const [showBubble, setShowBubble] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 2500)
    const t2 = setTimeout(() => setShowBubble(true), 4000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  if (dismissed) return null

  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
          <AnimatePresence>
            {showBubble && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="valora-glass rounded-2xl rounded-br-sm px-4 py-3 border border-white/[0.08] max-w-[220px] relative"
              >
                <p className="text-sm font-medium text-text-primary">Automate with me &#x2728;</p>
                <p className="text-xs text-text-secondary mt-0.5">Send emails, schedule meetings, search your inbox — just ask.</p>
                <button
                  onClick={(e) => { e.stopPropagation(); setDismissed(true) }}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-surface border border-border rounded-full
                             flex items-center justify-center text-text-muted hover:text-text-primary"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onOpen}
            className="relative w-14 h-14 rounded-full bg-gradient-to-br from-primary to-indigo-600
                       shadow-[0_0_40px_rgba(0,102,255,0.6)] flex items-center justify-center
                       cursor-pointer"
          >
            <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping" />
            <Sparkles className="w-6 h-6 text-white relative z-10" />
          </motion.button>
        </div>
      )}
    </AnimatePresence>
  )
}
