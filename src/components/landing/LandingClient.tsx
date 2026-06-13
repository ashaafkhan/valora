'use client'
import { useState } from 'react'
import { CopilotOrb } from './CopilotOrb'

export function LandingClient() {
  const [chatOpen, setChatOpen] = useState(false)
  return <CopilotOrb onOpen={() => setChatOpen(true)} />
}
