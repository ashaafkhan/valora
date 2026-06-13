import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="border-t border-white/[0.04] py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <Image src="/valora_logo.png" alt="Valora" width={28} height={28} className="object-contain" />
          <span className="font-display font-bold text-text-primary">Valora</span>
          <span className="text-text-muted text-sm">· Command your inbox. Own your time.</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-text-muted">
          <Link href="/privacy" className="hover:text-text-primary transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-text-primary transition-colors">Terms</Link>
          <a href="https://github.com/valorahq/valora" target="_blank" className="hover:text-text-primary transition-colors">GitHub</a>
          <a href="https://twitter.com/valorahq" target="_blank" className="hover:text-text-primary transition-colors">@valorahq</a>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-6 pt-6 border-t border-white/[0.04] text-center text-xs text-text-muted font-mono">
        &copy; 2026 Valora · Built at Corsair Hackathon · valorahq.in
      </div>
    </footer>
  )
}
