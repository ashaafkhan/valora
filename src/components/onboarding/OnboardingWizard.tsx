'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Calendar, CheckCircle2, Shield, Keyboard, Sparkles, ArrowRight, User } from 'lucide-react'
import { connectGmail, connectCalendar, completeOnboarding } from '@/app/onboarding/actions'
import { slideInRight } from '@/lib/motion'

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            background: i < current ? 'var(--primary)' : i === current ? 'var(--text-primary)' : 'var(--border)',
            scale: i === current ? 1.2 : 1,
          }}
          className="w-2 h-2 rounded-full"
        />
      ))}
    </div>
  )
}

interface Props {
  userId: string
  userName: string | null
  userImage: string | null
  hasGmail: boolean
  hasCalendar: boolean
  currentStep: number
  error?: string
}

export function OnboardingWizard({ userId, userName, userImage, hasGmail, hasCalendar, currentStep, error }: Props) {
  const totalSteps = 3

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background text-text-primary p-6 relative">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]
                      bg-[radial-gradient(ellipse,rgba(124,58,237,0.12)_0%,transparent_70%)] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px]
                      bg-[radial-gradient(ellipse,rgba(99,102,241,0.08)_0%,transparent_70%)] rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-[480px]">
        {/* Progress dots */}
        <ProgressDots current={currentStep} total={totalSteps} />

        {/* Step card */}
        <div className="relative valora-glass rounded-2xl p-8 border border-white/[0.06]
                        shadow-[0_40px_80px_rgba(0,0,0,0.5),0_0_60px_rgba(124,58,237,0.1)] min-h-[380px]">
          <div className="absolute top-0 left-0 right-0 h-px
                          bg-gradient-to-r from-transparent via-primary to-transparent rounded-t-2xl" />

          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                {...slideInRight}
                className="space-y-6"
              >
                {/* Welcome header */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center flex-shrink-0 border border-primary/30">
                    {userImage ? (
                      <img src={userImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-text-primary">
                      Welcome{userName ? `, ${userName.split(' ')[0]}` : ''}
                    </h2>
                    <p className="text-sm text-text-secondary mt-0.5">
                      Let&apos;s set up your command center.
                    </p>
                  </div>
                </div>

                <div className="bg-background/50 border border-border rounded-xl p-4 text-xs text-text-secondary space-y-2">
                  <p className="font-semibold text-text-primary text-sm mb-3">In two steps, you&apos;ll get:</p>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>AI-powered priority inbox</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Unified Gmail + Calendar dashboard</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Keyboard-first controls</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>AI CoPilot assistant</span>
                  </div>
                </div>

                <form action={connectGmail}>
                  <input type="hidden" name="userId" value={userId} />
                  <button
                    type="submit"
                    className="w-full py-3.5 px-5 bg-primary hover:bg-primary-light text-primary-foreground font-semibold rounded-xl
                               transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 cursor-pointer
                               hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    Connect Gmail to start
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                {...slideInRight}
                className="space-y-6"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-7 h-7 text-primary-light" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-text-primary">Connect Calendar</h2>
                    <p className="text-sm text-text-secondary mt-0.5">
                      View schedules, manage meetings, and use AI scheduling.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-success/10 border border-success/20 rounded-xl flex items-center gap-2.5 text-xs text-success">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>Gmail connected successfully</span>
                </div>

                <div className="bg-background/50 border border-border rounded-xl p-4 text-xs text-text-secondary space-y-2">
                  <p className="font-semibold text-text-primary text-sm mb-2">Calendar permissions:</p>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Read your calendar events and availability</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Create and modify events on your behalf</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Check attendee availability for smart scheduling</span>
                  </div>
                </div>

                <form action={connectCalendar}>
                  <input type="hidden" name="userId" value={userId} />
                  <button
                    type="submit"
                    className="w-full py-3.5 px-5 bg-primary hover:bg-primary-light text-primary-foreground font-semibold rounded-xl
                               transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 cursor-pointer
                               hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    Connect Google Calendar
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                {...slideInRight}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold text-text-primary">Personalize Valora</h2>
                  <p className="text-sm text-text-secondary mt-0.5">
                    Choose which features to activate for your command center.
                  </p>
                </div>

                <form action={completeOnboarding.bind(null, userId)} className="space-y-4">
                  <label className="flex items-start gap-4 p-4 bg-background/40 border border-border rounded-xl cursor-pointer hover:border-primary/40 transition-all">
                    <input
                      type="checkbox"
                      name="enableAI"
                      value="true"
                      defaultChecked
                      className="mt-1 accent-primary w-4 h-4 rounded border-border bg-background cursor-pointer"
                    />
                    <div>
                      <span className="font-semibold text-text-primary text-sm flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-primary-light" />
                        AI Priority Inbox
                      </span>
                      <p className="text-text-secondary text-xs mt-0.5 leading-relaxed">
                        Automatically tag emails with priority levels (Urgent, High, Normal, Low).
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-4 p-4 bg-background/40 border border-border rounded-xl cursor-pointer hover:border-primary/40 transition-all">
                    <input
                      type="checkbox"
                      name="enableShield"
                      value="true"
                      defaultChecked
                      className="mt-1 accent-primary w-4 h-4 rounded border-border bg-background cursor-pointer"
                    />
                    <div>
                      <span className="font-semibold text-text-primary text-sm flex items-center gap-1.5">
                        <Shield className="w-4 h-4 text-primary-light" />
                        Security Shield
                      </span>
                      <p className="text-text-secondary text-xs mt-0.5 leading-relaxed">
                        Detect and blur sensitive content (bank details, passwords, OTPs).
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-4 p-4 bg-background/40 border border-border rounded-xl cursor-pointer hover:border-primary/40 transition-all">
                    <input
                      type="checkbox"
                      name="enableShortcuts"
                      value="true"
                      defaultChecked
                      className="mt-1 accent-primary w-4 h-4 rounded border-border bg-background cursor-pointer"
                    />
                    <div>
                      <span className="font-semibold text-text-primary text-sm flex items-center gap-1.5">
                        <Keyboard className="w-4 h-4 text-primary-light" />
                        Keyboard Shortcuts
                      </span>
                      <p className="text-text-secondary text-xs mt-0.5 leading-relaxed">
                        Superhuman-grade keyboard controls: <kbd>E</kbd> to archive, <kbd>R</kbd> to reply.
                      </p>
                    </div>
                  </label>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-5 bg-gradient-to-r from-primary to-primary-light hover:brightness-110
                               text-primary-foreground font-semibold rounded-xl transition-all duration-200
                               flex items-center justify-center gap-2 shadow-lg shadow-primary/20 cursor-pointer
                               hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    Start Using Valora
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-error/10 border border-error/20 rounded-xl text-xs text-error"
            >
              <strong>Connection failed:</strong> {error}
            </motion.div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-text-muted">
          All integrations are stored securely and encrypted end-to-end.
        </p>
      </div>
    </main>
  )
}
