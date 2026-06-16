'use client'

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px]
                      bg-[radial-gradient(ellipse,rgba(0,102,255,0.18)_0%,transparent_70%)]
                      animate-[orbFloat_12s_ease-in-out_infinite]" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px]
                      bg-[radial-gradient(ellipse,rgba(99,102,241,0.12)_0%,transparent_70%)]
                      animate-[orbFloat_16s_ease-in-out_infinite_reverse]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                      w-[800px] h-[400px]
                      bg-[radial-gradient(ellipse,rgba(0,102,255,0.06)_0%,transparent_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,102,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,102,255,0.03)_1px,transparent_1px)]
                      bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black_30%,transparent_100%)]" />
    </div>
  )
}
